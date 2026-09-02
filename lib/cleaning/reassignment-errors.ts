export type ReassignmentErrorCode =
  | 'REGISTRATION_NOT_FOUND'
  | 'NEW_DAY_REQUIRED'
  | 'SAME_ASSIGNMENT'
  | 'CHANGE_LIMIT_REACHED'
  | 'TECH_CENTER_MISMATCH'
  | 'REGISTRATION_CLOSED'
  | 'DEADLINE_PASSED'
  | 'DAY_NOT_OPEN'
  | 'PAST_CLEANING_DATE'
  | 'DAY_AT_CAPACITY'
  | 'MINIMUM_PARTICIPANTS'
  | 'REASSIGNMENT_CONFLICT';

export class ReassignmentError extends Error {
  constructor(
    public readonly code: ReassignmentErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ReassignmentError';
  }
}
