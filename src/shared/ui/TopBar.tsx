import type { ReactNode } from 'react';

export function TopBar({
  rightSlot,
}: {
  rightSlot: ReactNode;
}) {
  return (
    <header className="mb-8 flex w-full justify-end lg:mb-12">
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">{rightSlot}</div>
    </header>
  );
}
