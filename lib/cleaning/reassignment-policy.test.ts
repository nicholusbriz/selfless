import assert from 'node:assert/strict';
import test from 'node:test';
import { ReassignmentError } from './reassignment-errors';
import { assertReassignmentAllowed, getReassignmentAllowance } from './reassignment-policy';

const valid = {
  changesUsed: 0,
  currentDayId: 'old',
  replacementDayId: 'new',
  userTechCenterId: 'center',
  replacementTechCenterId: 'center',
  weekIsActive: true,
  registrationDeadline: new Date('2030-01-02T00:00:00Z'),
  replacementStatus: 'OPEN' as const,
  replacementDate: new Date('2030-01-03T00:00:00Z'),
  replacementRegistrations: 2,
  replacementCapacity: 5,
  currentDayRegistrations: 5,
  now: new Date('2030-01-01T00:00:00Z'),
};

for (const used of [0, 1, 2]) test(`allows successful change ${used + 1}`, () => assert.doesNotThrow(() => assertReassignmentAllowed({ ...valid, changesUsed: used })));
test('reports allowance accurately', () => assert.deepEqual(getReassignmentAllowance(2), { changesUsed: 2, maximumChanges: 3, changesRemaining: 1, canReassign: true }));
test('rejects fourth change', () => assert.throws(() => assertReassignmentAllowed({ ...valid, changesUsed: 3 }), (error) => error instanceof ReassignmentError && error.code === 'CHANGE_LIMIT_REACHED'));
test('rejects unchanged selection', () => assert.throws(() => assertReassignmentAllowed({ ...valid, replacementDayId: 'old' }), (error) => error instanceof ReassignmentError && error.code === 'SAME_ASSIGNMENT'));
test('rejects cross-center selection', () => assert.throws(() => assertReassignmentAllowed({ ...valid, replacementTechCenterId: 'other' }), (error) => error instanceof ReassignmentError && error.code === 'TECH_CENTER_MISMATCH'));
test('rejects closed registration', () => assert.throws(() => assertReassignmentAllowed({ ...valid, weekIsActive: false }), (error) => error instanceof ReassignmentError && error.code === 'REGISTRATION_CLOSED'));
test('rejects full capacity', () => assert.throws(() => assertReassignmentAllowed({ ...valid, replacementRegistrations: 5 }), (error) => error instanceof ReassignmentError && error.code === 'DAY_AT_CAPACITY'));
test('preserves minimum participants', () => assert.throws(() => assertReassignmentAllowed({ ...valid, currentDayRegistrations: 4 }), (error) => error instanceof ReassignmentError && error.code === 'MINIMUM_PARTICIPANTS'));
