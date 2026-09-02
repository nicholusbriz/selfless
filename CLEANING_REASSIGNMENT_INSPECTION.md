# Cleaning Reassignment Baseline Inspection

## Purpose

This record documents the current cleaning registration and reassignment implementation before application changes begin. The inspection was completed on the dedicated contribution branch after synchronization with upstream.

## Verified Baseline

- The active contribution branch is `inspection/cleaning-reassignment-baseline-20260902`.
- The inspected baseline commit is `4738d3e3a8b908cbb332ad08c58a9e4c200622d3`.
- The branch was aligned with `upstream/main` at zero divergence.
- The worktree was clean before and after inspection.
- No application file was modified during inspection.
- The Prisma datasource is MongoDB.
- No conventional `prisma/migrations/` directory exists.
- No automated test command or recognized test framework was detected.

## Current Reassignment Workflow

The student cleaning page in `app/dashboard/cleaning/page.tsx` uses `useChangeRegistration` from `hooks/useCleaningStudent.ts`. The hook sends `POST /api/cleaning/change-day` with `newDayId`.

The route obtains the authenticated user from the NextAuth session, loads the existing registration and requested replacement day, checks availability, deadline, status, date, capacity, and the four-student minimum, and then executes a Prisma transaction.

The transaction deletes the existing registration, recalculates the old day, creates a replacement registration, and updates the new day. Activity logging occurs after the transaction. The interface currently exposes a `Switch here` action while registration remains open.

## Confirmed Requirement

User-initiated reassignment already exists and is currently unlimited. The proposed patch must restrict the existing workflow to no more than three successful user-initiated changes.

The initial registration must not consume the allowance. Failed validation, unauthorized requests, unchanged selections, closed schedules, full replacement days, and transaction failures must not consume the allowance.

## Authentication and Tenant Controls

The student routes derive the registration owner from the authenticated session rather than accepting an ownership identifier from the request body.

The reassignment and initial registration routes do not currently prove that the requested cleaning day belongs to the authenticated user’s tech center. Although the student data route returns weeks filtered by tech center, direct API requests can bypass interface-level option filtering.

The later implementation must enforce tech-center matching at the server.

## Capacity and Transaction Behaviour

The reassignment route operates inside a Prisma transaction. Capacity is checked by counting registrations before deleting and recreating the registration. The new-day counter is calculated from the earlier count plus one.

This approach does not provide a persisted reassignment allowance and requires concurrency-focused design. The change counter, assignment update, capacity update, and history record must succeed or fail together.

The existing rule preventing departure from a day with exactly four registrations must remain unless the Integration Owner explicitly changes that requirement.

## Data-Model Gap

`CleaningRegistration` currently stores `id`, unique `userId`, `cleaningDayId`, `registeredAt`, and `updatedAt`. It does not store a reassignment counter or a reassignment-history relation.

`ActivityLog` can record descriptive events, but the present log is written after the reassignment transaction and cannot safely enforce the maximum atomically.

The technical design must determine whether to add a persisted counter, a dedicated reassignment-history model, or both. Any rollout must follow an approved MongoDB-compatible Prisma process rather than assuming a conventional SQL migration.

## Overlapping Routes

Two change-oriented routes exist:

- `app/api/cleaning/change-day/route.ts`
- `app/api/admin/cleaning/change/route.ts`

The student route allows eligible movement across weeks. The route under the administrative directory operates on the authenticated user’s own registration, lacks an administrative-role check, and restricts movement to the same week.

The technical design should establish one authoritative student-reassignment route and prevent duplicated enforcement.

Administrative assignment and removal routes apply tech-center controls inconsistently. Those wider findings remain outside this patch unless separately approved.

## Interface and State Behaviour

`hooks/useCleaningStudent.ts` performs an optimistic reassignment update and invalidates the student cleaning queries after completion. `app/dashboard/cleaning/page.tsx` displays assignment controls, schedule state, capacity, confirmation messaging, and the switch action.

Neither file currently models changes used or remaining. The later interface must display values returned by the server. Client-side disabling must not replace server-side enforcement.

## Testing Recommendation

The repository does not currently provide an established automated test framework. The approved implementation should add coverage for the first, second, and third successful changes; fourth-change rejection; unchanged selections; failed requests that do not consume allowance; authentication and tech-center denial; closed registration; full capacity; preservation of the four-student minimum; concurrent requests; and transaction rollback.

## Verified File Impact Register

Primary implementation candidates are:

- `prisma/schema.prisma`
- `app/api/cleaning/change-day/route.ts`
- `app/api/cleaning/student/route.ts`
- `hooks/useCleaningStudent.ts`
- `app/dashboard/cleaning/page.tsx`

Conditional implementation candidates are:

- `app/api/cleaning/register/route.ts`
- `lib/logger.ts`
- `package.json`

Routes requiring a design decision are:

- `app/api/admin/cleaning/change/route.ts`
- `app/api/admin/cleaning/manual-assign/route.ts`
- `app/api/admin/cleaning/remove-student/route.ts`
- `app/api/admin/cleaning/remove/[userId]/route.ts`

No candidate application file is authorized for modification by this inspection record.

## Conclusion

The inspection confirms that reassignment already exists and is currently unlimited. The subsequent design must convert the existing behaviour into a maximum of three successful user-initiated changes with persistent and atomic enforcement, tech-center validation, auditable history, stable API responses, and accurate interface feedback.

No application implementation has started. Technical design and patch implementation require separate authorization.
