# ADR-0003: AES-256-CBC field-level encryption for sensitive PII

## Status

Accepted — 2026-05-16

## Context

The HR module stores Polish national identifiers (PESEL) and ID document
numbers on the `User` model. Under GDPR, these are personal data of a
heightened category; under Polish law, PESEL is regulated separately.
A database dump leaking these fields exposes the operator to fines up to
4 % of annual turnover and identity-theft risk for employees.

Default Mongo storage is plaintext on disk. Atlas at-rest encryption
protects against drive theft but does **not** protect against an
application-layer breach (compromised admin, leaked backup, exfiltrated
mongodump).

## Decision

Apply **field-level AES-256-CBC encryption** to PESEL and identity
document fields in the `User` model. The encryption key lives in the
`ENCRYPTION_KEY` environment variable, never in the repository, and is
loaded once at process start.

Encryption happens in pre-save and post-find Mongoose hooks so callers
see plaintext through the model and ciphertext on disk. The IV is
generated per-document and stored alongside the ciphertext.

## Consequences

+ A leaked mongodump is unusable for PESEL recovery without
  `ENCRYPTION_KEY`.
+ GDPR Article 32 ("appropriate technical measures") is materially
  satisfied for the highest-risk fields.
+ Existing application code is unaware of the encryption layer.
- **Equality search works only with deterministic encryption** (same
  plaintext → same ciphertext); we use CBC with random IVs, so search
  by PESEL requires a separate searchable HMAC index (not yet
  implemented — flagged as future work).
- **Losing `ENCRYPTION_KEY` permanently corrupts the data.** A KMS
  (AWS KMS / GCP KMS / HashiCorp Vault) is required before this is
  production-grade. Currently the key is operator-managed via `.env`.
- Key rotation requires re-encrypting all rows. A migration script
  template lives in `server/scripts/`.

## Alternatives considered

- **MongoDB Atlas Client-Side Field Level Encryption (CSFLE).** Solves
  the same problem with deterministic + random modes and built-in key
  vault. Rejected for now: vendor lock-in to Atlas, paid tier, and
  hides the cryptographic primitives this project is meant to showcase.
- **Hashing (bcrypt/argon2).** One-way — incompatible with the
  requirement to display the PESEL back to authorized HR staff.
- **Plaintext + at-rest disk encryption only.** Does not defend against
  application-layer compromise, which is the realistic threat model.
- **Tokenization service.** Overkill for a single-tenant per company
  HR app; reconsider if PCI scope is added.

## Future work

- Migrate key storage to a KMS.
- Add searchable-HMAC index for PESEL lookups.
- Switch CBC → AES-GCM for authenticated encryption.
