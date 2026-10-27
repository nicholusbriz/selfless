/**
 * Returns the start of the given date in UTC.
 */
export function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Returns the final millisecond of the given date in UTC.
 */
export function endOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

/**
 * Returns the given UTC date at the specified number of minutes after midnight.
 */
export function atUTCMinutes(date: Date, minutesFromMidnight: number): Date {
  const result = startOfDayUTC(date);
  result.setUTCMinutes(minutesFromMidnight);
  return result;
}

/**
 * Returns the start of the date in East Africa Time as a UTC-midnight date key.
 */
export function startOfDayEAT(date: Date): Date {
  const eatDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return startOfDayUTC(eatDate);
}

/**
 * Returns the final millisecond of the date in East Africa Time.
 */
export function endOfDayEAT(date: Date): Date {
  return new Date(startOfDayEAT(date).getTime() + 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000 - 1);
}

/**
 * Returns the given date at the specified number of minutes after midnight EAT.
 */
export function atEATMinutes(date: Date, minutesFromMidnight: number): Date {
  return new Date(startOfDayEAT(date).getTime() + minutesFromMidnight * 60 * 1000 - 3 * 60 * 60 * 1000);
}
