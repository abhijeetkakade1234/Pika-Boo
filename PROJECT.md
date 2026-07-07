# Project Vision

Pika-Boo is not a calendar replacement.

It is an ambient reminder layer for Windows that makes upcoming events visible through motion on the screen instead of notification-center spam.

## Problem

Normal notifications are easy to ignore:

- Windows toasts get dismissed automatically.
- Browser notifications blend into background noise.
- Phone reminders are useless when the phone is face down or elsewhere.

Motion across the main display is harder to miss.

## Goal

Make sure the user notices important calendar events without interrupting their workflow more than necessary.

## Product Shape

- Starts with Windows.
- Lives in the system tray or background.
- Connects to Google Calendar.
- Polls for upcoming events.
- Shows a moving banner across the top of the screen when a reminder is due.
- Hides itself when done.

## Target Users

- Developers
- Remote workers
- Founders
- Students
- Anyone who spends most of the day inside one screen

## Non-Goals

- Full calendar editing UI
- General-purpose to-do app
- Notes app
- Team collaboration suite
- Cross-platform release in MVP

## Product Principles

- Visible, not noisy
- Lightweight, not bloated
- Background-first, not window-first
- Useful by default, customizable later

## Success Criteria For MVP

- User can sign into Google.
- App can read the primary calendar.
- App starts with Windows.
- App keeps running quietly in the background.
- App surfaces upcoming events with a clear top-screen animation.
- User notices reminders more reliably than standard notifications.
