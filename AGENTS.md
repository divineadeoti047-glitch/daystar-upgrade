# Daystar project guide

This project upgrades the existing Daystar source from `divineadeoti047-glitch/daystar-growth-os2`, rather than replacing its architecture. The original site is `offline-website-636739.netlify.app`; this workspace belongs to the separate `daystar-upgrade` Netlify project. Never treat source copying as migration of accounts or personal records.

## Architecture

- `src/components/daystar.tsx` owns feature screens, shared saving, account controls and sync orchestration. `learning.tsx`, `growth-studio.tsx`, `command-menu.tsx` and `push-settings.tsx` retain existing extensions.
- `src/lib/model.ts` contains the validated workspace schema, recurrence, historical snapshots, metrics, focus calculations and additive backup import. Preserve these shared business rules.
- `src/lib/offline.ts` provides the owner-scoped IndexedDB replica/outbox, transactional sequence checks, bounded workspace requests and conservative three-way reconciliation. Netlify Database remains authoritative server storage. Browser IndexedDB is an offline replica explicitly required by this upgrade.
- `netlify/functions/workspace.mts` derives ownership server-side and enforces scope, revision, validation, origin and private/no-store responses. Never permit client-supplied owner IDs.
- `netlify/functions/coach.mts` retains configured AI integrations but defaults to free record-based rules. Never enable paid inference or change models without reviewing current platform guidance and user authorisation.
- `db/schema.ts` and `netlify/database/migrations/` retain the original Drizzle schema and migrations unchanged. Schema changes require a new generated migration; never apply migrations manually.
- `public/notifications-sw.js` retains notifications and adds public-only offline shell caching. `vite.config.ts` emits client asset precaching and a build-versioned worker. Do not cache APIs, auth callbacks or private responses. Updates must not force reload or discard drafts.
- `src/styles.css` preserves layouts and adds final editorial tokens. `/` and `/app` render the same workspace. Product metadata lives in `src/routes/__root.tsx`.

## Invariants

No global reset or destructive bulk deletion. Preserve personal records and working features. Snapshot recurring history before schedule changes. Metrics divide by eligible scheduled occurrences, exclude skips/future dates, and never fabricate records. Units are not summed across incompatible targets. Focus uses elapsed timestamps; early finish is interrupted.

A local save is successful only after IndexedDB commits. Scope/revision checks precede cloud writes. Conflicting fields stop sync and preserve pending data; never silently prefer a newer timestamp. Local sequence checks prevent stale tab overwrites. Clear the active offline pointer before explicit account changes; retain queued work under its original scope. Do not store tokens, passwords or credentials in IndexedDB. Never add a discard-pending button as a conflict workaround.

Offline browser copies are private to a browser profile, not encrypted or a guarantee of identity after device access. Exports are sensitive. Never print records or secrets. Local queued changes are not independent backups. Journal drafts remain unsaved until submission; do not claim autosave.

## Development and verification

Use pnpm and Node 22+. Local platform emulation uses `netlify dev --port 8889` when permitted. Existing Vitest tests cover domains/API/UI; `offline.test.ts` adds reconciliation regressions. Honour active environment restrictions: this upgrade session prohibited local build/start/test commands. Never claim unexecuted tests passed. No direct commits, PR creation or deployment commands are needed in the managed pipeline.

Read `README.md` and `docs/upgrade-report.md` for deployment boundaries, evidence, cost controls, required browser acceptance and recovery limitations. Keep reports current; previous-session passing claims do not verify current changes.
