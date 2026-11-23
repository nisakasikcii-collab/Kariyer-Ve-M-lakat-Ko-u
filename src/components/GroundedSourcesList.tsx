import { ExternalLink } from 'lucide-react';
import type { GroundingSource } from '../types/career';

interface GroundedSourcesListProps {
  sources?: GroundingSource[];
  subtitle?: string;
}

export function GroundedSourcesList({ sources, subtitle }: GroundedSourcesListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Google Arama ile doğrulanan kaynaklar"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
    >
      <div className="space-y-1">
        <h2 className="font-display text-base font-semibold text-slate-900">
          Google Arama ile Doğrulanmış Kaynaklar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {subtitle ||
            'Öneriler güncel web araması (Google Search Grounding) bulguları ile desteklenmiştir.'}
        </p>
      </div>

      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
        {sources.map((source) => (
          <li key={source.uri}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {source.title}
                </div>
                <div className="text-xs text-slate-500 truncate">{source.domain}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
