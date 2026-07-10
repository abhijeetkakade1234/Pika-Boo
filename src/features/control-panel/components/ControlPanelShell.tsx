import type { ReactNode } from 'react';
import { SidebarNav, type ControlScreen } from './SidebarNav';

export function ControlPanelShell({
  activeScreen,
  onNavigate,
  accountLabel,
  accountMeta,
  children,
}: {
  activeScreen: ControlScreen;
  onNavigate: (screen: ControlScreen) => void;
  accountLabel: string;
  accountMeta: string;
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
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/5 p-3 sm:gap-4 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim font-label-caps text-label-caps uppercase text-sidebar-charcoal ring-2 ring-primary/20">
              {accountLabel.slice(0, 1)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-body-md font-semibold text-white">{accountLabel}</span>
              <span className="truncate text-xs text-on-secondary-fixed-variant">{accountMeta}</span>
            </div>
          </div>
        }
      />

      <main className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 lg:ml-sidebar-width lg:px-container-margin lg:py-8">
        {children}
      </main>
    </div>
  );
}
