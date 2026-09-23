import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import type { RequestTenantContext, UUID } from '@bilgenos/contracts';
import {
  globalDbStorage,
  InMemoryScopedLeadRepository,
  AdmissionsService,
} from '@bilgenos/database';
import { Lead, AdmissionApplication, DomainError } from '@bilgenos/domain';

describe('Phase 2: Admissions & CRM Domain Verification', () => {
  const tenantA: UUID = '10000000-0000-0000-0000-000000000001';
  const tenantB: UUID = '20000000-0000-0000-0000-000000000002';
  const instA: UUID = '10000000-0000-0000-0000-000000000010';

  const contextA: RequestTenantContext = {
    tenantId: tenantA,
    userId: '11111111-1111-1111-1111-111111111111',
    roles: ['ADMINISTRATOR'],
    permissions: ['admissions.manage'],
  };

  const contextB: RequestTenantContext = {
    tenantId: tenantB,
    userId: '22222222-2222-2222-2222-222222222222',
    roles: ['ADMINISTRATOR'],
    permissions: ['admissions.manage'],
  };

  let leadRepoA: InMemoryScopedLeadRepository;
  let admissionsServiceA: AdmissionsService;

  beforeEach(() => {
    globalDbStorage.clear();
    leadRepoA = new InMemoryScopedLeadRepository(contextA);
    admissionsServiceA = new AdmissionsService(contextA, leadRepoA);
  });

  test('1. Lead Lifecycle: NEW -> CONTACTED -> QUALIFIED -> APPLICATION -> OFFERED -> WON', async () => {
    const candidateId = nodeCrypto.randomUUID();
    const created = await admissionsServiceA.createLead({
      institutionId: instA,
      candidatePersonId: candidateId,
      source: 'WEBSITE',
      notesSummary: 'Veli telefonla arayarak 10. sınıf bursluluk hakkında bilgi istedi.',
    });

    assert.equal(created.status, 'NEW');
    assert.equal(created.source, 'WEBSITE');

    const domainLead = new Lead({
      id: created.id,
      tenantId: contextA.tenantId,
      institutionId: instA,
      candidatePersonId: candidateId,
      source: 'WEBSITE',
      status: 'NEW',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    domainLead.contact();
    assert.equal(domainLead.currentStatus, 'CONTACTED');

    domainLead.qualify();
    assert.equal(domainLead.currentStatus, 'QUALIFIED');

    domainLead.markApplicationCreated();
    assert.equal(domainLead.currentStatus, 'APPLICATION');

    domainLead.markOfferPresented();
    assert.equal(domainLead.currentStatus, 'OFFERED');

    domainLead.win();
    assert.equal(domainLead.currentStatus, 'WON');
  });

  test('2. AdmissionApplication Lifecycle: DRAFT -> SUBMITTED -> APPROVED -> CONVERTED', () => {
    const app = new AdmissionApplication({
      id: nodeCrypto.randomUUID(),
      tenantId: contextA.tenantId,
      institutionId: instA,
      leadId: nodeCrypto.randomUUID(),
      candidatePersonId: nodeCrypto.randomUUID(),
      status: 'DRAFT',
    });

    assert.equal(app.currentStatus, 'DRAFT');

    app.submit();
    assert.equal(app.currentStatus, 'SUBMITTED');

    app.approve();
    assert.equal(app.currentStatus, 'APPROVED');

    app.convertToRegistration();
    assert.equal(app.currentStatus, 'CONVERTED');
  });

  test('3. Cross-Tenant Attempt: Tenant B cannot access Tenant A Lead', async () => {
    const leadRepoB = new InMemoryScopedLeadRepository(contextB);

    const leadA = await leadRepoA.create({
      id: nodeCrypto.randomUUID(),
      institutionId: instA,
      source: 'WALK_IN',
      status: 'NEW',
    });

    await assert.rejects(
      async () => {
        await leadRepoB.findById(leadA.id);
      },
      /Cross-Tenant Leak Prevented/,
      'Cross-tenant lead read must be prevented by scoped repository'
    );
  });
});
