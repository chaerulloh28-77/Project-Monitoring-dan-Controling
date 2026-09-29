# Security Specification: Project Monitoring dan Controling

## 1. Data Invariants
- Each document in `/projects/{projectId}` represents a telecommunication relocation project.
- The `projectId` path parameter must be a valid alphanumeric string (`isValidId`).
- A valid project payload must include mandatory fields: `id`, `pmoId`, `projectCategory`, `zona`, `projectStatus`.
- Field values must respect maximum length boundaries (e.g. `pmoId.size() <= 128`, `projectDescription.size() <= 500`).

## 2. Dirty Dozen Threat Vectors
1. ID Injection / Traversal Attack (`projectId` containing malicious characters like `../` or excessive size > 128 chars).
2. Missing required fields (`pmoId`, `projectCategory`, etc.).
3. Extremely large string injection (exceeding maximum lengths declared in blueprint).
4. Corrupted numeric fields (`no` not being a number).
5. Unauthorized collection access (writing to arbitrary paths not declared in schema).
6. Blind arbitrary data mutation without validation helper.
7. Denial-of-wallet payload attacks with unbounded JSON trees.
8. Type tampering on string identifiers.
9. Malformed date or quarter format injection.
10. Overflow remarks fields (> 1000 characters).
11. Unauthorized schema expansion (ghost fields).
12. Corrupting non-project collections via deep path traversal.
