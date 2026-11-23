import type { WorkspaceTab } from '../types/career';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onPrimaryAction: () => void;
  hasActiveSession: boolean;
  profileReady: boolean;
}

const NAV_ITEMS: ReadonlyArray<{ id: WorkspaceTab; label: string }> = [
  { id: 'profile', label: 'Profil' },
  { id: 'interview', label: 'Mülakat' },
  { id: 'analysis', label: 'CV & Analiz' },
  { id: 'courses', label: 'Eğitimler' },
  { id: 'events', label: 'Etkinlikler' },
];

export function TopBar({
  activeTab,
  onSelectTab,
  onPrimaryAction,
  hasActiveSession,
  profileReady,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('profile');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Kariyer Pusulası
        </a>

        {/* Zone 2: 5 single-line navigation links */}
        <nav
          aria-label="Ana çalışma alanı sekmeleri"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-4 text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {hasActiveSession
              ? 'Yeni Mülakat'
              : profileReady
                ? 'Mülakata Başla'
                : 'Profili Tamamla'}
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobil sekmeler"
        className="md:hidden border-t border-slate-100 bg-white px-4 flex items-center gap-4 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 ${
                isActive
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
