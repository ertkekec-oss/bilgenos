import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import type { RequestTenantContext, UUID } from '@bilgenos/contracts';
import {
  globalDbStorage,
  InMemoryScopedCommercialRegistrationRepository,
  InMemoryScopedExternalMappingRepository,
  IntegrationHubService,
} from '@bilgenos/database';
import {
  IdentityResolver,
  BilgenOkulAdapter,
  MockProviderWebhookStrategy,
  DomainError,
} from '@bilgenos/domain';
import type { WebhookVerificationStrategy } from '@bilgenos/domain';

describe('Phase 2: BilgenOkul Integration Hub Verification', () => {
  const tenantA: UUID = '10000000-0000-0000-0000-000000000001';
  const tenantB: UUID = '20000000-0000-0000-0000-000000000002';
  const connectionIdA: UUID = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';

  const contextA: RequestTenantContext = {
    tenantId: tenantA,
    userId: '11111111-1111-1111-1111-111111111111',
    roles: ['ADMINISTRATOR'],
    permissions: ['integration.manage'],
  };

  let mappingRepoA: InMemoryScopedExternalMappingRepository;
  let regRepoA: InMemoryScopedCommercialRegistrationRepository;

  beforeEach(() => {
    globalDbStorage.clear();
    mappingRepoA = new InMemoryScopedExternalMappingRepository(contextA);
    regRepoA = new InMemoryScopedCommercialRegistrationRepository(contextA);
  });

  test('1. Binding Constraint #2: Identity Resolution Strategy (EXACT_MATCH -> map, NOT_FOUND -> create -> map, AMBIGUOUS -> STOP)', () => {
    // 1.1 EXACT MATCH
    const exactResult = IdentityResolver.evaluateCandidates([
      { externalId: 'BOKUL-101', confidence: 'EXACT' },
    ]);
    assert.equal(exactResult.decision, 'EXACT_MATCH');
    assert.equal(exactResult.matchedExternalId, 'BOKUL-101');

    // 1.2 NOT FOUND
    const notFoundResult = IdentityResolver.evaluateCandidates([]);
    assert.equal(notFoundResult.decision, 'NOT_FOUND');

    // 1.3 AMBIGUOUS - Multiple candidates
    const multipleCandidatesResult = IdentityResolver.evaluateCandidates([
      { externalId: 'BOKUL-101', confidence: 'EXACT' },
      { externalId: 'BOKUL-102', confidence: 'EXACT' },
    ]);
    assert.equal(multipleCandidatesResult.decision, 'AMBIGUOUS');

    // 1.4 AMBIGUOUS - Weak/fuzzy match (no automatic merge allowed!)
    const weakCandidateResult = IdentityResolver.evaluateCandidates([
      { externalId: 'BOKUL-200', confidence: 'WEAK' },
    ]);
    assert.equal(
      weakCandidateResult.decision,
      'AMBIGUOUS',
      'Weak or fuzzy candidates must resolve to AMBIGUOUS and stop without auto-merge'
    );
  });

  test('2. Transport Blocker Verification: BilgenOkul real transport marked BLOCKED BY API DOCUMENTATION', () => {
    assert.equal(
      BilgenOkulAdapter.TRANSPORT_STATUS,
      'BILGENOKUL LIVE INTEGRATION — BLOCKED BY API DOCUMENTATION',
      'Real BilgenOkul transport must be explicitly marked as blocked without fabricated endpoints'
    );
  });

  test('3. Binding Constraint #3: Provider-Independent Webhook Verification Strategy', async () => {
    const hubService = new IntegrationHubService(
      contextA,
      mappingRepoA,
      regRepoA,
      new BilgenOkulAdapter()
    );

    const customStrategy: WebhookVerificationStrategy = {
      async verify(ctx) {
        return ctx.headers['x-custom-signature'] === 'valid-secret-signature';
      },
    };

    // Valid webhook
    const valid = await hubService.processInboundWebhook(
      'BILGEN_OKUL',
      customStrategy,
      { 'x-custom-signature': 'valid-secret-signature' },
      JSON.stringify({ event: 'student.updated' })
    );
    assert.equal(valid, true);

    // Invalid webhook
    await assert.rejects(
      async () => {
        await hubService.processInboundWebhook(
          'BILGEN_OKUL',
          customStrategy,
          { 'x-custom-signature': 'tampered-signature' },
          JSON.stringify({ event: 'student.updated' })
        );
      },
      /Inbound webhook verification failed/,
      'Tampered webhook signature must be rejected'
    );
  });

  test('4. ExternalEntityMapping Scoped Uniqueness and Ambiguity Prevention', async () => {
    const personId = nodeCrypto.randomUUID();
    const externalStudentId = 'BOKUL-STU-001';

    // First mapping succeeds
    await mappingRepoA.create({
      id: nodeCrypto.randomUUID(),
      integrationConnectionId: connectionIdA,
      localEntityType: 'PERSON',
      localEntityId: personId,
      externalEntityType: 'BILGEN_OKUL_STUDENT',
      externalEntityId: externalStudentId,
      syncStatus: 'SYNCED',
    });

    // Duplicate mapping for same person must fail!
    await assert.rejects(
      async () => {
        await mappingRepoA.create({
          id: nodeCrypto.randomUUID(),
          integrationConnectionId: connectionIdA,
          localEntityType: 'PERSON',
          localEntityId: personId,
          externalEntityType: 'BILGEN_OKUL_STUDENT',
          externalEntityId: 'BOKUL-STU-999',
        });
      },
      /Unique mapping violation/,
      'Mapping uniqueness must prevent mapping one local entity to multiple external entities'
    );
  });

  test('5. End-to-End Provisioning Flow: NOT_FOUND creates new BilgenOkul mapping and sets SYNCED', async () => {
    const candidatePersonId = nodeCrypto.randomUUID();
    const reg = await regRepoA.create({
      id: nodeCrypto.randomUUID(),
      institutionId: nodeCrypto.randomUUID(),
      candidatePersonId,
      financialResponsiblePersonId: nodeCrypto.randomUUID(),
      status: 'READY',
      integrationStatus: 'PENDING',
    });

    const mockExternalDirectory = new Map();
    const adapter = new BilgenOkulAdapter(mockExternalDirectory);

    const hubService = new IntegrationHubService(contextA, mappingRepoA, regRepoA, adapter);

    const result = await hubService.processProvisioning(
      connectionIdA,
      reg.id,
      { fullName: 'Mert Aksoy', nationalId: '12345678901' }
    );

    assert.equal(result.status, 'SYNCED');
    assert.ok(result.externalId?.startsWith('BOKUL-STU-'));

    // Verify mapping was stored
    const mapping = await mappingRepoA.findByLocal(connectionIdA, 'PERSON', candidatePersonId);
    assert.ok(mapping);
    assert.equal(mapping?.externalEntityId, result.externalId);
    assert.equal(mapping?.syncStatus, 'SYNCED');

    // Verify registration status in repo was updated to SYNCED
    const updatedReg = await regRepoA.findById(reg.id);
    assert.equal(updatedReg?.integrationStatus, 'SYNCED');
  });

  test('6. End-to-End Provisioning Flow: AMBIGUOUS match triggers CONFLICT and does NOT rollback registration', async () => {
    const candidatePersonId = nodeCrypto.randomUUID();
    const reg = await regRepoA.create({
      id: nodeCrypto.randomUUID(),
      institutionId: nodeCrypto.randomUUID(),
      candidatePersonId,
      financialResponsiblePersonId: nodeCrypto.randomUUID(),
      status: 'ACTIVE',
      integrationStatus: 'PENDING',
    });

    // Provide ambiguous candidates in external directory
    const mockExternalDirectory = new Map();
    mockExternalDirectory.set('Ahmet Yılmaz', [
      { externalId: 'BOKUL-STU-100', confidence: 'EXACT' },
      { externalId: 'BOKUL-STU-200', confidence: 'EXACT' },
    ]);

    const adapter = new BilgenOkulAdapter(mockExternalDirectory);
    const hubService = new IntegrationHubService(contextA, mappingRepoA, regRepoA, adapter);

    const result = await hubService.processProvisioning(
      connectionIdA,
      reg.id,
      { fullName: 'Ahmet Yılmaz' }
    );

    assert.equal(result.status, 'CONFLICT');
    assert.ok(result.conflictReason?.includes('AMBIGUOUS'));

    // Verify registration business status is still ACTIVE!
    const updatedReg = await regRepoA.findById(reg.id);
    assert.equal(updatedReg?.status, 'ACTIVE');
    assert.equal(updatedReg?.integrationStatus, 'CONFLICT');
  });
});
