# Core Flows

## First Run

```text
Install
 -> Launch
 -> Connect Google
 -> Grant calendar access
 -> App lands in tray/background
 -> Polling starts
```

## Reminder Flow

```text
Poll calendar
 -> Find event inside reminder window
 -> Check it has not already been shown
 -> Send reminder payload to overlay
 -> Animate across top of screen
 -> Mark as shown
```

## Reconnect Flow

```text
Auth expired
 -> Surface reconnect state in tray/settings
 -> User reconnects
 -> Polling resumes
```
