import type { ReactNode } from 'react';

export type ControlScreen =
  | 'mission-control'
  | 'moments'
  | 'flights'
  | 'themes'
  | 'settings';

const navItems = [
  { id: 'mission-control', label: 'Dashboard', icon: 'dashboard', fill: true },
  { id: 'moments', label: 'Moments', icon: 'auto_awesome' },
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
    <aside className="relative z-50 mb-4 flex flex-col gap-6 rounded-[24px] bg-sidebar-charcoal p-4 shadow-panel-soft sm:p-6 lg:fixed lg:bottom-6 lg:left-6 lg:top-6 lg:mb-0 lg:w-sidebar-width lg:gap-10 lg:rounded-[28px] lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-white sm:text-headline-lg">Pika Boo</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-fixed-variant sm:font-label-caps sm:text-label-caps">
          Ambient Reminders
        </p>
      </div>

      <nav className="flex flex-wrap gap-3 lg:flex-col lg:gap-4">
        {navItems.map((item, index) => {
          const active = item.id === activeScreen;
          const isSettings = index === navItems.length - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-300 active:scale-95 sm:gap-4 sm:px-4',
                isSettings ? 'lg:mt-auto' : '',
                active
                  ? 'bg-surface-container-highest text-sidebar-charcoal'
                  : 'text-on-secondary-fixed-variant hover:scale-105 hover:text-white',
              ].join(' ')}
            >
              <span
                className="material-symbols-outlined"
                style={active && item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] sm:font-label-caps sm:text-label-caps sm:tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="w-full lg:mt-auto">{profile}</div>
    </aside>
  );
}
