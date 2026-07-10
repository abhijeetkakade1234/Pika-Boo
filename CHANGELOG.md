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
- Added snooze and dismiss controls to reminder artifacts
- Added pause/resume mode for reminders in tray and control panel
- Added configurable reminder lead time to the control panel and poller runtime
- Added tray-side reminder lead-time controls for background-only use
- Added cat, paper-plane, and santa built-in reminder artifacts
- Added inline artifact previews to the control panel
- Added NSIS installer build and installer-artifact smoke verification
- Added an in-app proof-gap list for remaining Google and installer verification work
- Rebuilt the renderer around the imported neo-brutal UI templates with feature-folder structure
- Added Google calendar-list loading with selectable reminder calendars
- Changed reminder delivery to poll-plus-local-scheduling so fetched events can fire exactly on the lead-time boundary
- Replaced remote artifact preview URLs with local SVG artwork and added a shipped Pika-Boo logo
