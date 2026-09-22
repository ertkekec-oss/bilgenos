import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import type { RequestTenantContext } from '@bilgenos/contracts';
import {
  AuthorizationKernel,
  MaskedNotFoundSecurityException,
  TenantContextEnforcer,
} from '@bilgenos/authorization';
import {
  globalDbStorage,
  InMemoryScopedLearnerRepository,
  InMemoryScopedPersonRepository,
  LearnerService,
  PersonService,
} from '@bilgenos/database';
import { CrossTenantViolationError } from '@bilgenos/domain';

describe('Milestone 1: Security & Cross-Tenant Boundary Verification', () => {
  const tenantAId = '11111111-1111-1111-1111-111111111111';
  const tenantBId = '22222222-2222-2222-2222-222222222222';
  const institutionAId = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const institutionBId = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const contextA: RequestTenantContext = {
    tenantId: tenantAId,
    userId: 'user-a-1',
    institutionId: institutionAId,
    roles: ['INSTITUTION_ADMIN'],
    permissions: [
      'person.read',
      'person.create',
      'person.update',
      'person.delete',
      'learner.read',
      'learner.create',
      'learner.update',
    ],
  };

  const contextB: RequestTenantContext = {
    tenantId: tenantBId,
    userId: 'user-b-1',
    institutionId: institutionBId,
    roles: ['INSTITUTION_ADMIN'],
    permissions: [
      'person.read',
      'person.create',
      'person.update',
      'person.delete',
      'learner.read',
      'learner.create',
      'learner.update',
    ],
  };

  let personRepoA: InMemoryScopedPersonRepository;
  let learnerRepoA: InMemoryScopedLearnerRepository;
  let personServiceA: PersonService;
  let learnerServiceA: LearnerService;

  let personRepoB: InMemoryScopedPersonRepository;
  let learnerRepoB: InMemoryScopedLearnerRepository;
  let personServiceB: PersonService;
  let learnerServiceB: LearnerService;

  let personAId: string;
  let learnerAId: string;
  let personBId: string;
  let learnerBId: string;

  beforeEach(async () => {
    globalDbStorage.clear();
    AuthorizationKernel.clearAuditLogs();

    personRepoA = new InMemoryScopedPersonRepository(contextA);
    learnerRepoA = new InMemoryScopedLearnerRepository(contextA);
    personServiceA = new PersonService(contextA, personRepoA);
    learnerServiceA = new LearnerService(contextA, learnerRepoA, personRepoA);

    personRepoB = new InMemoryScopedPersonRepository(contextB);
    learnerRepoB = new InMemoryScopedLearnerRepository(contextB);
    personServiceB = new PersonService(contextB, personRepoB);
    learnerServiceB = new LearnerService(contextB, learnerRepoB, personRepoB);

    // Seed Tenant A
    const personA = await personServiceA.createPerson({
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      nationalId: '12345678901',
    });
    personAId = personA.id;

    const learnerA = await learnerServiceA.createLearner({
      personId: personAId,
      institutionId: institutionAId,
      learnerNumber: 'STU-001',
    });
    learnerAId = learnerA.id;

    // Seed Tenant B
    const personB = await personServiceB.createPerson({
      firstName: 'Can',
      lastName: 'Demir',
      nationalId: '98765432109',
    });
    personBId = personB.id;

    const learnerB = await learnerServiceB.createLearner({
      personId: personBId,
      institutionId: institutionBId,
      learnerNumber: 'STU-999',
    });
    learnerBId = learnerB.id;
  });

  it('1. Invariant: NO TENANT CONTEXT = DENY', () => {
    assert.throws(
      () => TenantContextEnforcer.assertTenantContext(null),
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError);
        assert(err.message.includes('NO TENANT CONTEXT = DENY'));
        return true;
      }
    );

    assert.throws(
      () => TenantContextEnforcer.assertTenantContext({ tenantId: '', roles: [], permissions: [] }),
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError);
        return true;
      }
    );
  });

  it('2. Legitimate access within same tenant succeeds', async () => {
    const person = await personServiceA.getPersonById(personAId);
    assert.strictEqual(person.firstName, 'Ahmet');
    assert.strictEqual(person.tenantId, tenantAId);

    const learner = await learnerServiceA.getLearnerById(learnerAId);
    assert.strictEqual(learner.learnerNumber, 'STU-001');
    assert.strictEqual(learner.tenantId, tenantAId);
  });

  it('3. Cross-Tenant Attempt: Tenant A -> Person B READ (Masked as 404 without leaking existence)', async () => {
    await assert.rejects(
      async () => {
        await personServiceA.getPersonById(personBId);
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || err instanceof MaskedNotFoundSecurityException);
        return true;
      }
    );

    // Verify audit log captured the cross-tenant probe
    const auditLogs = AuthorizationKernel.getSecurityAuditLogs();
    const probeLog = auditLogs.find(
      (log) => log.tenantId === tenantAId && log.decision === 'DENY'
    );
    assert(probeLog, 'Security audit must record cross-tenant denial');
  });

  it('4. Cross-Tenant Attempt: Tenant A -> Learner B READ (Masked / Blocked)', async () => {
    await assert.rejects(
      async () => {
        await learnerServiceA.getLearnerById(learnerBId);
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || err instanceof MaskedNotFoundSecurityException);
        return true;
      }
    );
  });

  it('5. Cross-Tenant Attempt: Tenant A -> Person B UPDATE (Blocked)', async () => {
    await assert.rejects(
      async () => {
        await personServiceA.updatePerson(personBId, { firstName: 'Hacked' });
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || err instanceof MaskedNotFoundSecurityException);
        return true;
      }
    );

    // Verify Person B in Tenant B remained unchanged!
    const personB = await personServiceB.getPersonById(personBId);
    assert.strictEqual(personB.firstName, 'Can');
  });

  it('6. Cross-Tenant Attempt: Tenant A -> Learner B UPDATE (Blocked)', async () => {
    await assert.rejects(
      async () => {
        await learnerServiceA.updateLearner(learnerBId, { learnerNumber: 'HACKED-001' });
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || err instanceof MaskedNotFoundSecurityException);
        return true;
      }
    );

    // Verify Learner B in Tenant B remained unchanged!
    const learnerB = await learnerServiceB.getLearnerById(learnerBId);
    assert.strictEqual(learnerB.learnerNumber, 'STU-999');
  });

  it('7. Cross-Tenant Attempt: Tenant A -> Person B DELETE (Blocked)', async () => {
    await assert.rejects(
      async () => {
        await personServiceA.deletePerson(personBId);
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || err instanceof MaskedNotFoundSecurityException);
        return true;
      }
    );
  });

  it('8. Cross-Tenant Attempt: Tenant A -> Learner B Relation (Cross-Tenant FK creation blocked)', async () => {
    // Tenant A tries to create a learner pointing to Person B (which belongs to Tenant B)
    await assert.rejects(
      async () => {
        await learnerServiceA.createLearner({
          personId: personBId,
          institutionId: institutionAId,
          learnerNumber: 'STU-CROSS-001',
        });
      },
      (err: Error) => {
        assert(err instanceof CrossTenantViolationError || (err as Error).message.includes('not found') || (err as Error).message.includes('Cross-Tenant'));
        return true;
      }
    );
  });
});
