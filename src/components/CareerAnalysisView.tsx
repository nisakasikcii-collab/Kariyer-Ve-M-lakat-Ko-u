import { AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { CareerAnalysisResult, UserProfile } from '../types/career';
import { getExperienceLevelLabel } from '../utils/validation';
import { GroundedSourcesList } from './GroundedSourcesList';

interface CareerAnalysisViewProps {
  profile: UserProfile;
  profileReady: boolean;
  weakCompetencies: string[];
  analysis: CareerAnalysisResult | null;
  loading: boolean;
  errorMessage: string;
  onGenerateAnalysis: () => void;
  onGoToProfile: () => void;
}

export function CareerAnalysisView({
  profile,
  profileReady,
  weakCompetencies,
  analysis,
  loading,
  errorMessage,
  onGenerateAnalysis,
  onGoToProfile,
}: CareerAnalysisViewProps) {
  if (!profileReady) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Analiz İçin Profil Bilgilerinizi Girin
        </h2>
        <p className="text-sm text-slate-600">
          CV iyileştirme, yetkinlik boşluğu analizi ve portfolyo proje önerileri hedef rolünüze göre
          oluşturulur.
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
      {/* Header Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>{profile.targetRole}</span>
            <span aria-hidden="true">·</span>
            <span>{getExperienceLevelLabel(profile.experienceLevel)}</span>
            {weakCompetencies.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>Mülakat bulguları dahil edildi ({weakCompetencies.length})</span>
              </>
            )}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            CV Geliştirme, Yetkinlik Boşluğu ve Portfolyo Önerileri
          </h1>
        </div>

        <button
          type="button"
          onClick={onGenerateAnalysis}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analiz Hazırlanıyor...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{analysis ? 'Analizi Yenile' : 'Analizi Oluştur'}</span>
            </>
          )}
        </button>
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

      {!analysis && !loading && !errorMessage && (
        <section className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Henüz CV ve Yetkinlik Analizi Oluşturulmadı
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Yukarıdaki “Analizi Oluştur” düğmesine tıklayarak profiliniz, iş ilanınız ve varsa
            mülakat yanıtlarınız üzerinden CV düzeltmelerini, yetkinlik boşluğu tablosunu ve
            uygulanabilir portfolyo projelerini görebilirsiniz.
          </p>
        </section>
      )}

      {loading && (
        <section
          aria-busy="true"
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 animate-pulse"
        >
          <div className="h-5 w-1/3 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="h-28 bg-slate-100 rounded-lg" />
            <div className="h-28 bg-slate-100 rounded-lg" />
          </div>
        </section>
      )}

      {analysis && !loading && (
        <div className="space-y-8">
          {/* Profile Summary */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Genel Rol Uyumu Özeti
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.profileSummary}</p>
          </section>

          {/* Skill Gaps Table */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Yetkinlik Boşluğu (Skill Gap) Analizi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Hedef rol beklentileri ile mevcut profiliniz arasındaki farklar ve kapatma adımları
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Yetkinlik</th>
                    <th className="py-3 px-4">Mevcut Durum</th>
                    <th className="py-3 px-4">Hedef Beklenti</th>
                    <th className="py-3 px-4">Öncelik</th>
                    <th className="py-3 px-4">Kapatma Adımı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {analysis.skillGaps.map((gap, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{gap.skill}</td>
                      <td className="py-3.5 px-4 text-slate-600">{gap.currentLevel}</td>
                      <td className="py-3.5 px-4 text-slate-700">{gap.targetExpectation}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium text-xs ${
                            gap.priority === 'Yüksek'
                              ? 'text-red-700'
                              : gap.priority === 'Orta'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }`}
                        >
                          {gap.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed">
                        {gap.closingAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CV Improvements */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                CV ve Profil Geliştirme Önerileri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Somut etki, ölçülebilir çıktı ve anahtar kelime uyumu için iyileştirme adımları
              </p>
            </div>
            <div className="divide-y divide-slate-200">
              {analysis.cvImprovements.map((item, idx) => (
                <div key={idx} className="py-5 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="text-sm font-semibold text-slate-900">{item.section}</div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Tespit: </span>
                    {item.currentObservation}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Öneri: </span>
                    {item.actionableSuggestion}
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-800">
                    <span className="font-semibold text-slate-900">Örnek CV Maddesi: </span>
                    “{item.exampleBullet}”
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Projects */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Portfolyo ve Proje Önerileri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Yetkinlik boşluklarını doğrudan kanıtla kapatacak uygulanabilir proje fikirleri
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysis.portfolioProjects.map((project, idx) => (
                <article
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500">
                      Kapattığı Açık: {project.targetGapClosed}
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {project.problemStatement}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="font-medium text-slate-800">Kapsam: </span>
                      {project.scopeSummary}
                    </p>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">Araçlar / Yığın: </span>
                      {project.toolsAndStack.join(' · ')}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">CV’de Sunum: </span>
                    {project.cvPresentationTip}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <GroundedSourcesList
            sources={analysis.sources}
            subtitle="Rol beklentileri ve yetkinlik analizi güncel Google Arama sonuçları ile desteklenmiştir."
          />
        </div>
      )}
    </div>
  );
}
