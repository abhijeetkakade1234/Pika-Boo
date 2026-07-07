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

### Task 3: Calendar Poller

Status: pending

Acceptance:

- Poll runs every 60 seconds
- Upcoming events are fetched
- Duplicate reminders are suppressed

### Task 4: Reminder Overlay

Status: pending

Acceptance:

- Banner appears at top of screen
- Animation is readable
- Banner hides after 8 seconds

### Task 5: Windows Startup

Status: pending

Acceptance:

- App can launch on login
- Startup behavior does not require manual window interaction

## Verification Notes

- `npm run build` passes
- Tray menu and overlay demo path are wired in the Electron shell

## Backlog

- Meeting-link clickthrough
- Snooze
- Theme variants
- Multi-account
- Outlook support
