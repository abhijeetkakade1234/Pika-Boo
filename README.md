# Pika-Boo

Pika-Boo is a Windows desktop reminder app that makes calendar events hard to miss.

Instead of standard notifications, it shows a moving banner across the top of the screen so your eyes catch the motion while you work.

## MVP

- Google sign-in
- Google Calendar read access
- Runs on Windows startup
- Background polling every 60 seconds
- Animated artifact reminder across the top of the screen
- Auto hide after 8 seconds

## Docs First

Read these before building:

1. [PROMPT.md](/D:/Pika-Boo/PROMPT.md)
2. [PROJECT.md](/D:/Pika-Boo/PROJECT.md)
3. [REQUIREMENTS.md](/D:/Pika-Boo/REQUIREMENTS.md)
4. [ARCHITECTURE.md](/D:/Pika-Boo/ARCHITECTURE.md)
5. [TASKS.md](/D:/Pika-Boo/TASKS.md)

## Planned Stack

- Electron
- React
- TypeScript
- Google Calendar API
- CSS animations first, heavier animation tooling only if needed

## Scripts

- `npm run dev`
- `npm run build`
- `npm run smoke`
- `npm run package:dir`
- `npm run package:smoke`

`npm run smoke` now launches the built Electron app in a smoke-test mode and fails on renderer load errors.
`npm run package:smoke` builds `release/win-unpacked` and smoke-launches the packaged exe.

## Current State

- Desktop shell is built
- Overlay reminder is wired
- Artifact-based overlay system is wired
- Google OAuth flow is wired
- Calendar polling and startup toggles are wired
- Windows startup is only supported in a packaged app, not the dev shell
- Unpacked Windows packaging is wired and smoke-verified
- Live end-to-end verification still needs a real Google desktop OAuth client

## Google Setup

Create a Google OAuth desktop client and use its client ID in the app before connecting Calendar.

## Repo Shape

```text
Pika-Boo/
|-- README.md
|-- PROMPT.md
|-- GOAL.md
|-- PROJECT.md
|-- REQUIREMENTS.md
|-- ARCHITECTURE.md
|-- UI_UX.md
|-- FEATURES.md
|-- ROADMAP.md
|-- API.md
|-- TECH_STACK.md
|-- CODING_GUIDELINES.md
|-- TASKS.md
|-- CHANGELOG.md
`-- docs/
    |-- flows.md
    |-- animations.md
    |-- notifications.md
    `-- google-auth.md
```
