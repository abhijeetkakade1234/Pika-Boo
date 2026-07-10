import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  OAuthImportResult,
  ReminderPayload,
  RuntimeStatus,
  ThemeRuleAssignment,
} from './contracts';

export interface PikaBooBridge {
  showOverlayDemo: () => Promise<void>;
  openSettings: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  snoozeReminder: (reminderId: string, minutes: number) => Promise<void>;
  dismissReminder: (reminderId: string) => Promise<void>;
  getSelectedArtifact: () => Promise<ArtifactId>;
  setSelectedArtifact: (artifactId: ArtifactId) => Promise<RuntimeStatus>;
  getThemeRules: () => Promise<ThemeRuleAssignment[]>;
  setThemeRule: (key: ThemeRuleAssignment['key'], artifactId: ArtifactId) => Promise<ThemeRuleAssignment[]>;
  addThemeRule: (label: string, matchText: string, artifactId: ArtifactId) => Promise<ThemeRuleAssignment[]>;
  deleteThemeRule: (key: string) => Promise<ThemeRuleAssignment[]>;
  getAuthStatus: () => Promise<AuthStatus>;
  getGoogleOAuthConfig: () => Promise<GoogleOAuthConfig>;
  importGoogleOAuthConfig: () => Promise<OAuthImportResult>;
  saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => Promise<AuthStatus>;
  connectGoogle: () => Promise<AuthStatus>;
  disconnectGoogle: () => Promise<AuthStatus>;
  getRuntimeStatus: () => Promise<RuntimeStatus>;
  setStartupEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
  setPaused: (paused: boolean) => Promise<RuntimeStatus>;
  setWellnessEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
  setWellnessTypeEnabled: (kind: 'eye' | 'stand' | 'water', enabled: boolean) => Promise<RuntimeStatus>;
  setTimeAwarenessEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
  clearReminderHistory: () => Promise<RuntimeStatus>;
  pollNow: () => Promise<RuntimeStatus>;
  setSelectedCalendars: (calendarIds: string[]) => Promise<RuntimeStatus>;
  onRuntimeUpdated: (callback: () => void) => () => void;
  onOverlayShow: (callback: (payload: ReminderPayload) => void) => () => void;
}

const demoNow = new Date('2026-07-10T08:30:00+05:30').getTime();

const demoRuntimeStatus: RuntimeStatus = {
  startupEnabled: true,
  startupSupported: true,
  pollerRunning: true,
  paused: false,
  wellnessEnabled: true,
  eyeBreakEnabled: true,
  standBreakEnabled: true,
  waterBreakEnabled: true,
  timeAwarenessEnabled: true,
  reminderLeadMinutes: 5,
  reminderLeadTimes: [30, 5, 1],
  lastPollAt: demoNow,
  lastPollError: null,
  upcomingCount: 4,
  upcomingEvents: [
    {
      id: 'event-1',
      calendarId: 'team1',
      calendarSummary: 'Team1 Events',
      summary: 'Team1 India - Weekly Update Call',
      startAt: '2026-07-10T22:00:00+05:30',
      meetingUrl: 'https://meet.google.com/demo-link',
      kind: 'event',
    },
    {
      id: 'event-2',
      calendarId: 'family',
      calendarSummary: 'Family',
      summary: 'Mom birthday dinner',
      startAt: '2026-07-11T20:00:00+05:30',
      kind: 'event',
      label: 'Birthday',
    },
    {
      id: 'task-1',
      calendarId: 'tasks',
      calendarSummary: 'Google Tasks',
      summary: 'Pay electricity bill',
      startAt: '2026-07-12T09:00:00+05:30',
      dueAt: '2026-07-12T09:00:00+05:30',
      kind: 'task',
    },
    {
      id: 'event-3',
      calendarId: 'focus',
      calendarSummary: 'Work',
      summary: 'Deep work block',
      startAt: '2026-07-12T11:00:00+05:30',
      kind: 'event',
      label: 'Focus',
    },
  ],
  availableCalendars: [
    { id: 'demo', summary: 'demo@pikaboo.app', primary: true, selected: true, backgroundColor: '#d4b7ff' },
    { id: 'build-games', summary: 'Build Games', primary: false, selected: true, backgroundColor: '#cabdc4' },
    { id: 'family', summary: 'Family', primary: false, selected: true, backgroundColor: '#9cc4ec' },
    { id: 'team1', summary: 'Team1 Events', primary: false, selected: true, backgroundColor: '#ff7a3e' },
  ],
  artifactId: 'paper-plane',
  currentReminder: null,
  recentReminders: [
    {
      reminderId: 'time-awareness:2026-07-10T08:30:00+05:30',
      title: "It's 8:30 AM",
      subtitle: 'Quick time check so the day does not disappear on you.',
      artifactId: 'rocket',
      deliveredAt: demoNow,
    },
    {
      reminderId: 'water-break:2026-07-10T08:00:00+05:30',
      title: 'Water break',
      subtitle: 'Take a few sips and reset before the next push.',
      artifactId: 'ufo',
      deliveredAt: demoNow - 30 * 60_000,
    },
  ],
  eventTimeline: [
    {
      id: 'history-1',
      calendarId: 'team1',
      calendarSummary: 'Team1 Events',
      summary: 'Sprint planning',
      startAt: '2026-07-09T10:00:00+05:30',
      kind: 'event',
      lastSeenAt: demoNow - 2 * 60 * 60_000,
    },
  ],
};

