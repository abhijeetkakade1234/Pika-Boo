# Current Goal

Build a Windows desktop app that makes upcoming Google Calendar events hard to miss through a moving top-screen reminder.

## What "done" means for MVP

- User signs into Google
- App reads upcoming calendar events
- App starts with Windows
- App lives in tray/background
- App polls every 60 seconds
- App shows an animated top banner reminder
- Reminder auto-hides after 8 seconds

## What exists now

- Electron + React + TypeScript scaffold
- Tray menu
- Transparent overlay window
- Local reminder demo path
- Google OAuth desktop-flow wiring
- Calendar polling and duplicate reminder suppression wiring
- Configurable reminder lead time in control panel and tray
- Built-in artifact selector with ghost, rocket, train, UFO, cat, paper plane, santa, and minimal variants
- Reminder actions for meeting-link open, snooze, and dismiss
- Windows startup toggle wiring
- Unpacked Windows packaging plus packaged smoke-launch verification

## What still blocks true MVP done

- Live Google OAuth sign-in still needs a real desktop client to verify end to end
- Live calendar fetch still needs a connected Google account to verify against real events
- Installer-level Windows startup still needs verification outside the smoke package path

## Build Order

1. Scaffold shell
2. Reminder shell and artifact experience
3. Google OAuth
4. Calendar polling on live data
5. Windows startup verification

## Not in MVP

- Editing calendar events
- Fancy theme packs
- Outlook support
- AI summaries
