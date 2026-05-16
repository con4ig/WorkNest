# ADR-0000: Record architecture decisions

## Status

Accepted — 2026-05-16

## Context

The project has accumulated non-trivial choices: multi-tenant isolation,
encryption of personal data, demo sandbox semantics, auth flow. Without
a written record, the rationale is lost in commit history and chat logs,
and future contributors (or interview reviewers) cannot tell whether a
quirk is intentional or accidental.

## Decision

Adopt **Architecture Decision Records** (MADR-lite format) under
`docs/adr/`. Every decision that:

- changes the public contract (API, data model, security posture),
- introduces a new infrastructure component, or
- closes off an alternative that a reasonable engineer would otherwise pick,

gets a numbered record. Records are append-only; superseded ones are
linked, not deleted.

## Consequences

+ New contributors can reconstruct the *why* without spelunking commits.
+ Trade-offs are explicit and reviewable.
+ Interview / code-review conversations have a canonical reference.
- Small upfront cost per decision (~15 min to write).
- Discipline required to keep the index in sync.

## Alternatives considered

- **No records, rely on commit messages.** Loses context once branches merge.
- **Wiki / Notion.** External tool, drifts from code, gates access.
- **Inline code comments.** Don't capture rejected alternatives or scope.
