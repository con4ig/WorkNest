# ADR-0008: Soft delete for projects via `isArchived` flag

## Status

Accepted — 2026-05-16

## Context

Project deletion in WorkNest has two distinct user intents:

1. **"I'm done with this project, get it out of my view."** Common,
   reversible, expected to be undoable without a support ticket.
2. **"I want this gone forever, GDPR-style."** Rare, irreversible, only
   appropriate for admins after explicit confirmation.

Hard-deleting on the common path destroys audit history (the `Activity`
collection references the project), breaks foreign references in tasks
and comments, and is impossible to undo without a backup restore.

## Decision

`Project` carries a boolean `isArchived` field
(see [`projectController.js`](../../server/controllers/projectController.js)).

- **Archive** (`PATCH /:id/archive`, admin/hr) sets `isArchived = true`.
  The project disappears from default list queries
  (`query.isArchived = { $ne: true }`) but remains for archive views,
  history, and analytics.
- **Restore** (`PATCH /:id/restore`, admin/hr) flips it back.
- **Hard delete** (`DELETE /:id`, admin only) genuinely removes the row.
  Reserved for compliance / accidental creation cleanup.
- **Bulk** (`PATCH /bulk-action`) supports `archive` / `restore` /
  `delete` / `status` against a list of IDs.

The `$ne: true` predicate is chosen deliberately so legacy rows where
`isArchived` is `false`, `null`, or simply missing all behave as
"active". This makes the migration to soft-delete a no-op for existing
data.

## Consequences

+ The default UX never destroys data the user can recover.
+ Audit and activity history remain intact for archived projects.
+ Reporting can include or exclude archived projects with a single
  predicate.
+ The hard-delete path still exists for the legitimate "really gone"
  case.
- Every query against `Project` must remember to filter `isArchived`.
  Currently enforced by convention, not by a base repository — a
  growing source of repetition. Future work: a `findActive` helper.
- Storage grows monotonically until hard delete. Acceptable: archives
  are small relative to tasks/activities, and a periodic purge job
  can be added if needed.
- Indexes on `isArchived` may help large-tenant queries; deferred until
  profiling demands it.

## Alternatives considered

- **Hard delete everywhere.** Destroys history, breaks foreign refs,
  no undo. Rejected.
- **Separate `ArchivedProject` collection.** Doubles the schema
  surface, complicates queries that span both. Rejected.
- **Deleted-at timestamp (`deletedAt`).** Equivalent semantics with
  more information (when archived). A reasonable evolution if a
  "purge after 90 days" rule ever lands; current boolean is
  sufficient.
- **Status enum extended with `"archived"`.** Conflates project
  lifecycle (`pending → running → completed`) with administrative
  state. Rejected for clarity.
