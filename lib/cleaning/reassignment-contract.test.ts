import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function source(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const changeRoute = source(
  'app/api/cleaning/change-day/route.ts',
);
const registrationRoute = source(
  'app/api/cleaning/register/route.ts',
);
const studentRoute = source(
  'app/api/cleaning/student/route.ts',
);
const studentHook = source(
  'hooks/useCleaningStudent.ts',
);
const cleaningPage = source(
  'app/dashboard/cleaning/page.tsx',
);
const schema = source('prisma/schema.prisma');

test('identity is obtained from the authenticated server session', () => {
  assert.match(changeRoute, /getServerSession\(authOptions\)/);
  assert.match(changeRoute, /session\?\.user\?\.id/);
});

test('unauthorized reassignment returns 401', () => {
  assert.match(changeRoute, /code:\s*'UNAUTHORIZED'/);
  assert.match(changeRoute, /status:\s*401/);
});

test('caller-supplied ownership is rejected', () => {
  assert.match(changeRoute, /body\.userId\s*!==\s*undefined/);
  assert.match(
    changeRoute,
    /CALLER_OWNERSHIP_REJECTED/,
  );
});

test('registration ownership uses the authenticated user', () => {
  assert.match(
    changeRoute,
    /where:\s*{\s*userId:\s*user\.id\s*}/,
  );
});

test('tenant scope is checked against the replacement day', () => {
  assert.match(
    changeRoute,
    /replacementTechCenterId:\s*replacementDay\.techCenterId/,
  );
  assert.match(
    changeRoute,
    /userTechCenterId:\s*user\.techCenterId/,
  );
});

test('counter and assignment use a conditional atomic update', () => {
  assert.match(
    changeRoute,
    /cleaningRegistration\.updateMany/,
  );
  assert.match(
    changeRoute,
    /reassignmentCount:\s*registration\.reassignmentCount/,
  );
  assert.match(
    changeRoute,
    /reassignmentCount:\s*{\s*increment:\s*1\s*}/,
  );
  assert.match(changeRoute, /updateResult\.count\s*!==\s*1/);
  assert.match(changeRoute, /REASSIGNMENT_CONFLICT/);
});

test('capacity is rechecked after the conditional update', () => {
  assert.match(
    changeRoute,
    /newDayCount\s*>\s*replacementDay\.capacityLimit/,
  );
  assert.match(
    changeRoute,
    /selected cleaning day reached capacity during this request/,
  );
});

test('successful reassignment creates immutable history', () => {
  assert.match(
    changeRoute,
    /cleaningReassignmentHistory\.create/,
  );
  assert.match(
    changeRoute,
    /previousCleaningDayId:\s*registration\.cleaningDayId/,
  );
  assert.match(
    changeRoute,
    /replacementCleaningDayId:\s*newDayId/,
  );
  assert.match(changeRoute, /source:\s*'student'/);
  assert.match(changeRoute, /sequence/);
});

test('activity audit is part of the transaction callback', () => {
  const transactionPosition = changeRoute.indexOf(
    'prisma.$transaction',
  );
  const activityPosition = changeRoute.indexOf(
    'tx.activityLog.create',
  );
  const responsePosition = changeRoute.indexOf(
    'return NextResponse.json',
    transactionPosition,
  );

  assert.ok(transactionPosition >= 0);
  assert.ok(activityPosition > transactionPosition);
  assert.ok(responsePosition > activityPosition);
});

test('response includes authoritative allowance data', () => {
  assert.match(changeRoute, /getReassignmentAllowance\(sequence\)/);
  assert.match(changeRoute, /changesRemaining/);
  assert.match(studentRoute, /reassignment:/);
  assert.match(
    studentRoute,
    /userRegistration\?\.reassignmentCount\s*\?\?\s*0/,
  );
});

test('initial registration does not explicitly increment the counter', () => {
  const registrationCreate =
    registrationRoute.match(
      /cleaningRegistration\.create\([\s\S]*?\n\s*}\);/,
    )?.[0] ?? registrationRoute;

  assert.doesNotMatch(
    registrationCreate,
    /reassignmentCount:\s*{\s*increment/,
  );
  assert.match(
    schema,
    /reassignmentCount\s+Int\s+@default\(0\)/,
  );
});

test('history sequence is uniquely constrained per registration', () => {
  assert.match(
    schema,
    /@@unique\(\[cleaningRegistrationId, sequence\]\)/,
  );
});

test('hook preserves stable server error codes', () => {
  assert.match(studentHook, /class CleaningApiError/);
  assert.match(studentHook, /public readonly code\?: string/);
  assert.match(studentHook, /throw await readApiError/);
});

test('failed hook requests refresh authoritative server state', () => {
  const hookStart = studentHook.indexOf(
    'export const useChangeRegistration',
  );
  const hookEnd = studentHook.indexOf(
    'export const useMarkAttendance',
    hookStart,
  );
  const hookBlock = studentHook.slice(hookStart, hookEnd);

  assert.match(hookBlock, /onError:\s*\(\)\s*=>/);
  assert.match(hookBlock, /studentCleaningData/);
  assert.match(hookBlock, /studentCleaningStatus/);
  assert.doesNotMatch(hookBlock, /onMutate:/);
});

test('client displays and enforces the exhausted allowance state', () => {
  assert.match(
    cleaningPage,
    /reassignment\.changesUsed/,
  );
  assert.match(
    cleaningPage,
    /reassignment\.changesRemaining/,
  );
  assert.match(
    cleaningPage,
    /reassignment\.canReassign/,
  );
  assert.match(
    cleaningPage,
    /Change limit reached/,
  );
  assert.match(
    cleaningPage,
    /all three permitted assignment changes/,
  );
});

test('client requires explicit confirmation before mutation', () => {
  assert.match(cleaningPage, /const askChange/);
  assert.match(cleaningPage, /setConfirm\(/);
  assert.match(cleaningPage, /confirmLabel:\s*'Switch day'/);
  assert.match(cleaningPage, /runChange\(day\.id\)/);
});

test('allowance display retains accessibility labels', () => {
  assert.match(
    cleaningPage,
    /aria-labelledby="reassignment-allowance-heading"/,
  );
  assert.match(cleaningPage, /aria-live="polite"/);
  assert.match(
    cleaningPage,
    /id="reassignment-allowance-heading"/,
  );
});

test('confirmation reports the predicted remaining allowance', () => {
  assert.match(
    cleaningPage,
    /Math\.max\(0, reassignment\.changesRemaining - 1\)/,
  );
});

test('administrative correction is not silently implemented by the student endpoint', () => {
  assert.doesNotMatch(
    changeRoute,
    /source:\s*'administrator'/,
  );
  assert.doesNotMatch(
    changeRoute,
    /administrativeReason/,
  );
});
