# Changelog

## Unreleased

- Added product and engineering documentation baseline
- Defined MVP scope, architecture, and first task queue
- Added Electron + React + TypeScript scaffold
- Added tray menu and transparent overlay demo shell
- Added Google OAuth desktop-flow wiring and local token/config storage
- Added Calendar polling, reminder scheduling, and Windows startup wiring
- Tightened token storage, config round-trip, and runtime status refresh
- Fixed production renderer path and upgraded smoke verification to a real Electron launch
- Added unpacked Windows packaging with packaged-exe smoke verification
- Added upcoming-event visibility in the control panel with external meeting-link open
- Replaced the plain overlay banner with a persisted artifact system
- Split artifact rendering into dedicated renderer-side definitions and selector wiring
- Added import of Google desktop OAuth client JSON for faster end-to-end setup
- Added meeting-link clickthrough directly from reminder artifacts
