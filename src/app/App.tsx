import { useEffect, useState } from 'react';
import { useDesktopControlState } from './useDesktopControlState';
import { ControlPanelShell } from '../features/control-panel/components/ControlPanelShell';
import type { ControlScreen } from '../features/control-panel/components/SidebarNav';
import { FlightsPage } from '../features/control-panel/pages/FlightsPage';
import { MissionControlPage } from '../features/control-panel/pages/MissionControlPage';
import { MomentsPage } from '../features/control-panel/pages/MomentsPage';
import { SettingsPage } from '../features/control-panel/pages/SettingsPage';
import { ThemesPage } from '../features/control-panel/pages/ThemesPage';
import { OverlayPage } from '../features/overlay/OverlayPage';
import type { ReminderPayload } from '../shared/contracts';
import { getPikaBooBridge } from '../shared/pikaBooBridge';

const defaultReminder: ReminderPayload = {
  reminderId: 'demo-reminder',
  title: 'Product Strategy Sync',
  subtitle: 'Starts in 5 minutes',
  artifactId: 'cat',
};

function OverlayEntry() {
  const pikaBoo = getPikaBooBridge();
  const [reminder, setReminder] = useState<ReminderPayload>(defaultReminder);

  useEffect(() => {
    return pikaBoo.onOverlayShow((payload) => {
      setReminder(payload);
    });
  }, []);

  return <OverlayPage reminder={reminder} />;
}

function ControlPanelEntry() {
  const pikaBoo = getPikaBooBridge();
  const initialScreen = (() => {
    const value = new URLSearchParams(window.location.search).get('screen');
    return value === 'mission-control' || value === 'moments' || value === 'flights' || value === 'themes' || value === 'settings'
      ? value
      : 'mission-control';
  })();
  const [activeScreen, setActiveScreen] = useState<ControlScreen>(initialScreen);
  const desktop = useDesktopControlState();
  const primaryCalendar = desktop.runtimeStatus?.availableCalendars.find((calendar) => calendar.primary);
  const selectedCalendarCount = desktop.runtimeStatus?.availableCalendars.filter((calendar) => calendar.selected).length ?? 0;
  const accountLabel = primaryCalendar?.summary ?? (desktop.authStatus?.connected ? 'Google Connected' : 'Not Connected');
  const accountMeta = desktop.authStatus?.connected
    ? `${selectedCalendarCount} calendar${selectedCalendarCount === 1 ? '' : 's'} selected`
    : 'Connect Google Calendar';

  const goToSettingsIfNeeded = async () => {
    setActiveScreen('settings');
  };

  const page = (() => {
    switch (activeScreen) {
      case 'mission-control':
        return (
          <MissionControlPage
            authStatus={desktop.authStatus}
            runtimeStatus={desktop.runtimeStatus}
            busy={desktop.busy}
            pendingAction={desktop.pendingAction}
            onNavigate={setActiveScreen}
            onConnectGoogle={desktop.authStatus?.configured ? desktop.connectGoogle : goToSettingsIfNeeded}
            onClearHistory={desktop.clearReminderHistory}
            onShowDemo={() => pikaBoo.showOverlayDemo()}
            onPollNow={desktop.pollNow}
            onTogglePaused={desktop.togglePaused}
          />
        );
      case 'moments':
        return (
          <MomentsPage
            runtimeStatus={desktop.runtimeStatus}
            busy={desktop.busy}
            pendingAction={desktop.pendingAction}
            onPollNow={desktop.pollNow}
          />
        );
      case 'flights':
        return (
          <FlightsPage
            runtimeStatus={desktop.runtimeStatus}
            busy={desktop.busy}
            pendingAction={desktop.pendingAction}
            onPollNow={desktop.pollNow}
            onTogglePaused={desktop.togglePaused}
            onClearHistory={desktop.clearReminderHistory}
            onShowDemo={() => pikaBoo.showOverlayDemo()}
          />
        );
      case 'themes':
        return (
          <ThemesPage
            artifactId={desktop.artifactId}
            runtimeStatus={desktop.runtimeStatus}
            themeRules={desktop.themeRules}
            busy={desktop.busy}
            pendingAction={desktop.pendingAction}
            onSelectArtifact={desktop.saveArtifact}
            onSaveThemeRule={desktop.saveThemeRule}
            onAddThemeRule={desktop.addThemeRule}
            onDeleteThemeRule={desktop.deleteThemeRule}
            onShowDemo={() => pikaBoo.showOverlayDemo()}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            config={desktop.config}
            authStatus={desktop.authStatus}
            runtimeStatus={desktop.runtimeStatus}
            busy={desktop.busy}
            pendingAction={desktop.pendingAction}
            error={desktop.error}
            setConfig={desktop.setConfig}
            onSaveConfig={desktop.saveConfig}
            onImportGoogleConfig={desktop.importGoogleConfig}
            onConnectGoogle={desktop.connectGoogle}
            onDisconnectGoogle={desktop.disconnectGoogle}
            onToggleStartup={desktop.toggleStartup}
            onTogglePaused={desktop.togglePaused}
            onToggleWellness={desktop.toggleWellness}
            onToggleWellnessType={desktop.toggleWellnessType}
            onToggleTimeAwareness={desktop.toggleTimeAwareness}
            onPollNow={desktop.pollNow}
            onSaveSelectedCalendars={desktop.saveSelectedCalendars}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <ControlPanelShell
      activeScreen={activeScreen}
      onNavigate={setActiveScreen}
      accountLabel={accountLabel}
      accountMeta={accountMeta}
    >
      {page}
    </ControlPanelShell>
  );
}

export default function App() {
  return window.location.hash === '#overlay' ? <OverlayEntry /> : <ControlPanelEntry />;
}
