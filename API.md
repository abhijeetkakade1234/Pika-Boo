# API Notes

## Google Calendar API

Primary use:

- Read upcoming events from the user's calendar

Expected needs:

- OAuth 2.0 desktop flow
- Calendar read-only scope
- Event list endpoint

## MVP Scope

- Primary calendar is enough
- Read-only access is enough
- Polling is enough

## Likely Data Needed From Events

- Event id
- Title / summary
- Start time
- End time
- Conference or meeting link if present
- Calendar or category metadata if available

## Deferred Integrations

- Outlook calendar
- Apple calendar / CalDAV
- Weather
- AI briefing services
