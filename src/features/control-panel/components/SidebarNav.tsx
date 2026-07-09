import type { ReactNode } from 'react';

export type ControlScreen =
  | 'mission-control'
  | 'moments'
  | 'artifacts'
  | 'flights'
  | 'themes'
  | 'settings';

const navItems = [
  { id: 'mission-control', label: 'Mission Control', icon: 'dashboard', fill: true },
  { id: 'moments', label: 'Moments', icon: 'auto_awesome' },
  { id: 'artifacts', label: 'Artifacts', icon: 'inventory_2' },
  { id: 'flights', label: 'Flights', icon: 'flight_takeoff' },
  { id: 'themes', label: 'Themes', icon: 'palette' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
] as const;

export function SidebarNav({
  activeScreen,
  onNavigate,
  profile,
}: {
  activeScreen: ControlScreen;
  onNavigate: (screen: ControlScreen) => void;
  profile?: ReactNode;
}) {
  return (
    <aside className="fixed bottom-6 left-6 top-6 z-50 flex w-sidebar-width flex-col gap-10 rounded-[28px] bg-sidebar-charcoal p-8 shadow-panel-soft">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-white">Pika Boo</h1>
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-fixed-variant">
          Ambient Space
        </p>
      </div>

      <nav className="flex flex-col gap-4">
        {navItems.map((item, index) => {
          const active = item.id === activeScreen;
          const isSettings = index === navItems.length - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'flex items-center gap-4 p-4 text-left transition-all duration-300 active:scale-95',
                isSettings ? 'mt-auto' : '',
                active
                  ? 'rounded-xl bg-surface-container-highest text-sidebar-charcoal'
                  : 'text-on-secondary-fixed-variant hover:scale-105 hover:text-white',
              ].join(' ')}
            >
              <span
                className="material-symbols-outlined"
                style={active && item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">{profile}</div>
    </aside>
  );
}
