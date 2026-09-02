# Cleaning Reassignment Data Model

## Purpose

This record documents the minimum persistent data introduced for controlled cleaning reassignment.

## Registration counter

`CleaningRegistration.reassignmentCount` records successful student-initiated changes and defaults to zero.

Initial registration does not increment the counter. Failed, rejected, unchanged, or rolled-back requests do not increment the counter.

## Reassignment history

`CleaningReassignmentHistory` records the registration, affected user, previous day, replacement day, initiating user, tech center, sequence, source, optional reason, and creation time.

The registration identifier and sequence number form a unique pair. Supporting indexes cover the user, cleaning days, initiating user, tech center, source, and timestamp.

## Existing records

Existing registrations without a stored counter are treated as having zero recorded changes unless a separate historical backfill policy is approved.

No historical count is inferred from existing activity logs during this work.

## MongoDB rollout

The project uses MongoDB and does not contain a conventional Prisma migration directory. No SQL migration is created.

This work does not authorize `prisma migrate`, `prisma db push`, database seeding, production database writes, or data backfilling.

The target MongoDB environment must support transactions before server-side reassignment is released.

## Rollback

Before application rollout, rollback consists of reverting the data-model commit and regenerating the Prisma Client.

After reassignment history has been written, rollback must preserve that history unless archival or removal is separately approved.

## Scope

Only `prisma/schema.prisma` and this document are changed. API, hook, interface, authentication, and deployment behavior remain unchanged.

Server-side implementation requires separate authorization.
