import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type {
  CommunityRecommendationsResult,
  EventFormat,
  UserProfile,
} from '../types/career';
import {
  checkCommunityInputCompleteness,
  EVENT_FORMAT_OPTIONS,
  getEventFormatLabel,
} from '../utils/validation';
import { GroundedSourcesList } from './GroundedSourcesList';

interface EventsCommunityViewProps {
  profile: UserProfile;
  profileReady: boolean;
  eventsResult: CommunityRecommendationsResult | null;
  loading: boolean;
  errorMessage: string;
  onUpdateCommunityDetails: (updates: Partial<UserProfile>, fetchAfter: boolean) => void;
  onFetchEvents: () => void;
  onGoToProfile: () => void;
}

export function EventsCommunityView({
  profile,
  profileReady,
  eventsResult,
  loading,
  errorMessage,
  onUpdateCommunityDetails,
  onFetchEvents,
  onGoToProfile,
}: EventsCommunityViewProps) {
  const [hobbiesDraft, setHobbiesDraft] = useState(profile.hobbies);
  const [formatDraft, setFormatDraft] = useState<EventFormat>(profile.eventFormat);
  const [cityDraft, setCityDraft] = useState(profile.city);

  useEffect(() => {
    setHobbiesDraft(profile.hobbies);
    setFormatDraft(profile.eventFormat);
    setCityDraft(profile.city);
  }, [profile.hobbies, profile.eventFormat, profile.city]);

  const previewProfile: UserProfile = {
    ...profile,
    hobbies: hobbiesDraft,
    eventFormat: formatDraft,
    city: cityDraft,
  };
  const completeness = checkCommunityInputCompleteness(previewProfile);

  if (!profileReady) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Önce Hedef Rol ve Profilinizi Tamamlayın
        </h2>
        <p className="text-sm text-slate-600">
          Hobilerinize uygun ücretsiz atölye ve topluluk önerilerini kariyer dengenize bağlayabilmemiz
          için önce temel profil adımlarını doldurun.
        </p>
        <button
          type="button"
          onClick={onGoToProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
        >
          <span>Profil Kurulumuna Git</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    );
  }

  const handleApplyAndFetch = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCommunityDetails(
      {
        hobbies: hobbiesDraft,
        eventFormat: formatDraft,
        city: cityDraft,
      },
      completeness.ready
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Interactive Detail Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span>{profile.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>Format: {getEventFormatLabel(profile.eventFormat)}</span>
              {profile.city.trim() && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Şehir: {profile.city}</span>
                </>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Hobi Odaklı Ücretsiz Atölye, Seminer ve Topluluk Önerileri
            </h1>
          </div>

          <button
            type="button"
            onClick={onFetchEvents}
            disabled={loading || !completeness.ready}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg whitespace-nowrap shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Öneriler Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Etkinlik Formatlarını Öner</span>
              </>
            )}
          </button>
        </div>

        {/* Inline prompt when city, format, or hobbies need clarification */}
        <form
          onSubmit={handleApplyAndFetch}
          className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-5 space-y-1.5">
            <label htmlFor="ev-hobbies" className="block text-xs font-medium text-slate-700">
              İlgi Alanları ve Hobiler
            </label>
            <input
              id="ev-hobbies"
              type="text"
              value={hobbiesDraft}
              onChange={(e) => setHobbiesDraft(e.target.value)}
              placeholder="Örn: Fotoğrafçılık, satranç, kitap kulübü"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="ev-format" className="block text-xs font-medium text-slate-700">
              Katılım Formatı
            </label>
            <select
              id="ev-format"
              value={formatDraft}
              onChange={(e) => setFormatDraft(e.target.value as EventFormat)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            >
              {EVENT_FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="ev-city" className="block text-xs font-medium text-slate-700">
              Şehir
            </label>
            <input
              id="ev-city"
              type="text"
              value={cityDraft}
              onChange={(e) => setCityDraft(e.target.value)}
              placeholder="Örn: İstanbul"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-3.5 py-2 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg whitespace-nowrap"
            >
              Uygula & Öner
            </button>
          </div>
        </form>

        {!completeness.ready && (
          <div
            role="status"
            className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm"
          >
            {completeness.promptMessage}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Güvenilirlik ilkesi: Öneriler Google Arama bulgularıyla desteklenir; güncel tarih veya
          kontenjan uydurulmaz, doğrulanan topluluk ve platform bağlantıları aşağıda listelenir.
        </p>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {eventsResult?.needsMoreDetails && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          {eventsResult.missingDetailPrompt}
        </div>
      )}

      {loading && (
        <div aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="bg-white border border-slate-200 rounded-xl p-6 h-52" />
          ))}
        </div>
      )}

      {eventsResult && !eventsResult.needsMoreDetails && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventsResult.recommendations.map((ev, idx) => (
            <article
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-blue-700">{ev.benefitCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ev.eventType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ev.format}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ev.cityContext}</span>
                </div>

                <h2 className="font-display text-lg font-semibold text-slate-900">{ev.title}</h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Hobi Bağlantısı: </span>
                  {ev.hobbyConnection}
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-slate-800">
                    Kariyer ve Denge Katkısı ({ev.benefitCategory})
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {ev.careerBenefit}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Nerede / Nasıl Bulunur: </span>
                {ev.platformOrVenueLogic}
              </div>
            </article>
          ))}
        </div>
      )}

      {eventsResult && !eventsResult.needsMoreDetails && !loading && (
        <GroundedSourcesList
          sources={eventsResult.sources}
          subtitle="Topluluk ve açık atölye ekosistemleri güncel Google Arama sonuçlarıyla desteklenmiştir."
        />
      )}
    </div>
  );
}
