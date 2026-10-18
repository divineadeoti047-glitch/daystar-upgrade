# Daystar upgrade evidence and release gates

Status: implementation staged; release acceptance incomplete. Inspection date: 18 October 2026.

## Initial audit

The working directory was empty. The provided Netlify configuration describes a separate, fresh `daystar-upgrade` project rather than the original deployment. The public GitHub repository was retrieved through its API after this environment rejected `git ls-remote`. Its sole returned commit was `4ce72fec`. An untouched archive was retained in the session temporary directory; its SHA-256 and full revision were recorded in `.netlify/source-checkpoint.json`. The original repository revision is the durable source recovery point. No personal-data backup or database checkpoint was obtained. No production records were read or modified.

The original root, manifest and service-worker requests returned HTTP 200 over HTTPS. The page title was DAYSTAR Personal Growth OS. This proves public reachability at inspection time, not successful authentication, private APIs or every screen. No hosting suspension was observed. Original hosting usage, retention and service limits were not accessible through the separate project's supplied configuration.

The source uses React 19, TypeScript, TanStack Start, Vite, pnpm, Radix controls, Lucide, Netlify Functions, Netlify Identity, Drizzle and managed Netlify Postgres. `/` and `/app` mount the same workspace; navigation is internal component state. Tasks, dashboard, insights, journals, goals, planner, focus, coach, settings, Growth Studio, course/recall tools, command search and push settings are present. Existing domain/API/UI tests are included. Schema, migrations and providers were retained.

**Confirmed public behaviour:** the original HTML, manifest and notification worker were served successfully. No private feature is listed as runtime-confirmed.

**Confirmed source defects/gaps:** the live worker had no fetch handler and could not provide offline launch. The workspace had no persistent browser replica or offline queue. Saves required a live PUT. Workspace loading waited for callback/user/provider discovery, and workspace/coach fetches lacked timeouts. Connection failure could leave the status saying Connecting. Headings used a sans-serif despite the requested serif treatment. Fonts required an external Google stylesheet. Android PNG manifest icons were absent.

**Existing safeguards confirmed by code inspection:** server-derived account/device ownership, HttpOnly Secure SameSite device capability, owner-filtered database access, same-origin mutations, Zod validation, private/no-store API responses, revision/scope guards, additive backup import, deterministic occurrence IDs and historical task snapshots. Analytics use real model records, and focus uses elapsed timestamps. These are inspected controls, not proof of deployed enforcement.

**Suspected or unverified:** email/password and Google sign-in, callback/session recovery, cross-device writes, production schema availability, background push delivery, Gateway configuration, real device layouts, contrast across all screens, dependency vulnerability status and performance. The original deployment's private database, environment values, Identity configuration and backup retention were not accessible in this session. Secret values and private records were never requested or printed.

## Implemented, reviewed in source, not runtime-tested

The original application was brought into the empty project without scaffolding or replacing its backend. `src/lib/offline.ts` added a validated IndexedDB replica and durable pending snapshot for each server scope, with local transactional sequence checks. `daystar.tsx` added immediate local saves, foreground reconnect/retry, bounded requests, honest status, account transition boundaries and deterministic offline coaching. Reconciliation retains the cloud base, merges independent changes and rejects overlapping changes. A failed PUT retains the queue. An ambiguous successful PUT is recognised on the next GET by equality with the desired document. Backend revision/scope checks remain unchanged.

`public/notifications-sw.js` retained notification/push handling and added anonymous-shell and public-static-asset caching. `vite.config.ts` added generated precache metadata and a worker cache version derived from client asset filenames. Updates wait for old tabs to close before activation and clean only obsolete shell caches. Private API and authentication routes are excluded. The manifest gained stable identity/scope and PNG icons. `netlify.toml` gained worker/manifest-list revalidation headers.

`styles.css` retained every feature layout and refined the requested navy/ivory/gold tokens, local serif headings, mobile status wrapping, focus/readability and touch targets. Product metadata and safe-area viewport settings were retained/refined. `coach.mts` defaults to rules without inference credits; explicitly configured providers remain supported. Identity activation returned a successful acknowledgement for this separate site. No paid requests or plan changes were made.

Reconciliation regression tests were added, and component tests were updated for local-storage failure and form preservation. README and agent guidance were rewritten to remove stale completion claims and document current storage, privacy, migration and recovery boundaries.

## Actual verification results

