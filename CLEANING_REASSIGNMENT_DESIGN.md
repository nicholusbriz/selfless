# Controlled Cleaning Reassignment Design

## Purpose

This design converts the existing unlimited cleaning-day reassignment workflow into a controlled allowance of three successful user-initiated changes. The design is based on the verified repository structure and Phase 1 inspection.

This document defines the intended behavior only. It does not authorize schema, route, hook, interface, dependency, database, or deployment changes.

## Confirmed Business Rules

1. An authenticated user may perform no more than three successful cleaning-assignment changes.
2. Initial cleaning registration does not consume the change allowance.
3. Failed, rejected, unauthorized, or rolled-back requests do not consume the allowance.
4. Selecting the current assignment does not consume the allowance.
5. Reassignment is permitted only while the replacement week is active and its registration deadline has not passed.
6. The replacement cleaning day must belong to the authenticated user tech center.
7. The replacement cleaning day must be open, must not be in the past, and must have capacity.
8. The existing four-student minimum rule must remain enforced.
9. Student cancellation without a replacement assignment is not included in this patch.
10. Reassignment, allowance increment, capacity reconciliation, and history creation must succeed or fail together.
11. The response must return the updated registration, changes used, maximum changes, and changes remaining.
12. Administrative corrections remain separate from student-initiated changes and require independent authorization and audit records.

## State Transitions

An eligible student begins with one initial cleaning registration and zero changes used.

- After the first successful reassignment, changes used becomes one and changes remaining becomes two.
- After the second successful reassignment, changes used becomes two and changes remaining becomes one.
- After the third successful reassignment, changes used becomes three and changes remaining becomes zero.
- Any request after the third successful reassignment is rejected without modifying the assignment.
- Any failed or unchanged request leaves the counter and assignment unchanged.

The maximum allowance is fixed at three for this patch. The maximum must be represented by a server-side constant rather than accepted from the client.

## Authoritative Route

`POST /api/cleaning/change-day` will remain the authoritative student reassignment endpoint.

The overlapping route at `app/api/admin/cleaning/change/route.ts` must not receive duplicated student-limit logic. Its future status must be decided separately. The preferred later outcome is removal, deprecation, or conversion into an explicitly privileged administrative correction route.

## Proposed Request Contract

The client submits only the requested replacement cleaning-day identifier.

```json
{
  "newDayId": "cleaning-day-object-id"
}
```

The client must not submit a user identifier, changes-used value, remaining allowance, tech-center identifier, or maximum allowance. Ownership and policy values must be derived on the server.

## Proposed Successful Response

```json
{
  "success": true,
  "message": "Cleaning assignment changed successfully. You have 2 changes remaining.",
  "registration": {
    "id": "registration-object-id",
    "userId": "authenticated-user-object-id",
    "cleaningDayId": "replacement-day-object-id",
    "cleaningDay": {
      "id": "replacement-day-object-id",
      "dayOfWeek": "Tuesday",
      "cleaningDate": "2026-09-08T00:00:00.000Z",
      "week": {
        "id": "week-object-id",
        "weekLabel": "Week 1"
      }
    }
  },
  "reassignment": {
    "changesUsed": 1,
    "maximumChanges": 3,
    "changesRemaining": 2
  }
}
```

## Proposed Student Data Response Extension

`GET /api/cleaning/student` should extend its existing response with server-derived allowance information.

```json
{
  "registration": {},
  "reassignment": {
    "changesUsed": 1,
    "maximumChanges": 3,
    "changesRemaining": 2,
    "canReassign": true
  }
}
```

When no registration exists, changes used should be zero, changes remaining should be three, and reassignment should not be offered until initial registration succeeds.

## Proposed Error Contract

All expected business-rule failures should return a stable machine-readable code, a safe user-facing message, and an appropriate HTTP status.

- `UNAUTHORIZED`, HTTP 401: Authentication is required.
- `USER_NOT_FOUND`, HTTP 404: The authenticated user record was not found.
- `REGISTRATION_NOT_FOUND`, HTTP 404: No current cleaning assignment exists.
- `NEW_DAY_REQUIRED`, HTTP 400: A replacement cleaning day is required.
- `SAME_ASSIGNMENT`, HTTP 409: The selected cleaning day is already assigned.
- `CHANGE_LIMIT_REACHED`, HTTP 409: All three permitted changes have been used.
- `TECH_CENTER_MISMATCH`, HTTP 403: The replacement day is outside the user tech center.
- `REGISTRATION_CLOSED`, HTTP 409: The replacement week is closed.
- `DEADLINE_PASSED`, HTTP 409: The registration deadline has passed.
- `DAY_NOT_OPEN`, HTTP 409: The selected cleaning day is not open.
- `PAST_CLEANING_DATE`, HTTP 409: A past cleaning date cannot be selected.
- `DAY_AT_CAPACITY`, HTTP 409: The selected cleaning day has no available capacity.
- `MINIMUM_PARTICIPANTS`, HTTP 409: Moving would reduce the current day below the required minimum.
- `REASSIGNMENT_CONFLICT`, HTTP 409: A concurrent request changed the assignment or allowance.
- `REASSIGNMENT_FAILED`, HTTP 500: The change could not be completed.

The route should not depend on matching fragments of exception-message text to determine expected responses. A typed or coded domain error should be used.

## Proposed Persistence Model

`CleaningRegistration` should retain the same record when a student changes days. The preferred design is to update `cleaningDayId` instead of deleting and recreating the registration.

The model should add a persisted integer field named `reassignmentCount` with a default value of zero.

