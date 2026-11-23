import type {
  AnswerEvaluation,
  EventFormat,
  ExperienceLevel,
  InterviewQuestion,
  InterviewTurn,
  UserProfile,
} from '../types/career';

export const EXPERIENCE_LEVEL_OPTIONS: ReadonlyArray<{
  value: ExperienceLevel;
  label: string;
  description: string;
}> = [
  { value: 'stajyer', label: 'Stajyer', description: 'Öğrenci veya ilk sektör deneyimi arayışı' },
  { value: 'yeni_mezun', label: 'Yeni Mezun', description: '0–1 yıl deneyim, akademik ve proje odaklı' },
  { value: 'junior', label: 'Junior', description: '1–2 yıl profesyonel deneyim' },
  { value: 'mid', label: 'Mid-Level', description: '2–5 yıl bağımsız teslimat deneyimi' },
  { value: 'senior', label: 'Senior', description: '5+ yıl mimari, liderlik ve strateji' },
  {
    value: 'kariyer_degisimi',
    label: 'Kariyer Değişimi',
    description: 'Farklı alandan geçiş, aktarılabilir yetkinlikler',
  },
];

export const EVENT_FORMAT_OPTIONS: ReadonlyArray<{
  value: EventFormat;
  label: string;
}> = [
  { value: 'belirtilmedi', label: 'Henüz seçmedim' },
  { value: 'cevrimici', label: 'Çevrimiçi' },
  { value: 'yuz_yuze', label: 'Yüz Yüze' },
  { value: 'hibrit', label: 'Hibrit (İkisi de olur)' },
];

export interface ProfileValidationResult {
  valid: boolean;
  errors: Partial<Record<'targetRole' | 'experienceLevel' | 'jobPosting' | 'resumeText', string>>;
  suggestions: string[];
}

export function getExperienceLevelLabel(level: ExperienceLevel | ''): string {
  const found = EXPERIENCE_LEVEL_OPTIONS.find((item) => item.value === level);
  return found ? found.label : 'Belirtilmedi';
}

export function getEventFormatLabel(format: EventFormat): string {
  const found = EVENT_FORMAT_OPTIONS.find((item) => item.value === format);
  return found ? found.label : 'Belirtilmedi';
}

export function validateProfileInput(profile: UserProfile): ProfileValidationResult {
  const errors: ProfileValidationResult['errors'] = {};
  const suggestions: string[] = [];

  const role = profile.targetRole.trim();
  if (!role) {
    errors.targetRole =
      'Lütfen hedeflediğiniz rolü yazın (örneğin: "Junior Frontend Developer", "Veri Analisti" veya "Ürün Yöneticisi").';
  } else if (role.length < 3) {
    errors.targetRole =
      'Hedef rol çok kısa görünüyor. Koçun doğru soru üretebilmesi için rol adını biraz daha net yazın.';
  } else if (/^[^a-zA-ZçğıöşüÇĞİÖŞÜ]+$/.test(role)) {
    errors.targetRole =
      'Hedef rol yalnızca rakam veya sembol içeremez; lütfen gerçek bir pozisyon adı girin.';
  }

  const validLevels = new Set<string>(EXPERIENCE_LEVEL_OPTIONS.map((o) => o.value));
  if (!profile.experienceLevel || !validLevels.has(profile.experienceLevel)) {
    errors.experienceLevel =
      'Lütfen deneyim seviyenizi seçin (Stajyer, Yeni Mezun, Junior vb.); soruların zorluk derecesi buna göre ayarlanır.';
  }

  const jobPosting = profile.jobPosting.trim();
  if (jobPosting && jobPosting.length < 25) {
    errors.jobPosting =
      'İş ilanı metni çok kısa. İlandan en az birkaç sorumluluk veya aranan nitelik maddesi yapıştırın ya da boş bırakın.';
  }

  const resumeText = profile.resumeText.trim();
  if (resumeText && resumeText.length < 30) {
    errors.resumeText =
      'Özgeçmiş özeti analiz için çok kısa. Deneyim, eğitim veya projelerinizden birkaç cümle ekleyin ya da boş bırakın.';
  }

  if (!jobPosting && !resumeText) {
    suggestions.push(
      'Daha isabetli sorular ve CV iyileştirmeleri için iş ilanı veya özgeçmişinizden en az birini eklemeniz önerilir.'
    );
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    suggestions,
  };
}

export interface AnswerValidationResult {
  valid: boolean;
  error?: string;
}

