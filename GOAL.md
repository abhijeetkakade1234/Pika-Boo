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
- Windows startup toggle wiring

## Build Order

1. Scaffold shell
2. Google OAuth
3. Calendar polling
4. Reminder scheduling
5. Windows startup

## Not in MVP

- Editing calendar events
- Outlook support
- Fancy theme packs
- AI summaries