const demoAuthStatus: AuthStatus = {
  configured: true,
  connected: true,
  hasRefreshToken: true,
  expiresAt: demoNow + 60 * 60_000,
  secureStorageAvailable: true,
};

const demoConfig: GoogleOAuthConfig = {
  clientId: '',
  clientSecret: '',
};

const demoThemeRules: ThemeRuleAssignment[] = [
  { key: 'task', label: 'Google Tasks', artifactId: 'cat', builtin: true },
  { key: 'meeting-link', label: 'Meetings with link', artifactId: 'paper-plane', builtin: true },
  { key: 'birthday', label: 'Birthdays', artifactId: 'santa', builtin: true },
  { key: 'focus-time', label: 'Focus time', artifactId: 'minimal', builtin: true },
  { key: 'water-break', label: 'Water break', artifactId: 'ufo', builtin: true },
  { key: 'eye-break', label: 'Eye relax break', artifactId: 'ghost', builtin: true },
  { key: 'stand-break', label: 'Stand and stretch', artifactId: 'train', builtin: true },
  { key: 'morning-briefing', label: 'Morning briefing', artifactId: 'rocket', builtin: true },
];

function noOpUnsubscribe(): () => void {
  return () => {};
}

function noOpRuntimeUpdate(): Promise<RuntimeStatus> {
  return Promise.resolve(demoRuntimeStatus);
}

const mockBridge: PikaBooBridge = {
  showOverlayDemo: () => Promise.resolve(),
  openSettings: () => Promise.resolve(),
  openExternal: () => Promise.resolve(),
  snoozeReminder: () => Promise.resolve(),
  dismissReminder: () => Promise.resolve(),
  getSelectedArtifact: () => Promise.resolve(demoRuntimeStatus.artifactId),
  setSelectedArtifact: (artifactId: ArtifactId) => Promise.resolve({ ...demoRuntimeStatus, artifactId }),
  getThemeRules: () => Promise.resolve(demoThemeRules),
  setThemeRule: () => Promise.resolve(demoThemeRules),
  addThemeRule: () => Promise.resolve(demoThemeRules),
  deleteThemeRule: () => Promise.resolve(demoThemeRules),
  getAuthStatus: () => Promise.resolve(demoAuthStatus),
  getGoogleOAuthConfig: () => Promise.resolve(demoConfig),
  importGoogleOAuthConfig: () => Promise.resolve({ config: demoConfig, cancelled: true } satisfies OAuthImportResult),
  saveGoogleOAuthConfig: () => Promise.resolve(demoAuthStatus),
  connectGoogle: () => Promise.resolve(demoAuthStatus),
  disconnectGoogle: () => Promise.resolve({ ...demoAuthStatus, connected: false, hasRefreshToken: false }),
  getRuntimeStatus: () => Promise.resolve(demoRuntimeStatus),
  setStartupEnabled: noOpRuntimeUpdate,
  setPaused: noOpRuntimeUpdate,
  setWellnessEnabled: noOpRuntimeUpdate,
  setWellnessTypeEnabled: () => noOpRuntimeUpdate(),
  setTimeAwarenessEnabled: noOpRuntimeUpdate,
  clearReminderHistory: noOpRuntimeUpdate,
  pollNow: noOpRuntimeUpdate,
  setSelectedCalendars: noOpRuntimeUpdate,
  onRuntimeUpdated: noOpUnsubscribe,
  onOverlayShow: (_callback: (payload: ReminderPayload) => void) => noOpUnsubscribe(),
};

export function getPikaBooBridge(): PikaBooBridge {
  return (window as Window & { pikaBoo?: PikaBooBridge }).pikaBoo ?? mockBridge;
}