export function validateInterviewAnswer(answer: string): AnswerValidationResult {
  const cleaned = answer.trim();
  if (!cleaned) {
    return {
      valid: false,
      error:
        'Lütfen cevabınızı yazın. Kısa bir deneme bile olsa düşüncenizi paylaşın ki koç geri bildirim verebilsin.',
    };
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (cleaned.length < 20 || words.length < 4) {
    return {
      valid: false,
      error:
        'Cevabınız STAR değerlendirmesi için çok kısa. Durumu, aldığınız aksiyonu ve sonucunu en az 1–2 tam cümleyle açabilir misiniz?',
    };
  }

  return { valid: true };
}

export interface CommunityContextCheck {
  ready: boolean;
  needsHobbies: boolean;
  needsCityOrFormat: boolean;
  promptMessage: string;
}

export function checkCommunityInputCompleteness(profile: UserProfile): CommunityContextCheck {
  const hasHobbies = profile.hobbies.trim().length >= 3;
  const hasCity = profile.city.trim().length >= 2;
  const format = profile.eventFormat;

  if (!hasHobbies) {
    return {
      ready: false,
      needsHobbies: true,
      needsCityOrFormat: format === 'belirtilmedi' || ((format === 'yuz_yuze' || format === 'hibrit') && !hasCity),
      promptMessage:
        'Size uygun ücretsiz atölye, seminer veya topluluk buluşmaları önerebilmem için lütfen ilgi alanlarınızı ve hobilerinizi yazın (ör. fotoğrafçılık, satranç, kitap kulübü, açık kaynak yazılım).',
    };
  }

  if (format === 'belirtilmedi') {
    return {
      ready: false,
      needsHobbies: false,
      needsCityOrFormat: true,
      promptMessage:
        'Etkinlik önerilerini gerçekçi biçimde uyarlayabilmem için katılım formatını seçin (Çevrimiçi, Yüz Yüze veya Hibrit). Yüz yüze veya hibrit tercih ediyorsanız şehir bilginizi de paylaşın.',
    };
  }

  if ((format === 'yuz_yuze' || format === 'hibrit') && !hasCity) {
    return {
      ready: false,
      needsHobbies: false,
      needsCityOrFormat: true,
      promptMessage:
        'Yüz yüze veya hibrit etkinlik formatı seçtiniz. Şehir bilginizi paylaşırsanız yerel topluluk ve açık etkinlik türlerini buna göre önerebilirim.',
    };
  }

  return {
    ready: true,
    needsHobbies: false,
    needsCityOrFormat: false,
    promptMessage: '',
  };
}

export interface WeakCompetencySummary {
  name: string;
  count: number;
}

export function aggregateWeakCompetencies(
  turns: ReadonlyArray<Pick<InterviewTurn, 'evaluation'>>
): WeakCompetencySummary[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const turn of turns) {
    for (const raw of turn.evaluation.detectedWeaknesses) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = trimmed.toLocaleLowerCase('tr-TR');
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: trimmed, count: 1 });
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'tr-TR'))
    .map((entry) => ({ name: entry.label, count: entry.count }));
}

export interface InterviewProgressSummary {
  primaryAnswered: number;
  followUpsAnswered: number;
  totalTurns: number;
  totalPlanned: number;
  completionPercent: number;
  isComplete: boolean;
}

export function computeInterviewProgress(
  turns: ReadonlyArray<InterviewTurn>,
  currentQuestion: InterviewQuestion | null,
  totalPlanned: number
): InterviewProgressSummary {
  const safePlanned = Math.max(1, totalPlanned);
  const primaryAnswered = turns.filter((t) => !t.question.isFollowUp).length;
  const followUpsAnswered = turns.filter((t) => t.question.isFollowUp).length;
  const totalTurns = turns.length;

  const isComplete = primaryAnswered >= safePlanned && currentQuestion === null;
  const completionPercent = Math.min(100, Math.round((primaryAnswered / safePlanned) * 100));

  return {
    primaryAnswered,
    followUpsAnswered,
    totalTurns,
    totalPlanned: safePlanned,
    completionPercent,
    isComplete,
  };
}

export function createFollowUpQuestionObject(
  parent: InterviewQuestion,
  evaluation: AnswerEvaluation
): InterviewQuestion {
  return {
    id: `${parent.id}-followup-${Date.now()}`,
    index: parent.index,
    totalPlanned: parent.totalPlanned,
    category: 'Derinleştirici Takip Sorusu',
    competency: parent.competency,
    question:
      evaluation.followUpQuestion?.trim() ||
      'Bu deneyimde kendi kararınızın sonucunu somut bir örnekle açabilir misiniz?',
    contextNote:
      evaluation.followUpReason?.trim() ||
      'Önceki cevabınızdaki kritik bir detayı netleştirmek için takip sorusu yöneltildi.',
    isFollowUp: true,
    parentQuestionId: parent.id,
  };
}
