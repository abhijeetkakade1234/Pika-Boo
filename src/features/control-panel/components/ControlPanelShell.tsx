import type { ReactNode } from 'react';
import { SidebarNav, type ControlScreen } from './SidebarNav';

export function ControlPanelShell({
  activeScreen,
  onNavigate,
  children,
}: {
  activeScreen: ControlScreen;
  onNavigate: (screen: ControlScreen) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-warm text-on-background">
      <div className="blob-bg -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-flamingo-pink" />
      <div className="blob-bg -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-sky-blue" />

      <SidebarNav
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        profile={
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-primary-fixed-dim ring-2 ring-primary/20">
              <img
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaFk0TTShQCuo5Y6wjJzV7VZpXWNjig9MOk5NNCpYoN7Sp64ve_AM3-ZuyDUzQePusMZnRmGd06UGSp6yVPfP0tz7C47hfMp7zRXbm-pP0zChKknpY7r0fVOHVfak6V705TrwwhP3lKZdMBOGOeM_oN7uT_Q_n3rGcPV_cxqRGxOkvFeKf3jas1GeHHwLQZwwFsnzlb2ScG9A1uOoekYlKWbvs3hMnYPVqm9CAb2ZtWPEJpWIceiUNUA"
                alt="Profile"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-body-md font-semibold text-white">Alex Chen</span>
              <span className="text-xs text-on-secondary-fixed-variant">Premium Explorer</span>
            </div>
          </div>
        }
      />

      <main className="relative z-10 ml-sidebar-width min-h-screen px-container-margin py-8">
        {children}
      </main>
    </div>
  );
}
