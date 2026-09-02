# Controlled Cleaning Reassignment Policy

## Student allowance

A student may complete a maximum of three successful cleaning-assignment changes. Initial registration does not consume the allowance.

Failed, rejected, unchanged, unauthorized, conflicting, or rolled-back requests do not consume the allowance.

## Eligibility

A replacement cleaning day must:

- Differ from the current assignment.
- Belong to the authenticated student’s tech center.
- Belong to an active registration week whose deadline has not passed.
- Be open, not in the past, and below capacity.
- Preserve the minimum of four students on the current cleaning day.

## Enforcement and auditability

The server is authoritative. Reassignment, counter increment, capacity reconciliation, history creation, and activity logging execute within one transaction.

Conditional registration updates prevent repeated or concurrent requests from consuming the same allowance state.

Each successful student change records the previous day, replacement day, student, initiating user, tech center, sequence, source, and timestamp.

## Administrative behavior

Administrative corrections remain outside this student workflow. Existing administrative routes are not treated as approved correction endpoints by this patch. Administrative correction requires separate authorization, tenant validation, and audit rules.

## User experience

The cleaning dashboard displays changes used and remaining, requires explicit confirmation, refreshes authoritative server state after failure, and disables reassignment when the allowance is exhausted.
