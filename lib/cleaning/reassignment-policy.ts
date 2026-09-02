import { ReassignmentError } from './reassignment-errors';

export const MAX_REASSIGNMENT_CHANGES = 3;
export const MINIMUM_DAY_PARTICIPANTS = 4;

export function getReassignmentAllowance(changesUsed: number) {
  const normalizedChanges = Math.max(0, changesUsed);
  return {
    changesUsed: normalizedChanges,
    maximumChanges: MAX_REASSIGNMENT_CHANGES,
    changesRemaining: Math.max(0, MAX_REASSIGNMENT_CHANGES - normalizedChanges),
    canReassign: normalizedChanges < MAX_REASSIGNMENT_CHANGES,
  };
}

export function assertReassignmentAllowed(input: {
  changesUsed: number;
  currentDayId: string;
  replacementDayId: string;
  userTechCenterId: string | null;
  replacementTechCenterId: string;
  weekIsActive: boolean;
  registrationDeadline: Date;
  replacementStatus: 'OPEN' | 'CLOSED' | 'FULL';
  replacementDate: Date;
  replacementRegistrations: number;
  replacementCapacity: number;
  currentDayRegistrations: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  if (input.changesUsed >= MAX_REASSIGNMENT_CHANGES) throw new ReassignmentError('CHANGE_LIMIT_REACHED', 'You have used all three permitted assignment changes.', 409);
  if (input.currentDayId === input.replacementDayId) throw new ReassignmentError('SAME_ASSIGNMENT', 'The selected cleaning day is already assigned.', 409);
  if (!input.userTechCenterId || input.replacementTechCenterId !== input.userTechCenterId) throw new ReassignmentError('TECH_CENTER_MISMATCH', 'The selected cleaning day is not available for your tech center.', 403);
  if (!input.weekIsActive) throw new ReassignmentError('REGISTRATION_CLOSED', 'Registration is closed for this week.', 409);
  if (now > input.registrationDeadline) throw new ReassignmentError('DEADLINE_PASSED', 'The registration deadline has passed.', 409);
  if (input.replacementStatus !== 'OPEN') throw new ReassignmentError('DAY_NOT_OPEN', 'The selected cleaning day is not open.', 409);
  if (input.replacementDate < now) throw new ReassignmentError('PAST_CLEANING_DATE', 'A past cleaning date cannot be selected.', 409);
  if (input.replacementRegistrations >= input.replacementCapacity) throw new ReassignmentError('DAY_AT_CAPACITY', 'The selected cleaning day has no available capacity.', 409);
  if (input.currentDayRegistrations <= MINIMUM_DAY_PARTICIPANTS) throw new ReassignmentError('MINIMUM_PARTICIPANTS', 'Moving would reduce the current day below the required minimum of four students.', 409);
}
