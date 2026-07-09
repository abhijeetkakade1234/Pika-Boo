import { useEffect, useState } from 'react';
import { useDesktopControlState } from './useDesktopControlState';
import { ControlPanelShell } from '../features/control-panel/components/ControlPanelShell';
import type { ControlScreen } from '../features/control-panel/components/SidebarNav';
import { ArtifactGalleryPage } from '../features/control-panel/pages/ArtifactGalleryPage';
import { MissionControlPage } from '../features/control-panel/pages/MissionControlPage';
import { PlaceholderPage } from '../features/control-panel/pages/PlaceholderPage';
import { SettingsPage } from '../features/control-panel/pages/SettingsPage';
import { OverlayPage } from '../features/overlay/OverlayPage';
import type { ReminderPayload } from '../shared/contracts';

const defaultReminder: ReminderPayload = {
  reminderId: 'demo-reminder',
  title: 'Product Strategy Sync',
  subtitle: 'Starts in 5 minutes',
  artifactId: 'cat',
};

function OverlayEntry() {
  const [reminder, setReminder] = useState<ReminderPayload>(defaultReminder);

  useEffect(() => {
    return window.pikaBoo.onOverlayShow((payload) => {
      setReminder(payload);
    });
  }, []);

  return <OverlayPage reminder={reminder} />;
}

function ControlPanelEntry() {
  const [activeScreen, setActiveScreen] = useState<ControlScreen>('mission-control');
  const desktop = useDesktopControlState();

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
            onNavigate={setActiveScreen}
            onConnectGoogle={desktop.authStatus?.configured ? desktop.connectGoogle : goToSettingsIfNeeded}
            onShowDemo={() => window.pikaBoo.showOverlayDemo()}
          />
        );
      case 'artifacts':
        return (
          <ArtifactGalleryPage
            artifactId={desktop.artifactId}
            onSelectArtifact={desktop.saveArtifact}
            onShowDemo={() => window.pikaBoo.showOverlayDemo()}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            config={desktop.config}
            authStatus={desktop.authStatus}
            runtimeStatus={desktop.runtimeStatus}
            busy={desktop.busy}
            error={desktop.error}
            setConfig={desktop.setConfig}
            onSaveConfig={desktop.saveConfig}
            onImportGoogleConfig={desktop.importGoogleConfig}
            onConnectGoogle={desktop.connectGoogle}
            onDisconnectGoogle={desktop.disconnectGoogle}
            onToggleStartup={desktop.toggleStartup}
            onTogglePaused={desktop.togglePaused}
            onPollNow={desktop.pollNow}
            onSaveReminderLeadMinutes={desktop.saveReminderLeadMinutes}
          />
        );
      case 'moments':
        return (
          <PlaceholderPage
            title="Moments"
            description="This feature folder is ready for ambient recap history, delivered reminder logs, and saved flights."
          />
        );
      case 'flights':
        return (
          <PlaceholderPage
            title="Flights"
            description="This feature folder is ready for recurring reminder routes, delivery schedules, and future multi-account paths."
          />
        );
      case 'themes':
        return (
          <PlaceholderPage
            title="Themes"
            description="This feature folder is ready for colorway packs, seasonal skins, and expanded companion styling."
          />
        );
      default:
        return null;
    }
  })();

  return (
    <ControlPanelShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {page}
    </ControlPanelShell>
  );
}

export default function App() {
  return window.location.hash === '#overlay' ? <OverlayEntry /> : <ControlPanelEntry />;
}
