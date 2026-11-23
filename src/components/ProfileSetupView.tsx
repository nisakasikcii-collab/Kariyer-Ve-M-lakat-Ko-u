import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Compass, RotateCcw } from 'lucide-react';
import { SAMPLE_PROFILE_PRESETS } from '../data/presets';
import type { EventFormat, ExperienceLevel, UserProfile } from '../types/career';
import {
  EVENT_FORMAT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  validateProfileInput,
  type ProfileValidationResult,
} from '../utils/validation';

interface ProfileSetupViewProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile, goToInterview: boolean) => void;
  onResetAll: () => void;
}

const COACH_PORTRAIT_URL = '/src/assets/images/coach_mentor_portrait_1795457903793.jpg';
const WORKSPACE_COVER_URL = '/src/assets/images/career_editorial_cover_1795457904060.jpg';

export function ProfileSetupView({
  profile,
  onSaveProfile,
  onResetAll,
}: ProfileSetupViewProps) {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [validation, setValidation] = useState<ProfileValidationResult | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string>('');
  const [portraitError, setPortraitError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const handleFieldChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (validation) {
      setValidation(null);
    }
    if (savedFeedback) {
      setSavedFeedback('');
    }
  };

  const applyPreset = (presetProfile: UserProfile) => {
    setDraft(presetProfile);
    setValidation(null);
    setSavedFeedback('Örnek profil forma yerleştirildi. Dilerseniz düzenleyip mülakatı başlatabilirsiniz.');
  };

  const handleSubmit = (e: React.FormEvent, goToInterview: boolean) => {
    e.preventDefault();
    const result = validateProfileInput(draft);
    if (!result.valid) {
      setValidation(result);
      return;
    }
    setValidation(result);
    setSavedFeedback(
      goToInterview
        ? 'Profil kaydedildi, mülakat oturumu hazırlanıyor.'
        : 'Profil bilgileriniz güncellendi.'
    );
    onSaveProfile(draft, goToInterview);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <span>Aşama 01</span>
              <span aria-hidden="true">·</span>
              <span>Hedef ve Bağlam Tanımlama</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Rolünüze özel sıralı mülakat simülasyonu ve kariyer koçluğu
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Hedeflediğiniz pozisyonu, deneyim seviyenizi ve varsa iş ilanı ya da özgeçmiş
              özetinizi paylaşın. Koçunuz soruları tek seferde yığmak yerine sırayla sorar, her
              cevabınızı STAR metoduyla analiz eder ve gelişim yolunuzu çıkarır.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-3">
              Hızlı başlangıç için hazır profillerden birini deneyin:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROFILE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.profile)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="relative h-44 sm:h-48 bg-slate-100 overflow-hidden">
            {!coverError ? (
              <img
                src={WORKSPACE_COVER_URL}
                alt="Çalışma masası ve kariyer planlama defteri"
                referrerPolicy="no-referrer"
                onError={() => setCoverError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Compass className="w-10 h-10 text-slate-400" />
              </div>
            )}
          </div>
          <div className="p-6 flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {!portraitError ? (
                <img
                  src={COACH_PORTRAIT_URL}
                  alt="Kariyer Koçu"
                  referrerPolicy="no-referrer"
                  onError={() => setPortraitError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600">
                  KP
                </div>
              )}
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Yapılandırılmış Koçluk Yaklaşımı
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Her yanıttan sonra güçlü yönler, eksik noktalar, STAR örneği ve gerekirse
                derinleştirici takip sorusu alırsınız. Zayıf kalan yetkinlikler otomatik olarak
                eğitim önerilerinize aktarılır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Form */}
      <form
        onSubmit={(e) => handleSubmit(e, true)}
        noValidate
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Aday Profili ve Mülakat Bağlamı
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Zorunlu alanlar hedef rol ve deneyim seviyesidir; iş ilanı ve özgeçmiş eklemek
              soruların isabetini artırır.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const empty: UserProfile = {
                targetRole: '',
                experienceLevel: '',
                jobPosting: '',
                resumeText: '',
                hobbies: '',
                city: '',
                eventFormat: 'belirtilmedi',
              };
              setDraft(empty);
              setValidation(null);
              setSavedFeedback('');
              onResetAll();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Formu Sıfırla</span>
          </button>
        </div>

        {validation && !validation.valid && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Eksik veya düzeltilmesi gereken alanlar var</div>
              <p className="text-xs sm:text-sm text-red-800 mt-1">
                Lütfen aşağıdaki işaretli alanları kontrol ederek tamamlayın.
              </p>
            </div>
          </div>
        )}

        {savedFeedback && (
          <div
            role="status"
            className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>{savedFeedback}</div>
          </div>
        )}

        {validation?.valid && validation.suggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
            {validation.suggestions[0]}
          </div>
        )}

        {/* Row 1: Target Role & Experience Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="target-role" className="block text-sm font-medium text-slate-800">
              Hedef Rol <span className="text-red-600">*</span>
            </label>
            <input
              id="target-role"
              name="targetRole"
              type="text"
              value={draft.targetRole}
              onChange={(e) => handleFieldChange('targetRole', e.target.value)}
              placeholder="Örn: Junior Frontend Developer, Veri Analisti, Ürün Yöneticisi"
              aria-invalid={Boolean(validation?.errors.targetRole)}
              aria-describedby={validation?.errors.targetRole ? 'target-role-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                validation?.errors.targetRole
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            />
            {validation?.errors.targetRole && (
              <p id="target-role-error" className="text-xs text-red-700">
                {validation.errors.targetRole}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="experience-level" className="block text-sm font-medium text-slate-800">
              Deneyim Seviyesi <span className="text-red-600">*</span>
            </label>
            <select
              id="experience-level"
              name="experienceLevel"
              value={draft.experienceLevel}
              onChange={(e) =>
                handleFieldChange('experienceLevel', e.target.value as ExperienceLevel | '')
              }
              aria-invalid={Boolean(validation?.errors.experienceLevel)}
              aria-describedby={
                validation?.errors.experienceLevel ? 'experience-level-error' : undefined
              }
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                validation?.errors.experienceLevel
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            >
              <option value="">Seviye seçiniz...</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            {validation?.errors.experienceLevel && (
              <p id="experience-level-error" className="text-xs text-red-700">
                {validation.errors.experienceLevel}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Job Posting & Resume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="job-posting" className="block text-sm font-medium text-slate-800">
              İş İlanı Metni <span className="text-slate-400 font-normal">(İsteğe bağlı)</span>
            </label>
            <textarea
              id="job-posting"
              name="jobPosting"
              rows={5}
              value={draft.jobPosting}
              onChange={(e) => handleFieldChange('jobPosting', e.target.value)}
              placeholder="Başvuracağınız ilanın sorumluluklar ve aranan nitelikler bölümünü buraya yapıştırabilirsiniz..."
              aria-invalid={Boolean(validation?.errors.jobPosting)}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                validation?.errors.jobPosting
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            />
            {validation?.errors.jobPosting && (
              <p className="text-xs text-red-700">{validation.errors.jobPosting}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="resume-text" className="block text-sm font-medium text-slate-800">
              Özgeçmiş / Profil Özeti{' '}
              <span className="text-slate-400 font-normal">(İsteğe bağlı)</span>
            </label>
            <textarea
              id="resume-text"
              name="resumeText"
              rows={5}
              value={draft.resumeText}
              onChange={(e) => handleFieldChange('resumeText', e.target.value)}
              placeholder="Eğitim, staj, proje deneyimleriniz ve kullandığınız temel araçları kısaca özetleyin..."
              aria-invalid={Boolean(validation?.errors.resumeText)}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                validation?.errors.resumeText
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            />
            {validation?.errors.resumeText && (
              <p className="text-xs text-red-700">{validation.errors.resumeText}</p>
            )}
          </div>
        </div>

        {/* Row 3: Hobbies, City, Event Format */}
        <div className="pt-6 border-t border-slate-100 space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              İlgi Alanları, Hobiler ve Etkinlik Tercihleri
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ücretsiz atölye, seminer ve topluluk buluşması önerilerinin kariyer dengenize göre
              kişiselleştirilmesi için kullanılır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-2">
              <label htmlFor="hobbies" className="block text-sm font-medium text-slate-800">
                İlgi Alanları ve Hobiler
              </label>
              <input
                id="hobbies"
                name="hobbies"
                type="text"
                value={draft.hobbies}
                onChange={(e) => handleFieldChange('hobbies', e.target.value)}
                placeholder="Örn: Fotoğrafçılık, satranç, doğa yürüyüşü, kitap kulübü"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label htmlFor="event-format" className="block text-sm font-medium text-slate-800">
                Etkinlik Formatı
              </label>
              <select
                id="event-format"
                name="eventFormat"
                value={draft.eventFormat}
                onChange={(e) => handleFieldChange('eventFormat', e.target.value as EventFormat)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              >
                {EVENT_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-slate-800">
                Şehir
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={draft.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="Örn: İstanbul, Ankara"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Profili Kaydet
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>Kaydet ve Mülakatı Başlat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
