# Features

## Google Sign-In

User signs into Google and grants calendar read access.

Acceptance:

- Sign-in flow completes reliably.
- Token can be reused between launches.
- Auth failure is recoverable.

## Background Runtime

App stays alive in tray/background without requiring a visible main window.

Acceptance:

- Closing the settings window does not kill reminders.
- Quit action is explicit from tray/menu.
- Reminders can be paused without quitting the app.

## Calendar Polling

App checks for upcoming events on a fixed interval.

Acceptance:

- Poll runs every 60 seconds in MVP.
- Failures do not crash the app.
- Past events are ignored.

## Reminder Overlay

Animated banner appears when a reminder is due.

Acceptance:

- Overlay is always on top.
- Reminder content is readable.
- Reminder hides itself after the animation window ends.
- User can switch between built-in artifact styles.
- User can preview built-in artifact styles from the control panel.
- Reminder can open a meeting link when the event has one.
- Reminder can be snoozed or dismissed locally.

## Startup Launch

App can start with Windows login.

Acceptance:

- Startup registration can be enabled.
- App resumes background behavior after launch.
