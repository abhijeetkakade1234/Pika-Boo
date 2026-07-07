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
- Token persistence is wired
- Token refresh is wired
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
- Live event fetch still needs a connected Google account to verify end-to-end

### Task 4: Reminder Overlay

Status: completed

Acceptance:

- Banner appears at top of screen
- Animation is readable
- Banner hides after 8 seconds

### Task 5: Windows Startup

Status: active

Acceptance:

- App can launch on login
- Startup behavior does not require manual window interaction

Progress:

- Windows login startup toggle is wired through Electron login item settings
- Tray and control-panel controls are wired
- Installer-level verification is still pending

## Verification Notes

- `npm run build` passes
- `npm run smoke` passes
- Tray menu and overlay demo path are wired in the Electron shell
- Poll-now control and startup toggle are wired in the Electron shell

## Backlog

- Meeting-link clickthrough
- Snooze
- Theme variants
- Multi-account
- Outlook support
