# UI and UX

## Primary Experience

The app is mostly invisible until it needs to show a reminder.

## Surfaces

### Tray

- Tray icon is the primary anchor.
- Menu actions:
- Open settings
- Reconnect Google
- Pause reminders
- Quit

### Settings Window

MVP settings can stay small:

- Google account connection state
- Artifact selector
- Reminder lead time
- Launch on startup toggle
- Test reminder button

### Overlay Reminder

- Positioned at the top edge of the screen
- Transparent window background
- Artifact moves horizontally across the screen carrying the message
- Always on top
- Visible long enough to be noticed
- Minimal text, large enough to scan quickly

## Banner Content

Default format:

```text
[artifact] carries the message card
Event title
Starts in X minutes
```

Fallback if timing text is not useful:

```text
[icon] Event title
```

## Visual Direction

- Clean and playful, not corporate
- Motion is the main attention signal
- No giant modal feel
- No noisy notification-center styling
- Artifact choice is part of the product identity

## Interaction Rules

- Banner should not steal keyboard focus.
- Banner should not block the whole screen width unless animation needs it.
- Clicking the banner is optional in MVP and can be added later.
