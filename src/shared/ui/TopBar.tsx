import type { ReactNode } from 'react';

export function TopBar({
  searchPlaceholder,
  rightSlot,
}: {
  searchPlaceholder: string;
  rightSlot: ReactNode;
}) {
  return (
    <header className="mb-12 flex h-24 w-full items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="group flex items-center rounded-full border border-white/50 bg-white/40 px-6 py-3 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60">
          <span className="material-symbols-outlined mr-3 text-primary">search</span>
          <input
            className="w-64 border-none bg-transparent font-body-md text-on-background placeholder:text-outline focus:outline-none"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">{rightSlot}</div>
    </header>
  );
}
