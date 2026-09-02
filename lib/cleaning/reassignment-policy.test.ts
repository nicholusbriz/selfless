import assert from 'node:assert/strict';
import test from 'node:test';
import { ReassignmentError } from './reassignment-errors';
import {
  assertReassignmentAllowed,
  getReassignmentAllowance,
  MAX_REASSIGNMENT_CHANGES,
} from './reassignment-policy';

const validRequest = {
  changesUsed: 0,
  currentDayId: 'old-day',
  replacementDayId: 'new-day',
  userTechCenterId: 'center-a',
  replacementTechCenterId: 'center-a',
  weekIsActive: true,
  registrationDeadline: new Date('2030-01-02T00:00:00.000Z'),
  replacementStatus: 'OPEN' as const,
  replacementDate: new Date('2030-01-03T00:00:00.000Z'),
  replacementRegistrations: 2,
  replacementCapacity: 5,
  currentDayRegistrations: 5,
  now: new Date('2030-01-01T00:00:00.000Z'),
};

function expectCode(
  operation: () => void,
  expectedCode: string,
) {
  assert.throws(
    operation,
    (error: unknown) =>
      error instanceof ReassignmentError &&
      error.code === expectedCode,
  );
}

test('initial assignment starts with zero changes used', () => {
  assert.deepEqual(getReassignmentAllowance(0), {
    changesUsed: 0,
    maximumChanges: 3,
    changesRemaining: 3,
    canReassign: true,
  });
});

for (const changesUsed of [0, 1, 2]) {
  test(`permits successful change ${changesUsed + 1}`, () => {
    assert.doesNotThrow(() =>
      assertReassignmentAllowed({
        ...validRequest,
        changesUsed,
      }),
    );

    assert.deepEqual(
      getReassignmentAllowance(changesUsed + 1),
      {
        changesUsed: changesUsed + 1,
        maximumChanges: MAX_REASSIGNMENT_CHANGES,
        changesRemaining: 2 - changesUsed,
        canReassign: changesUsed + 1 < MAX_REASSIGNMENT_CHANGES,
      },
    );
  });
}

test('rejects a fourth reassignment', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        changesUsed: 3,
      }),
    'CHANGE_LIMIT_REACHED',
  );
});

test('rejected validation leaves the supplied counter unchanged', () => {
  const changesUsed = 1;

  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        changesUsed,
        replacementStatus: 'FULL',
      }),
    'DAY_NOT_OPEN',
  );

  assert.equal(changesUsed, 1);
  assert.equal(
    getReassignmentAllowance(changesUsed).changesRemaining,
    2,
  );
});

test('unchanged selection is rejected without consuming allowance', () => {
  const changesUsed = 2;

  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        changesUsed,
        replacementDayId: validRequest.currentDayId,
      }),
    'SAME_ASSIGNMENT',
  );

  assert.equal(
    getReassignmentAllowance(changesUsed).changesRemaining,
    1,
  );
});

test('cross-tech-center replacement is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        replacementTechCenterId: 'center-b',
      }),
    'TECH_CENTER_MISMATCH',
  );
});

test('missing user tech-center scope is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        userTechCenterId: null,
      }),
    'TECH_CENTER_MISMATCH',
  );
});

test('closed registration week is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        weekIsActive: false,
      }),
    'REGISTRATION_CLOSED',
  );
});

test('passed registration deadline is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        now: new Date('2030-01-03T00:00:00.000Z'),
      }),
    'DEADLINE_PASSED',
  );
});

test('closed replacement day is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        replacementStatus: 'CLOSED',
      }),
    'DAY_NOT_OPEN',
  );
});

test('past replacement date is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        replacementDate: new Date('2029-12-31T00:00:00.000Z'),
      }),
    'PAST_CLEANING_DATE',
  );
});

test('full replacement day is rejected', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        replacementRegistrations: 5,
      }),
    'DAY_AT_CAPACITY',
  );
});

test('current day minimum participant rule is preserved', () => {
  expectCode(
    () =>
      assertReassignmentAllowed({
        ...validRequest,
        currentDayRegistrations: 4,
      }),
    'MINIMUM_PARTICIPANTS',
  );
});

test('negative persisted values are safely normalized for display', () => {
  assert.deepEqual(getReassignmentAllowance(-1), {
    changesUsed: 0,
    maximumChanges: 3,
    changesRemaining: 3,
    canReassign: true,
  });
});

test('values above the limit never produce a negative remainder', () => {
  assert.deepEqual(getReassignmentAllowance(5), {
    changesUsed: 5,
    maximumChanges: 3,
    changesRemaining: 0,
    canReassign: false,
  });
});
