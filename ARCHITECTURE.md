# Architecture

## MVP Shape

```text
Windows Startup
    |
    v
Electron Main Process
    |
    +-- Tray Controller
    +-- Startup Controller
    +-- Auth Service
    +-- Calendar Poller
    +-- Reminder Scheduler
    +-- Artifact Settings
    `-- Overlay Window
            |
            `-- Artifact Renderer
```

## Module Responsibilities

### Electron Main Process

Owns app lifecycle, background work, and native integrations.

### Tray Controller

Creates the tray icon, basic menu, and quit/open actions.

### Startup Controller

Enables launch on Windows login.

### Auth Service

Handles Google OAuth flow, token storage, token refresh, and logout.

### Calendar Poller

Fetches upcoming events on a fixed interval.

### Reminder Scheduler

Turns calendar events into reminder decisions and suppresses duplicates.

### Artifact Settings

Persists the currently selected artifact and attaches it to reminder payloads.

### Overlay Window

Small always-on-top transparent window pinned to the top of the screen for the moving artifact UI.

### Artifact Renderer

Draws the chosen artifact carrying the reminder. Keep this thin; business logic stays in main-side services.

## Data Flow

```text
Startup
    -> Restore auth
    -> Start polling
    -> Fetch upcoming events
    -> Decide whether a reminder is due
    -> If yes, send payload to overlay window
    -> Animate
    -> Auto hide
```

## Why This Shape

- One desktop app process boundary is enough for MVP.
- No server is needed.
- Polling is good enough before push/webhooks exist.
- Main process owns scheduling so reminders still work when no visible window is open.

## Deferred Complexity

- No local database in MVP unless token/event caching actually needs it.
- No plugin animation system in MVP.
- No event write-back path in MVP.