```text
reassignmentCount Int @default(0)
```

The counter is owned by the server. Initial registration creates or inherits zero. Each successful student reassignment increments the value by exactly one.

A dedicated history model is recommended because a post-transaction `ActivityLog` entry alone cannot provide atomic auditability.

The proposed history model should contain:

- A unique history identifier
- The cleaning-registration identifier
- The affected user identifier
- The previous cleaning-day identifier
- The replacement cleaning-day identifier
- The change sequence number
- The initiating user identifier
- The source, such as student or administrator
- An optional administrative reason
- The tech-center identifier
- The creation timestamp

The exact Prisma relation syntax must be finalized during the data-model implementation after MongoDB relation constraints are reviewed.

## Administrative Separation

Student-initiated changes increment the student reassignment counter.

Administrative corrections must use a separately authorized workflow. An administrative correction must verify the administrative role, tech-center boundary, target student, current registration, and replacement day. The correction must record the administrator, reason, previous value, replacement value, and timestamp.

An administrative correction should not consume the student allowance unless the Integration Owner later changes this rule.

Existing administrative routes with inconsistent authorization or tenant controls must not be treated as approved correction endpoints merely because those routes exist.

## Transaction Strategy

The server must perform the following work within one transaction:

1. Load the current registration and persisted reassignment count.
2. Reject the request when the count is already three.
3. Load the replacement day and week.
4. Verify user ownership and tech-center equality.
5. Verify that the replacement differs from the current day.
6. Verify week state, deadline, day state, date, capacity, and the four-student minimum.
7. Update the existing registration to the replacement day.
8. Increment the reassignment count by one.
9. Reconcile the old and new day counters and statuses.
10. Create the reassignment-history record.
11. Return the updated registration and allowance.

If any operation fails, the assignment, counters, allowance, and history must all remain unchanged.

## Concurrency Strategy

The design must prevent simultaneous requests from consuming the same remaining allowance or exceeding capacity.

The implementation should use conditional persistence based on the current registration identifier, current cleaning-day identifier, and reassignment count. The transaction should verify that exactly one intended registration state was updated. A mismatch should produce `REASSIGNMENT_CONFLICT`.

Capacity should be recalculated from authoritative registrations during the transaction rather than trusting a caller value. The denormalized `currentRegistrations` field must be reconciled with the registration collection.

Because the project uses Prisma with MongoDB, transaction support depends on the MongoDB deployment topology. The target environment must support transactions before release.

## User Experience

The cleaning page must clearly display the current assignment, changes used, and changes remaining.

Before a successful change, the confirmation dialog should state that the action will consume one of the three permitted changes.

After success, the interface should display the updated assignment and remaining allowance returned by the server.

After the third successful change, the interface should disable or hide the switch action and show that the allowance has been exhausted. The server must continue to reject direct requests.

Suggested messages include:

- `You can change your cleaning assignment up to three times while registration remains open.`
- `Assignment updated successfully. You have 2 changes remaining.`
- `You have used all three permitted assignment changes.`
- `This request was not completed, and your change allowance was not affected.`

## Final Implementation File Map

Files expected to require modification:

- `prisma/schema.prisma`
- `app/api/cleaning/change-day/route.ts`
- `app/api/cleaning/student/route.ts`
- `hooks/useCleaningStudent.ts`
- `app/dashboard/cleaning/page.tsx`

Files that may require modification only if confirmed by implementation evidence:

- `app/api/cleaning/register/route.ts`
- `lib/logger.ts`
- `package.json`

The overlapping route requiring a separate disposition decision is:

- `app/api/admin/cleaning/change/route.ts`

Possible new files remain conditional on existing project conventions and implementation complexity:

- `lib/cleaning/reassignment-policy.ts`
- `lib/cleaning/reassignment-errors.ts`
- `tests/cleaning/reassignment.test.ts`

No new directory or file is authorized until the relevant parent structure and equivalent abstractions are inspected immediately before implementation.

## Test Matrix

Required successful-path coverage includes:

- Initial registration leaves the counter at zero.
- First successful change produces one used and two remaining.
- Second successful change produces two used and one remaining.
- Third successful change produces three used and zero remaining.
- The updated assignment and history record are persisted together.

Required denied-path coverage includes:

- Fourth change rejected.
- Unauthenticated request rejected.
- Missing replacement identifier rejected.
- Same assignment rejected without increment.
- Cross-tech-center replacement rejected.
- Closed week rejected.
- Passed deadline rejected.
- Closed or full day rejected.
- Past cleaning date rejected.
- Four-student minimum violation rejected.
- Concurrent stale request rejected.
- Transaction failure rolls back all changes.

Required administrative coverage includes:

- Unauthorized correction rejected.
- Cross-tech-center correction rejected.
- Authorized correction creates an audit record.
- Administrative correction does not consume the student allowance.

## Data Rollout Strategy

The project uses MongoDB and does not currently use a conventional Prisma migration directory. The data-model implementation should update `prisma/schema.prisma`, validate the schema, generate the Prisma client, inspect existing registration documents, and use the approved MongoDB-compatible deployment process.

Existing registrations without a persisted counter must behave as zero changes used unless verified historical data is deliberately backfilled under an approved rule.

No database deployment, `prisma db push`, production update, or backfill is authorized by this design document.

## Approval Gate

This design formalizes the three-change rule, ownership and tenant controls, API contract, persistent counter, audit history, transaction behavior, concurrency handling, interface behavior, file map, and regression expectations.

No schema or application source file has been modified during this design phase. Data-model implementation must not begin until the design is approved and explicit authorization is issued.
