import { endOfDayEAT, startOfDayEAT } from '@/lib/english-hub/datetime';

export interface RegistrationStatus {
  status: 'OPEN' | 'CLOSED' | 'NOT_YET_OPEN' | 'NOT_AVAILABLE' | 'PAST_DEADLINE';
  message: string;
  canRegister: boolean;
  expiresAt?: Date;
}

export interface OverrideSnapshot {
  manuallyOpened: boolean;
  manuallyClosed: boolean;
  manualOverrideAt: Date | null;
  sessionDate: Date;
}

export function getRegistrationStatus(
  override?: OverrideSnapshot | null,
  now: Date = new Date()
): RegistrationStatus {
  const sessionDate = override?.sessionDate ?? startOfDayEAT(now);

  if (override?.manuallyClosed) {
    return {
      status: 'CLOSED',
      message: 'Registration closed by tutor/manager',
      canRegister: false,
    };
  }

  if (override?.manuallyOpened && override.manualOverrideAt) {
    const twoHoursLater = new Date(override.manualOverrideAt.getTime() + 2 * 60 * 60 * 1000);
    const expiresAt = new Date(Math.min(twoHoursLater.getTime(), endOfDayEAT(sessionDate).getTime()));

    if (now.getTime() < expiresAt.getTime()) {
      return {
        status: 'OPEN',
        message: 'Registration reopened by tutor/manager',
        canRegister: true,
        expiresAt,
      };
    }
  }

  const dayOfWeek = sessionDate.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      status: 'NOT_AVAILABLE',
      message: 'English Hub not available on weekends',
      canRegister: false,
    };
  }

  const eatNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const minuteOfDay = eatNow.getUTCHours() * 60 + eatNow.getUTCMinutes();
  const registrationStart = 13 * 60 + 30;
  const registrationEnd = 14 * 60;

  if (minuteOfDay < registrationStart) {
    return {
      status: 'NOT_YET_OPEN',
      message: 'Registration window: 1:30 PM to 2:00 PM',
      canRegister: false,
    };
  }

  if (minuteOfDay < registrationEnd) {
    return {
      status: 'OPEN',
      message: 'Registration is open',
      canRegister: true,
    };
  }

  return {
    status: 'CLOSED',
    message: 'Registration closed for today',
    canRegister: false,
  };
}
