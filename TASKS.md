# Tasks

## Active Sprint

### Task 1: Project Scaffold

Status: completed

Acceptance:

- Base Electron + React + TypeScript app exists
- Tray flow is wired
- Overlay window can be opened locally

### Task 2: Google OAuth

Status: active

Acceptance:

- User can sign in
- Calendar read-only scope is granted
- Token can be restored on relaunch

Progress:

- Desktop OAuth flow is wired through the system browser
- Client config is stored locally
- Google desktop-client JSON import is wired
- Token persistence is wired
- Token refresh is wired
- Saved OAuth config now round-trips back into the UI
- Token storage uses Electron secure storage when available
- Live sign-in still needs a real Google desktop client ID to verify end-to-end

### Task 3: Calendar Poller

Status: active

Acceptance:

- Poll runs every 60 seconds
- Upcoming events are fetched
- Duplicate reminders are suppressed

Progress:

- Main-process poller runs every 60 seconds
- Google Calendar `events.list` fetch is wired for the primary calendar
- Duplicate reminders are suppressed by event id plus start time
- Reminder lead time is configurable from the control panel
- Runtime status now refreshes from background poll cycles
- Pause mode is wired in tray plus control panel
- Smoke verification now launches the built Electron app and catches renderer-load regressions
- Control panel now shows the fetched upcoming events instead of only a count
- Live event fetch still needs a connected Google account to verify end-to-end

### Task 4: Reminder Overlay

Status: completed

Acceptance:

- Banner appears at top of screen
- Animation is readable
- Banner hides after 8 seconds

Progress:

- Overlay now uses an artifact system instead of a plain banner
- Selected artifact is persisted and used by demo plus real reminders
- Artifact definitions are split into renderer-side files instead of one inline overlay block
- Built-in artifact set now includes cat, paper plane, and santa variants
- Control panel now shows inline artifact previews for faster selection
- Reminder artifacts can open meeting links directly when the event has one
- Overlay now supports snooze and dismiss controls

### Task 5: Windows Startup

Status: active

Acceptance:

- App can launch on login
- Startup behavior does not require manual window interaction

Progress:

- Windows login startup toggle is wired through Electron login item settings
- Tray and control-panel controls are wired
- Dev-shell startup is intentionally blocked because only packaged builds can reboot correctly
- `win-unpacked` packaging and packaged exe smoke launch now pass
- Installer-level verification is still pending

## Verification Notes

- `npm run build` passes
- `npm run smoke` passes
- `npm run package:smoke` passes
- Tray menu and overlay demo path are wired in the Electron shell
- Poll-now control and startup toggle are wired in the Electron shell
- Smoke now includes a real built-Electron launch check

## Backlog

- Artifact packs
- Theme variants
- Multi-account
- Outlook support
