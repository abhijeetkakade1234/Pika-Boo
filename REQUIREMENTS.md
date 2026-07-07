# Requirements

## Functional Requirements

### MVP

- User can sign into a Google account.
- App can request read-only access to Google Calendar.
- App stores auth state securely enough for a desktop MVP.
- App launches automatically on Windows startup.
- App runs without a main window staying open.
- App checks for upcoming events every 60 seconds.
- App identifies events that should trigger reminders.
- User can choose reminder lead time.
- App shows a top-of-screen banner reminder.
- Reminder includes at least event title and relative timing.
- Reminder auto-hides after 8 seconds.

### Post-MVP

- User can click a reminder to open a meeting link.
- User can snooze reminders.
- User can switch animation theme.
- User can use multiple calendars or accounts.

## Non-Functional Requirements

- Windows 10+ support first.
- Cold launch should feel near-instant after login.
- Idle CPU usage should stay low because the app runs continuously.
- Memory use should stay modest for an Electron app.
- App should recover cleanly from temporary Google API failures.
- Missing network should not crash the app.

## Constraints

- MVP is desktop-only.
- MVP reads calendar data but does not edit events.
- MVP favors polling over push because it is simpler to ship.
- MVP avoids adding backend infrastructure.

## Acceptance Criteria

### Reminder Behavior

- Event due within configured lead window is detected.
- Duplicate reminders are not shown repeatedly every poll.
- Banner appears above normal desktop content.
- Banner disappears automatically without leaving focus traps.

### Startup Behavior

- App can be installed and configured to start with Windows.
- After startup, app is reachable from the tray even if no main window is open.
