import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import type { RequestTenantContext } from '@bilgenos/contracts';
import { MaskedNotFoundSecurityException } from '@bilgenos/authorization';
import {
  globalDbStorage,
  InMemoryScopedEnrollmentRepository,
  InMemoryScopedLearnerRepository,
  InMemoryScopedPersonRepository,
  EnrollmentService,
  LearnerService,
  PersonService,
} from '@bilgenos/database';
import { InvalidStateTransitionError } from '@bilgenos/domain';

describe('Milestone 2: Education Structure, Enrollment Aggregate & Transfer Verification', () => {
  const tenantAId = '11111111-1111-1111-1111-111111111111';
  const tenantBId = '22222222-2222-2222-2222-222222222222';
  const institutionAId = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const programMathId = 'prog-math-1';
  const programEnglishId = 'prog-eng-2';
  const cohortK12A = 'cohort-10a';

  const contextA: RequestTenantContext = {
    tenantId: tenantAId,
    userId: 'user-a-1',
    institutionId: institutionAId,
    roles: ['INSTITUTION_ADMIN'],
    permissions: [
      'person.read',
      'person.create',
      'learner.read',
      'learner.create',
      'enrollment.read',
      'enrollment.create',
      'enrollment.submit',
      'enrollment.activate',
      'enrollment.complete',
      'enrollment.transfer',
    ],
  };

  const contextB: RequestTenantContext = {
    tenantId: tenantBId,
    userId: 'user-b-1',
    roles: ['INSTITUTION_ADMIN'],
    permissions: ['enrollment.read'],
  };

  let personRepoA: InMemoryScopedPersonRepository;
  let learnerRepoA: InMemoryScopedLearnerRepository;
  let enrollmentRepoA: InMemoryScopedEnrollmentRepository;
  let enrollmentServiceA: EnrollmentService;
  let learnerAId: string;

  beforeEach(async () => {
    globalDbStorage.clear();

    personRepoA = new InMemoryScopedPersonRepository(contextA);
    learnerRepoA = new InMemoryScopedLearnerRepository(contextA);
    enrollmentRepoA = new InMemoryScopedEnrollmentRepository(contextA);

    const personServiceA = new PersonService(contextA, personRepoA);
    const learnerServiceA = new LearnerService(contextA, learnerRepoA, personRepoA);
    enrollmentServiceA = new EnrollmentService(contextA, enrollmentRepoA, learnerRepoA);

    const person = await personServiceA.createPerson({
      firstName: 'Zeynep',
      lastName: 'Kaya',
    });

    const learner = await learnerServiceA.createLearner({
      personId: person.id,
      institutionId: institutionAId,
      learnerNumber: 'STU-ZEYNEP-01',
    });
    learnerAId = learner.id;
  });

  it('1. Birebir Eğitim: cohortId = undefined/null creates valid Enrollment without fake dummy group', async () => {
    const enrollment = await enrollmentServiceA.createEnrollment({
      institutionId: institutionAId,
      programId: programMathId,
      learnerId: learnerAId,
      cohortId: undefined, // Birebir özel ders seansı
      startDate: new Date().toISOString(),
    });

    assert(enrollment.id);
    assert.strictEqual(enrollment.cohortId, undefined);
    assert.strictEqual(enrollment.status, 'DRAFT');
  });

  it('2. Standard Enrollment Lifecycle: DRAFT -> PENDING -> ACTIVE -> COMPLETED', async () => {
    const draft = await enrollmentServiceA.createEnrollment({
      institutionId: institutionAId,
      programId: programMathId,
      cohortId: cohortK12A,
      learnerId: learnerAId,
      startDate: new Date().toISOString(),
    });

    assert.strictEqual(draft.status, 'DRAFT');

    const pending = await enrollmentServiceA.submitEnrollment(draft.id);
    assert.strictEqual(pending.status, 'PENDING');

    const active = await enrollmentServiceA.activateEnrollment(pending.id);
    assert.strictEqual(active.status, 'ACTIVE');

    const completed = await enrollmentServiceA.completeEnrollment(active.id);
    assert.strictEqual(completed.status, 'COMPLETED');
    assert(completed.actualEndDate);
  });

  it('3. Invariant: COMPLETED -> ACTIVE direct reactivation is strictly FORBIDDEN', async () => {
    const draft = await enrollmentServiceA.createEnrollment({
      institutionId: institutionAId,
      programId: programMathId,
      learnerId: learnerAId,
      startDate: new Date().toISOString(),
    });

    const pending = await enrollmentServiceA.submitEnrollment(draft.id);
    const active = await enrollmentServiceA.activateEnrollment(pending.id);
    const completed = await enrollmentServiceA.completeEnrollment(active.id);

    // Attempt direct reactivation
    await assert.rejects(
      async () => {
        await enrollmentServiceA.activateEnrollment(completed.id);
      },
      (err: Error) => {
        assert(err instanceof InvalidStateTransitionError);
        assert(err.message.includes('A completed enrollment cannot be reactivated directly'));
        return true;
      }
    );
  });

  it('4. Historical Transfer: Enrollment A (ACTIVE) -> TRANSFERRED creates Enrollment B (ACTIVE) with lineage', async () => {
    const draft = await enrollmentServiceA.createEnrollment({
      institutionId: institutionAId,
      programId: programMathId,
      cohortId: cohortK12A,
      learnerId: learnerAId,
      startDate: new Date().toISOString(),
    });

    const pending = await enrollmentServiceA.submitEnrollment(draft.id);
    const activeSource = await enrollmentServiceA.activateEnrollment(pending.id);

    // Execute Transfer to a new Program / Cohort
    const result = await enrollmentServiceA.transferEnrollment(activeSource.id, {
      targetProgramId: programEnglishId,
      targetCohortId: 'cohort-eng-b1',
      reason: 'Aile talebi üzerine dil programına geçiş.',
    });

    // 1. Source Enrollment must be marked TRANSFERRED (Terminal status)
    assert.strictEqual(result.sourceEnrollment.status, 'TRANSFERRED');
    assert.strictEqual(result.sourceEnrollment.transferDetails?.targetCohortId, 'cohort-eng-b1');
    assert(result.sourceEnrollment.actualEndDate);

    // 2. Target Enrollment must be ACTIVE and preserve lineage
    assert.strictEqual(result.targetEnrollment.status, 'ACTIVE');
    assert.strictEqual(result.targetEnrollment.programId, programEnglishId);
    assert.strictEqual(result.targetEnrollment.cohortId, 'cohort-eng-b1');
    assert.strictEqual(
      (result.targetEnrollment.metadata as Record<string, unknown>)?.transferredFromEnrollmentId,
      activeSource.id
    );

    // Verify persistence in repository
    const fetchedSource = await enrollmentServiceA.getEnrollmentById(activeSource.id);
    assert.strictEqual(fetchedSource.status, 'TRANSFERRED');

    const fetchedTarget = await enrollmentServiceA.getEnrollmentById(result.targetEnrollment.id);
    assert.strictEqual(fetchedTarget.status, 'ACTIVE');
  });

  it('5. Cross-Tenant Attempt: Tenant B cannot access Tenant A Enrollment (Masked as 404)', async () => {
    const draft = await enrollmentServiceA.createEnrollment({
      institutionId: institutionAId,
      programId: programMathId,
      learnerId: learnerAId,
      startDate: new Date().toISOString(),
    });

    const enrollmentRepoB = new InMemoryScopedEnrollmentRepository(contextB);
    const learnerRepoB = new InMemoryScopedLearnerRepository(contextB);
    const enrollmentServiceB = new EnrollmentService(contextB, enrollmentRepoB, learnerRepoB);

    await assert.rejects(
      async () => {
        await enrollmentServiceB.getEnrollmentById(draft.id);
      },
      (err: Error) => {
        assert(err instanceof MaskedNotFoundSecurityException || err.message.includes('not found') || err.message.includes('Cross-Tenant'));
        return true;
      }
    );
  });
});