| Check | Result |
| --- | --- |
| Public GitHub metadata/archive/history | HTTP 200; source retrieved |
| Original HTTPS application | HTTP 200 |
| Original manifest and worker | HTTP 200; worker lacked offline fetch handling |
| Separate-project Identity activation | Script acknowledged enabled |
| Source review of changes | Performed; no production records touched |
| Unit/integration/component tests | Added/retained; not run |
| Type check, lint, production build | Not run |
| Browser offline launch/create/edit/reopen/sync | Not run |
| Android/Windows visual, keyboard, accessibility | Not run |
| Dependency vulnerability and performance checks | Not run |
| Original private accounts/database/data backup | Not accessed or verified |
| Upgraded production URL and backend | Not verified; managed pipeline publishes after this session |

Local build, dev-server and test/validation commands were explicitly prohibited by the active task environment. No browser automation capability was provided. Static inspection and public HTTP checks cannot replace these tests. The upgrade does not meet the full definition of done yet.

## Required acceptance sequence

Use disposable test records in an isolated environment and preserve a private original-site export first. Confirm which project owns the intended accounts/database before any promotion; the separate site's new database must never be presented as the original dataset.

1. Run the existing unit/component/API tests, added reconciliation cases, type checking, linting, production build and dependency audit in the permitted pipeline.
2. On the actual delivered HTTPS URL, verify manifest/icons, root-scoped active worker, successful precache and no private API cache entries. Check that every client chunk needed by all screens is cached.
3. Create representative tasks, completion/progress, goals, journal, planner/recall and focus records online. Export a private backup. Navigate every existing destination.
4. Disable network, reload both `/` and `/app`, create and edit supported records, submit changes, close/reopen and verify retained records and truthful pending status. A fresh uncached browser should show an honest unavailable state.
5. Restore network and confirm single application of queued records, correct owner and no duplicate progress. Simulate timeout both before commit and after commit, 503, quota failure and restart during sync.
6. Use two tabs/devices to verify stale-local sequence rejection, independent edits merging, overlapping edits stopping, and edit/delete conflicts preserving copies. Export conflict data for reviewed manual recovery.
7. Test expiry followed by device fallback, sign-out with pending edits, reauthentication into the original account, switching accounts, OAuth callbacks, failed login and password recovery. Pending work must never appear in another account's server document.
8. Test interrupted service-worker installation, waiting updates, reopen after update and cache cleanup without losing IndexedDB. Test phone backgrounding and timestamp-based focus recovery.
9. Check 360px Android and 1440px Windows viewports, 200% text scaling, keyboard traversal, dialog focus, screen-reader status, reduced motion, touch targets, contrast and overflow. Inspect console/network errors and resource load/performance.
10. Verify original personal-data exports/restore and provider retention before production release. Verify real email/OAuth/database/push configuration separately. AI requests require prior cost authorisation.

## Remaining limitations and actions

The original backend and account access must be connected or inspected through the original Netlify project using its normal secure controls; do not paste secrets into chat. Source copying into this new project cannot share original browser cookies, Identity users or database records. Obtain and securely verify an original-site export before any original-site deployment or explicit additive data transfer. Database restoration/retention is not established. Browser-local copies and the source archive are not independent personal-data backups.

Journal autosave/draft recovery was not implemented; submitted records use the shared durable save path. A conflict editor was not implemented; conflicts deliberately retain the local queue and require reviewed manual reconciliation. Shared-browser offline copies are not encrypted or account-unlocked; protect the OS/browser profile. Push scheduling and real delivery remain unverified. No new email or AI services were enabled, and no new ongoing charge was authorised. AI and hosting beyond existing allowances may consume credits and require separate approval.

No direct production deployment, original-project connection change, destructive migration, bulk reset, personal-record overwrite or data transfer was performed. The managed pipeline is responsible for the new project's build and release; that release still requires actual URL verification. Source rollback uses the original revision; interface rollback republishes the previous deployment on the correct site. Neither action restores database rows. Keep original deployment and private exports until all acceptance gates pass, and retain pending IndexedDB through rollback.

## Migration-generation deployment repair

The failed deployment attempted an unpinned temporary Drizzle CLI and could not resolve the configuration's runtime `drizzle-kit` import. Drizzle Kit was moved from development-only to deployment dependencies, retaining version `1.0.0-beta.22` to match Drizzle ORM. The pnpm lockfile importer was updated without changing resolved versions, and the configuration replaced its runtime `defineConfig` import with a type-only `Config` import and `satisfies` declaration. Database schema, migration files and personal records were unchanged.

`pnpm install --frozen-lockfile --ignore-scripts` completed successfully and installed the matching local packages. No build, tests, migration generation or migration application was run. The automatic deployment pipeline must verify the repaired generation step and remaining build.
