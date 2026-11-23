import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquarePlus,
  RotateCcw,
} from 'lucide-react';
import type {
  AnswerEvaluation,
  InterviewQuestion,
  InterviewSessionPlan,
  InterviewTurn,
  UserProfile,
} from '../types/career';
import {
  aggregateWeakCompetencies,
  computeInterviewProgress,
  getExperienceLevelLabel,
  validateInterviewAnswer,
} from '../utils/validation';

interface InterviewCoachViewProps {
  profile: UserProfile;
  profileReady: boolean;
  sessionPlan: InterviewSessionPlan | null;
  currentQuestion: InterviewQuestion | null;
  pendingEvaluation: AnswerEvaluation | null;
  pendingAnswer: string;
  turns: InterviewTurn[];
  loadingState: 'idle' | 'starting' | 'evaluating' | 'next';
  errorMessage: string;
  onGoToProfile: () => void;
  onStartInterview: () => void;
  onSubmitAnswer: (answer: string) => void;
  onAcceptFollowUp: () => void;
  onAdvanceNextQuestion: () => void;
  onOpenCourses: () => void;
  onOpenAnalysis: () => void;
}

export function InterviewCoachView({
  profile,
  profileReady,
  sessionPlan,
  currentQuestion,
  pendingEvaluation,
  pendingAnswer,
  turns,
  loadingState,
  errorMessage,
  onGoToProfile,
  onStartInterview,
  onSubmitAnswer,
  onAcceptFollowUp,
  onAdvanceNextQuestion,
  onOpenCourses,
  onOpenAnalysis,
}: InterviewCoachViewProps) {
  const [answerDraft, setAnswerDraft] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const totalPlanned = sessionPlan?.totalPrimaryQuestions ?? 4;
  const progress = computeInterviewProgress(turns, currentQuestion, totalPlanned);
  const weakCompetencies = aggregateWeakCompetencies(turns);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateInterviewAnswer(answerDraft);
    if (!check.valid) {
      setValidationError(check.error || 'Lütfen daha detaylı bir yanıt yazın.');
      return;
    }
    setValidationError('');
    const submitted = answerDraft.trim();
    setAnswerDraft('');
    onSubmitAnswer(submitted);
  };

  if (!profileReady) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Önce Hedef Rol ve Deneyim Seviyenizi Belirleyin
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Mülakat sorularını rolünüze, seviyenize ve varsa iş ilanınıza göre dinamik üretebilmemiz
          için profil adımlarını tamamlamanız gerekiyor.
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

  // Session not started yet
  if (!sessionPlan && loadingState !== 'starting') {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-2">
            <span>{profile.targetRole}</span>
            <span aria-hidden="true">·</span>
            <span>{getExperienceLevelLabel(profile.experienceLevel)}</span>
            {profile.jobPosting.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <span>İş ilanı eklendi</span>
              </>
            )}
            {profile.resumeText.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <span>Özgeçmiş eklendi</span>
              </>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Sıralı Mülakat Simülasyonuna Hazırsınız
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Sorular tek seferde listelenmez; her aşamada tek bir soru yöneltilir. Cevabınızdan sonra
            güçlü yönleriniz, eksik kalan noktalar ve STAR metoduyla geliştirilmiş örnek yanıt
            sunulur; gerekirse derinleştirici takip sorusu gelir.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onStartInterview}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0"
          >
            <span>Mülakatı Başlat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onGoToProfile}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shrink-0"
          >
            Profili Düzenle
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress & Session Plan Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-700">{profile.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{getExperienceLevelLabel(profile.experienceLevel)}</span>
              {sessionPlan?.focusAreas.length ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Odak: {sessionPlan.focusAreas.join(' / ')}</span>
                </>
              ) : null}
            </div>
            {sessionPlan?.coachingStrategy && (
              <p className="text-xs sm:text-sm text-slate-600">{sessionPlan.coachingStrategy}</p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="font-mono tabular-nums text-sm font-semibold text-slate-900">
                {progress.primaryAnswered} / {progress.totalPlanned} Ana Soru
              </div>
              <div className="font-mono tabular-nums text-xs text-slate-500">
                {progress.followUpsAnswered} Takip Sorusu
              </div>
            </div>
            <button
              type="button"
              onClick={onStartInterview}
              disabled={loadingState !== 'idle'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yeni Oturum</span>
            </button>
          </div>
        </div>

        {/* Minimal flat progress bar */}
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-700 transition-transform duration-300 origin-left"
            style={{ width: `${progress.completionPercent}%` }}
          />
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">İşlem tamamlanamadı</div>
            <p className="text-xs sm:text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton when starting or advancing */}
      {(loadingState === 'starting' || loadingState === 'next') && (
        <section
          aria-busy="true"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
            <span>
              {loadingState === 'starting'
                ? 'Profilinize göre ilk mülakat sorusu hazırlanıyor...'
                : 'Önceki yanıtınıza göre sıradaki soru oluşturuluyor...'}
            </span>
          </div>
          <div className="space-y-2.5 animate-pulse">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>
        </section>
      )}

      {/* Active Question & Evaluation Stage */}
      {loadingState !== 'starting' && loadingState !== 'next' && currentQuestion && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-mono tabular-nums text-blue-700 font-semibold">
                {currentQuestion.isFollowUp
                  ? `Soru ${currentQuestion.index} · Takip`
                  : `Soru ${currentQuestion.index} / ${currentQuestion.totalPlanned}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQuestion.category}</span>
              <span aria-hidden="true">·</span>
              <span>Yetkinlik: {currentQuestion.competency}</span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              Koç Notu: {currentQuestion.contextNote}
            </p>
          </div>

          {/* Either Answer Form OR Evaluation Feedback */}
          {!pendingEvaluation ? (
            <form onSubmit={handleAnswerSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="interview-answer" className="block text-sm font-medium text-slate-800">
                  Cevabınız
                </label>
                <textarea
                  id="interview-answer"
                  rows={6}
                  value={answerDraft}
                  onChange={(e) => {
                    setAnswerDraft(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  disabled={loadingState === 'evaluating'}
                  placeholder="Durumu, görevinizi, aldığınız somut aksiyonları ve sonucu paylaşın..."
                  aria-invalid={Boolean(validationError)}
                  className={`w-full px-4 py-3 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    validationError
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                />
                {validationError && (
                  <p role="alert" className="text-xs text-red-700">
                    {validationError}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono tabular-nums text-xs text-slate-500">
                  {answerDraft.trim().length} karakter · En az birkaç cümlelik somut örnek önerilir
                </span>
                <button
                  type="submit"
                  disabled={loadingState === 'evaluating'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0"
                >
                  {loadingState === 'evaluating' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cevap Değerlendiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Cevabı Değerlendir</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              {/* Candidate submitted answer */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                <div className="text-xs font-semibold text-slate-500">Verdiğiniz Cevap</div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {pendingAnswer}
                </p>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-5 space-y-3 bg-white">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Güçlü Yönler</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {pendingEvaluation.strengths.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-5 space-y-3 bg-white">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Eksik Kalan Noktalar</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {pendingEvaluation.gaps.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* STAR Method Breakdown */}
              <div className="border border-slate-200 rounded-lg p-5 space-y-4 bg-slate-50/60">
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    STAR Metodu ile Yapılandırılmış Çerçeve
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cevabınızın mülakat kuruluna en net etkiyi bırakacak dört aşamalı kurgusu
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-slate-700">Durum (Situation)</div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pendingEvaluation.starRewrite.situation}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-slate-700">Görev (Task)</div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pendingEvaluation.starRewrite.task}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-slate-700">Eylem (Action)</div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pendingEvaluation.starRewrite.action}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-slate-700">Sonuç (Result)</div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pendingEvaluation.starRewrite.result}
                    </p>
                  </div>
                </div>
              </div>

              {/* Better Example */}
              <div className="border border-slate-200 rounded-lg p-5 space-y-2 bg-white">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Daha Güçlü Nasıl Söylenebilirdi?
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  “{pendingEvaluation.betterExample}”
                </p>
                {pendingEvaluation.detectedWeaknesses.length > 0 && (
                  <div className="pt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Odak Gelişim Alanları: </span>
                    {pendingEvaluation.detectedWeaknesses.join(' · ')}
                  </div>
                )}
              </div>

              {/* Follow-up or Next Question CTA */}
              {pendingEvaluation.shouldFollowUp && pendingEvaluation.followUpQuestion ? (
                <div className="border border-blue-200 bg-blue-50/60 rounded-lg p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageSquarePlus className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        Koç Derinleştirici Takip Sorusu Öneriyor
                      </div>
                      {pendingEvaluation.followUpReason && (
                        <p className="text-xs sm:text-sm text-slate-600">
                          {pendingEvaluation.followUpReason}
                        </p>
                      )}
                      <p className="text-sm font-medium text-slate-900 pt-1">
                        “{pendingEvaluation.followUpQuestion}”
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onAcceptFollowUp}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0"
                    >
                      <span>Takip Sorusunu Yanıtla</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onAdvanceNextQuestion}
                      className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shrink-0"
                    >
                      {currentQuestion.index >= totalPlanned
                        ? 'Oturumu Tamamla'
                        : 'Sonraki Ana Soruya Geç'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs sm:text-sm text-slate-600">
                    {pendingEvaluation.readinessNote}
                  </p>
                  <button
                    type="button"
                    onClick={onAdvanceNextQuestion}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
                  >
                    <span>
                      {currentQuestion.index >= totalPlanned
                        ? 'Mülakatı Tamamla ve Özeti Gör'
                        : 'Sonraki Soruya Geç'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Session Completed Summary */}
      {progress.isComplete && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-700">Mülakat Simülasyonu Tamamlandı</div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Performans Özeti ve Sonraki Adımlar
            </h2>
            <p className="text-sm text-slate-600">
              Toplam <span className="font-mono tabular-nums font-semibold">{progress.primaryAnswered}</span>{' '}
              ana soru ve{' '}
              <span className="font-mono tabular-nums font-semibold">{progress.followUpsAnswered}</span>{' '}
              derinleştirici takip sorusu yanıtladınız.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Mülakat Boyunca Öne Çıkan Gelişim Alanları
            </h3>
            {weakCompetencies.length > 0 ? (
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {weakCompetencies.map((item) => (
                  <li
                    key={item.name}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-800 font-medium">{item.name}</span>
                    <span className="font-mono tabular-nums text-xs text-slate-500">
                      {item.count} turda tespit edildi
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                Cevaplarınız dengeli ve yapılandırılmış görünüyor. Bir sonraki adım olarak CV &
                portfolyo uyumluluğunuzu gözden geçirebilirsiniz.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenCourses}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0"
            >
              <span>Zayıf Yetkinliklere Göre Eğitim Önerilerini Gör</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenAnalysis}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shrink-0"
            >
              CV & Portfolyo Analizine Geç
            </button>
          </div>
        </section>
      )}

      {/* Completed Turns History Accordion */}
      {turns.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50"
          >
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Tamamlanan Soru ve Değerlendirme Geçmişi
              </span>
              <span className="ml-2 font-mono tabular-nums text-xs text-slate-500">
                ({turns.length} tur)
              </span>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showHistory && (
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              {turns.map((turn, idx) => (
                <div key={`${turn.question.id}-${idx}`} className="p-6 space-y-3">
                  <div className="text-xs text-slate-500">
                    Tur {idx + 1} · {turn.question.category} · {turn.question.competency}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {turn.question.question}
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    {turn.answer}
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold">Daha Güçlü Örnek: </span>
                    {turn.evaluation.betterExample}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
