# Google Auth Notes

## MVP Goal

Allow the app to read calendar events from the user's Google account with the minimum scope needed.

## Scope Direction

- Prefer read-only calendar access
- Scope: `https://www.googleapis.com/auth/calendar.readonly`

## Flow Direction

- Desktop OAuth flow with the system browser
- Loopback callback on `127.0.0.1`
- Persist refreshable auth state locally
- Recover on relaunch without forcing login every time

## Risks

- Token storage must not be sloppy
- Expired or revoked auth must be recoverable
- Browser-based auth callback wiring needs to work cleanly on Windows
