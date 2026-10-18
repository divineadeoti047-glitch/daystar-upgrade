# Daystar — Personal Growth OS

Daystar is an existing personal growth workspace for commitments, accountability, journal entries, goals, planning, study and scripture recall, focus sessions, insights, reminders and coaching. This upgrade retains the repository's React 19, TypeScript, TanStack Start, Netlify Identity, Netlify Functions and Drizzle/Netlify Database architecture. Navy, warm ivory and antique gold frame an editorial interface with locally available serif headings.

## Source and delivery boundary

The source was retrieved from the public `divineadeoti047-glitch/daystar-growth-os2` repository at revision `4ce72fec` on 18 October 2026. The original HTTPS deployment was reachable; its manifest and notification-only worker were inspected. This workspace targets the **separate** `daystar-upgrade` Netlify project. Copying source does not copy the original site's accounts, cookies, database, settings or records. No original records or service configuration were changed. The source checkpoint is recorded in `.netlify/source-checkpoint.json`; it is not a personal-data backup.

## Local development

Use Node 22.13+ and pnpm. Run `pnpm install`, link the appropriate isolated Netlify project, and run `netlify dev --port 8889`. Available checks are `pnpm test`, `pnpm run typecheck`, and `pnpm lint`. The deployment pipeline builds the app and applies migrations. Drizzle Kit is pinned alongside the matching Drizzle ORM beta as a deployment dependency so automatic migration generation can use the local CLI. Its configuration uses a type-only import to avoid a runtime dependency during configuration loading. Build, dev-server and test commands were prohibited in the upgrade session and were not executed; no passing runtime results are claimed.

## Storage and offline behaviour

Netlify Database remains the authoritative cross-device store. `db/schema.ts` defines owner-scoped JSONB workspaces and private push subscriptions. Existing additive migrations are retained unchanged. The server derives ownership from Identity or an HttpOnly Secure browser capability; every write requires the matching scope, revision and same-origin request.

An IndexedDB replica holds a validated document, its cloud base revision, its desired local state and a pending flag under the server-derived scope. A successful local transaction precedes the saved indication and form dismissal. Changes to all existing workspace collections share this path, including tasks, history, goals, journal, learning reviews, focus, planner data and preferences. No credentials are stored in the replica. Netlify remains the persistent server store; IndexedDB is the necessary browser-side offline replica/outbox, not a replacement backend.

Foreground sync runs after a local save, on reconnection, on manual retry and every 30 seconds while visible and not editing. Cloud GET verifies the current scope before PUT. Three-way reconciliation merges independent fields and record IDs; overlapping edits or edit/delete conflicts stop with an error and retain the local queue. Repeated requests recover by comparing desired and cloud documents, with server revision compare-and-swap guarding races. An IndexedDB sequence check rejects stale tab writes. No timestamp-based overwrite or automatic cross-account submission is used. There is no background-sync guarantee.

Explicit sign-in/sign-out clears the active local pointer before changing accounts, preserving each queued document for the original owner. Offline access uses the last active browser workspace and is not a second authentication system: anyone with access to an unlocked browser profile may read that profile's offline copy. Use a trusted device. Records are not encrypted by this application. Clearing storage, browser eviction, uninstalling or losing a device can destroy pending records. Export regular private backups. `navigator.onLine` is only a hint; request failures remain visible. A fresh browser needs a successful online connection before it has a local workspace.

## Public offline shell

The Vite plugin emits a public asset list and versions the existing notification worker using the client asset list. Installation caches the anonymous root shell plus client chunks, styles, manifest and icons. API responses and Identity routes are never cached. Root and `/app` navigation fall back to the shell on network failure. Updates wait for existing tabs to close; activation cleans obsolete Daystar shell caches only. Installation fails if required assets fail, and the UI reports offline readiness only when a shell is present. PNG icons provide Android-compatible 192px and 512px assets. Browser verification remains required.

## Recovery and conflicts

Export a private JSON backup from Settings on the original site **before** any production promotion or data transfer. Existing backup import validates the document, adds new stable IDs and retains existing matching IDs and preferences. It cannot resolve two conflicting versions of the same ID. On a sync conflict, export the local workspace, retain it securely, and obtain the current cloud export from another trusted online session. Reconcile matching records manually with reviewed tooling before continuing; no destructive discard/reset control was added. A dedicated conflict editor is not implemented.

Unsaved form text is not journal autosave and does not survive closure. Offline durability begins only after Save succeeds. Storage failure keeps the form open. Automatic independent backups, retention and database restoration have not been verified.

## Services and cost control

Identity activation was requested successfully for this separate project. This does not transfer original users or verify email delivery, password recovery or Google OAuth. Configure Google using the provider callback URL for the intended project, with secrets only in provider settings.

The coach defaults to deterministic record-based guidance, including offline use. Existing AI integration remains available only when an operator explicitly configures `DAYSTAR_COACH_PROVIDER` to `gemini` or `anthropic`; `rules` uses no inference. AI can consume account credits. No paid service, plan change or paid inference request was made. Only selected task summaries and relevant aggregate/goal summaries enter external context; journals and recall notes are excluded.

Background push requires server-only VAPID configuration and deployed scheduler/device verification. No key values are documented or bundled. Closed-device delivery, permissions and quotas are not verified. Site hosting is on the provided free configuration; original-site usage and backend health were not independently accessible.

## Acceptance and rollback

See `docs/upgrade-report.md` for the evidence, limitations and browser acceptance checklist. The original site remains unchanged and available as the fallback. Restore source from the checkpoint revision or republish the previous known-good deployment on the correct Netlify project. Rolling back a deployment does not restore database data. Do not delete migrations or browser data to roll back the interface, particularly while pending changes exist. The actual upgraded deployment and personal data backup remain acceptance gates.
