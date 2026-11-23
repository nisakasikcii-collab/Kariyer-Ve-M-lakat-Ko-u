import { useState } from 'react';
import { AlertCircle, ArrowRight, Check, Copy, Loader2, RefreshCw } from 'lucide-react';
import type { CourseRecommendation, GroundingSource, UserProfile } from '../types/career';
import { getExperienceLevelLabel } from '../utils/validation';
import { GroundedSourcesList } from './GroundedSourcesList';

interface CoursesViewProps {
  profile: UserProfile;
  profileReady: boolean;
  weakCompetencies: string[];
  courses: CourseRecommendation[];
  courseSources?: GroundingSource[];
  loading: boolean;
  errorMessage: string;
  onFetchCourses: () => void;
  onGoToProfile: () => void;
}

export function CoursesView({
  profile,
  profileReady,
  weakCompetencies,
  courses,
  courseSources,
  loading,
  errorMessage,
  onFetchCourses,
  onGoToProfile,
}: CoursesViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyKeyword = async (keyword: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(keyword);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  };

  if (!profileReady) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Eğitim Önerileri İçin Önce Profilinizi Tanımlayın
        </h2>
        <p className="text-sm text-slate-600">
          Hedef rol ve deneyim seviyenizi girdiğinizde, açıklarınızı kapatmaya yönelik eğitim
          türlerini ve platform mantığını listeleyebiliriz.
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

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span>{profile.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{getExperienceLevelLabel(profile.experienceLevel)}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Yetkinlik Odaklı Kurs ve Eğitim Önerileri
            </h1>
          </div>

          <button
            type="button"
            onClick={onFetchCourses}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Öneriler Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>{courses.length > 0 ? 'Önerileri Güncelle' : 'Eğitim Önerileri Oluştur'}</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex flex-col gap-1.5">
          <div>
            <span className="font-semibold text-slate-800">Referans Alınan Yetkinlik Açıkları: </span>
            {weakCompetencies.length > 0
              ? weakCompetencies.join(' · ')
              : 'Henüz mülakat verisi yok; hedef rol ve seviye için temel kritik yetkinlikler baz alınır.'}
          </div>
          <div className="text-xs text-slate-500">
            Güvenilirlik ilkesi: Öneriler güncel Google Arama bulgularıyla desteklenir; emin
            olunmayan tarih, kontenjan veya sahte bağlantı uydurulmaz, doğrulanan kaynaklar
            aşağıda listelenir.
          </div>
        </div>
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

      {courses.length === 0 && !loading && !errorMessage && (
        <section className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Rol ve Zayıf Yetkinliklere Göre Eğitim Planı Hazır
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            “Eğitim Önerileri Oluştur” düğmesine basarak mülakat veya profilinizde öne çıkan açıkları
            kapatacak somut kaynak türlerini ve gerekçelerini görüntüleyin.
          </p>
        </section>
      )}

      {loading && (
        <div aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="bg-white border border-slate-200 rounded-xl p-6 h-52" />
          ))}
        </div>
      )}

      {courses.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, idx) => (
            <article
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-blue-700">{course.competencyTarget}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.formatType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.estimatedLevel}</span>
                </div>

                <h2 className="font-display text-lg font-semibold text-slate-900">
                  {course.title}
                </h2>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-slate-700">
                    Neden Bu Kaynak Seçildi? (Hangi Açığı Kapatır)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {course.rationale}
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Platform / Alan Mantığı: </span>
                  {course.platformLogic}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 min-w-0 truncate">
                  <span className="font-semibold text-slate-800">Arama: </span>
                  <span className="font-mono">{course.searchKeywords}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyKeyword(course.searchKeywords, idx)}
                  aria-label={`${course.title} için arama terimini kopyala`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md whitespace-nowrap shrink-0"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {courses.length > 0 && !loading && (
        <GroundedSourcesList
          sources={courseSources}
          subtitle="Kurs ve platform önerileri güncel Google Arama sonuçları üzerinden doğrulanmıştır."
        />
      )}
    </div>
  );
}
