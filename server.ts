import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AnswerEvaluation,
  CareerAnalysisResult,
  CommunityRecommendationsResult,
  CourseRecommendation,
  GroundingSource,
  InterviewQuestion,
  InterviewSessionPlan,
  InterviewTurn,
  UserProfile,
} from './src/types/career.ts';
import { extractGroundingSources } from './src/utils/grounding.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'Sunucu ortamında GEMINI_API_KEY tanımlı değil. Lütfen Settings > Secrets üzerinden API anahtarınızı yapılandırın.'
    ) as Error & { statusCode?: number };
    err.statusCode = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateJsonWithRetry<T>(
  prompt: string,
  systemInstruction: string,
  responseSchema: Record<string, unknown>
): Promise<T> {
  const ai = getAiClient();
  let lastError: unknown;
  const attempts: Array<{ model: string; thinkingLevel?: ThinkingLevel; delayMs: number }> = [
    { model: PRIMARY_MODEL, thinkingLevel: ThinkingLevel.LOW, delayMs: 500 },
    { model: FALLBACK_MODEL, delayMs: 900 },
    { model: PRIMARY_MODEL, thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const { model, thinkingLevel, delayMs } = attempts[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        },
      });

      const raw = response.text?.trim();
      if (!raw) {
        throw new Error('Model boş bir yanıt döndürdü.');
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[Gemini attempt ${i + 1} (${model}) failed]:`, msg);
      const isRetryable =
        msg.includes('429') ||
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('JSON') ||
        msg.includes('400');

      if (i < attempts.length - 1 && isRetryable) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

async function generateGroundedWebContext(
  researchPrompt: string,
  systemInstruction: string
): Promise<{ summaryText: string; sources: GroundingSource[] }> {
  const ai = getAiClient();
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: researchPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const summaryText = response.text?.trim() || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = extractGroundingSources(chunks, 8);
      return { summaryText, sources };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRetryable = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE');
      if (attempt === 0 && isRetryable) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      console.warn('[Google Search Grounding skipped due to upstream error]:', msg);
      return { summaryText: '', sources: [] };
    }
  }
  return { summaryText: '', sources: [] };
}

function formatExperienceLabel(level: string): string {
  const map: Record<string, string> = {
    stajyer: 'Stajyer',
    yeni_mezun: 'Yeni Mezun',
    junior: 'Junior (1-2 yıl)',
    mid: 'Mid-Level (2-5 yıl)',
    senior: 'Senior (5+ yıl)',
    kariyer_degisimi: 'Kariyer Değişimi',
  };
  return map[level] || level;
}

function formatEventFormatLabel(format: string): string {
  const map: Record<string, string> = {
    belirtilmedi: 'Belirtilmedi',
    cevrimici: 'Çevrimiçi',
    yuz_yuze: 'Yüz Yüze',
    hibrit: 'Hibrit',
  };
  return map[format] || format;
}

function buildProfileContextBlock(profile: UserProfile): string {
  return [
    `Hedef Rol: ${(profile.targetRole ?? '').trim()}`,
    `Deneyim Seviyesi: ${formatExperienceLabel(profile.experienceLevel ?? '')}`,
    profile.jobPosting?.trim()
      ? `İş İlanı Özeti:\n${profile.jobPosting.trim()}`
      : 'İş İlanı: Sağlanmadı (genel sektör beklentilerine göre değerlendir).',
    profile.resumeText?.trim()
      ? `Aday Özgeçmiş / Profil Özeti:\n${profile.resumeText.trim()}`
      : 'Özgeçmiş: Sağlanmadı (deneyim seviyesine uygun temel senaryolar kurgula).',
    profile.hobbies?.trim() ? `İlgi Alanları ve Hobiler: ${profile.hobbies.trim()}` : '',
    profile.city?.trim() ? `Şehir: ${profile.city.trim()}` : '',
    profile.eventFormat ? `Etkinlik Format Tercihi: ${formatEventFormatLabel(profile.eventFormat)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function formatFriendlyErrorMessage(rawMessage: string, fallbackMessage: string): {
  statusCode: number;
  message: string;
} {
  if (rawMessage.includes('503') || rawMessage.includes('UNAVAILABLE')) {
    return {
      statusCode: 503,
      message:
        'Yapay zekâ servisi şu anda geçici yoğunluk yaşıyor. Lütfen birkaç saniye sonra tekrar deneyin.',
    };
  }
  if (rawMessage.includes('429') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      statusCode: 429,
      message:
        'İstek kotası geçici olarak aşıldı. Kısa bir süre bekleyip tekrar deneyin.',
    };
  }
  if (rawMessage.includes('403') || rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('API_KEY_INVALID')) {
    return {
      statusCode: 403,
      message:
        'API anahtarı doğrulanamadı. Lütfen Settings > Secrets panelinden geçerli bir GEMINI_API_KEY tanımlandığından emin olun.',
    };
  }
  return {
    statusCode: 500,
    message: rawMessage.startsWith('{') ? fallbackMessage : rawMessage || fallbackMessage,
  };
}

function sendErrorResponse(res: Response, error: unknown, fallbackMessage: string) {
  const explicitStatus = (error as { statusCode?: number })?.statusCode;
  const rawMessage = error instanceof Error ? error.message : fallbackMessage;
  const formatted = formatFriendlyErrorMessage(rawMessage, fallbackMessage);
  const statusCode = typeof explicitStatus === 'number' ? explicitStatus : formatted.statusCode;
  console.error('[API Error]', rawMessage);
  res.status(statusCode).json({
    error: typeof explicitStatus === 'number' ? rawMessage : formatted.message,
  });
}

const COACH_SYSTEM_INSTRUCTION = `Sen deneyimli, empatik ama standartları yüksek bir Türk kariyer ve mülakat koçusun.
Tüm yanıtların doğal, akıcı, profesyonel Türkçe olmalıdır.
Asla tarih, kontenjan, fiyat veya sahte doğrudan web bağlantısı (URL) uydurma.
Her zaman adayın hedef rolüne ve deneyim seviyesine uygun, somut ve uygulanabilir geri bildirimler ver.`;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const key = process.env.GEMINI_API_KEY?.trim();
    res.json({
      ok: true,
      hasApiKey: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
    });
  });

  app.post('/api/interview/start', async (req: Request, res: Response) => {
    try {
      const profile = req.body?.profile as UserProfile | undefined;
      if (!profile || !profile.targetRole?.trim() || !profile.experienceLevel) {
        res.status(400).json({
          error: 'Mülakatı başlatmak için hedef rol ve deneyim seviyesi zorunludur.',
        });
        return;
      }

      const prompt = `Aşağıdaki aday profili için 4 ana soruluk aşamalı bir mülakat planı oluştur ve SADECE İLK SORUYU (Soru 1) üret.
Soruları tek seferde listeleme; aday her soruyu tek tek cevaplayacak. İlk soru adayın seviyesine uygun, açılış için net ve bağlamlı olmalı.

${buildProfileContextBlock(profile)}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          sessionPlan: {
            type: Type.OBJECT,
            properties: {
              focusAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 ana mülakat odak alanı (ör. Teknik Temel, Davranışsal STAR, Problem Çözme, Rol Uyumu)',
              },
              totalPrimaryQuestions: { type: Type.INTEGER },
              coachingStrategy: {
                type: Type.STRING,
                description: 'Bu aday için 1-2 cümlelik mülakat koçluk yaklaşımı',
              },
            },
            required: ['focusAreas', 'totalPrimaryQuestions', 'coachingStrategy'],
          },
          firstQuestion: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: 'Soru kategorisi (ör. Davranışsal, Teknik Temel, Vaka)' },
              competency: { type: Type.STRING, description: 'Ölçülen temel yetkinlik' },
              question: { type: Type.STRING, description: 'Adaya yöneltilecek tek ve net mülakat sorusu' },
              contextNote: {
                type: Type.STRING,
                description: 'Koçun bu soruyu neden sorduğuna ve cevaplarken neye dikkat edileceğine dair 1 cümlelik ipucu',
              },
            },
            required: ['category', 'competency', 'question', 'contextNote'],
          },
        },
        required: ['sessionPlan', 'firstQuestion'],
      };

      const data = await generateJsonWithRetry<{
        sessionPlan: InterviewSessionPlan;
        firstQuestion: {
          category: string;
          competency: string;
          question: string;
          contextNote: string;
        };
      }>(prompt, COACH_SYSTEM_INSTRUCTION, schema);

      const totalPlanned = Math.min(5, Math.max(3, data.sessionPlan.totalPrimaryQuestions || 4));
      const currentQuestion: InterviewQuestion = {
        id: `q-1-${Date.now()}`,
        index: 1,
        totalPlanned,
        category: data.firstQuestion.category,
        competency: data.firstQuestion.competency,
        question: data.firstQuestion.question,
        contextNote: data.firstQuestion.contextNote,
        isFollowUp: false,
      };

      res.json({
        sessionPlan: {
          ...data.sessionPlan,
          totalPrimaryQuestions: totalPlanned,
          focusAreas: data.sessionPlan.focusAreas.slice(0, totalPlanned),
        },
        currentQuestion,
      });
    } catch (error) {
      sendErrorResponse(res, error, 'Mülakat sorusu oluşturulurken bir sorun oluştu.');
    }
  });

  app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
    try {
      const { profile, question, answer, history } = req.body as {
        profile?: UserProfile;
        question?: InterviewQuestion;
        answer?: string;
        history?: InterviewTurn[];
      };

      if (!profile || !question || !answer?.trim() || answer.trim().length < 20) {
        res.status(400).json({
          error: 'Değerlendirme için geçerli bir profil, soru ve en az 20 karakterlik yanıt gereklidir.',
        });
        return;
      }

      const historySummary = (history ?? [])
        .slice(-3)
        .map(
          (turn, idx) =>
            `${idx + 1}. Soru (${turn.question.competency}): ${turn.question.question}\nAday Cevabı: ${turn.answer}`
        )
        .join('\n\n');

      const followUpRule = question.isFollowUp
        ? 'NOT: Bu soru zaten bir takip sorusuydu. Aynı ana soru için tekrar sonsuz takip döngüsüne girmemek için shouldFollowUp değerini false yap.'
        : 'Eğer adayın cevabı yüzeysel kaldıysa, somut sonuç/metrik eksikse veya teknik/karar gerekçesi net değilse shouldFollowUp: true döndür ve derinleştirici tek bir takip sorusu (followUpQuestion) yaz. Cevap yeterince net ve somutsa shouldFollowUp: false döndür.';

      const prompt = `Aşağıdaki adayın mülakat cevabını değerlendir.

${buildProfileContextBlock(profile)}

${historySummary ? `Önceki Turlar:\n${historySummary}\n\n` : ''}Aktif Soru (${question.category} · ${question.competency}):
"${question.question}"

Adayın Cevabı:
"${answer.trim()}"

Değerlendirme Kuralları:
1. "strengths": Cevaptaki 2-3 güçlü yönü somut olarak listele.
2. "gaps": Eksik kalan noktaları (ör. belirsiz aksiyon, ölçülebilir sonuç eksikliği, teknik derinlik veya iş etkisi) net listele.
3. "starRewrite": Adayın anlattığı senaryoyu (veya gerçekçi bir genişletmesini) STAR metoduna göre Durum (situation), Görev (task), Eylem (action) ve Sonuç (result) başlıklarıyla yeniden yapılandır.
4. "betterExample": "Daha güçlü nasıl söylenebilirdi?" başlığı altında, adayın mülakatta doğrudan kullanabileceği 3-5 cümlelik akıcı ve güçlü örnek yanıt yaz.
5. "detectedWeaknesses": Bu cevapta zayıf kalan veya geliştirilmesi gereken 1-3 net yetkinlik etiketi çıkar (ör. "Ölçülebilir Sonuç İfadesi", "İletişim Netliği", "Veri Odaklı Gerekçelendirme", "Araç/Teknoloji Derinliği").
6. ${followUpRule}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          starRewrite: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.STRING },
              task: { type: Type.STRING },
              action: { type: Type.STRING },
              result: { type: Type.STRING },
            },
            required: ['situation', 'task', 'action', 'result'],
          },
          betterExample: { type: Type.STRING },
          detectedWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          shouldFollowUp: { type: Type.BOOLEAN },
          followUpQuestion: { type: Type.STRING },
          followUpReason: { type: Type.STRING },
          readinessNote: { type: Type.STRING },
        },
        required: [
          'strengths',
          'gaps',
          'starRewrite',
          'betterExample',
          'detectedWeaknesses',
          'shouldFollowUp',
          'readinessNote',
        ],
      };

      const evaluationData = await generateJsonWithRetry<Omit<AnswerEvaluation, 'questionId'>>(
        prompt,
        COACH_SYSTEM_INSTRUCTION,
        schema
      );

      const evaluation: AnswerEvaluation = {
        questionId: question.id,
        ...evaluationData,
        shouldFollowUp: question.isFollowUp ? false : Boolean(evaluationData.shouldFollowUp),
      };

      res.json({ evaluation });
    } catch (error) {
      sendErrorResponse(res, error, 'Cevap değerlendirilirken bir hata oluştu.');
    }
  });

  app.post('/api/interview/next', async (req: Request, res: Response) => {
    try {
      const { profile, history, sessionPlan } = req.body as {
        profile?: UserProfile;
        history?: InterviewTurn[];
        sessionPlan?: InterviewSessionPlan;
      };

      if (!profile || !sessionPlan) {
        res.status(400).json({ error: 'Sonraki soru için profil ve oturum planı gereklidir.' });
        return;
      }

      const primaryAnsweredCount = (history ?? []).filter((t) => !t.question.isFollowUp).length;
      const nextIndex = primaryAnsweredCount + 1;
      const totalPlanned = sessionPlan.totalPrimaryQuestions || 4;

      if (nextIndex > totalPlanned) {
        res.json({ completed: true, nextQuestion: null });
        return;
      }

      const targetFocus =
        sessionPlan.focusAreas[nextIndex - 1] || 'Rol Uyumu ve Gerçek Senaryo';
      const priorSummary = (history ?? [])
        .map(
          (t) =>
            `- Soru (${t.question.competency}): ${t.question.question}\n  Tespit Edilen Eksikler: ${t.evaluation.detectedWeaknesses.join(', ') || 'Yok'}`
        )
        .join('\n');

      const prompt = `Sıralı mülakatın ${nextIndex}/${totalPlanned}. ana sorusunu üret.
Önceki soruları tekrar etme. Önceki cevaplarda görülen zayıf yönleri de göz önünde bulundurarak bu aşamanın odak alanına (${targetFocus}) uygun, tek ve net bir soru hazırla.

${buildProfileContextBlock(profile)}

Önceki Mülakat Geçmişi:
${priorSummary || 'Henüz geçmiş yok.'}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          competency: { type: Type.STRING },
          question: { type: Type.STRING },
          contextNote: { type: Type.STRING },
        },
        required: ['category', 'competency', 'question', 'contextNote'],
      };

      const generated = await generateJsonWithRetry<{
        category: string;
        competency: string;
        question: string;
        contextNote: string;
      }>(prompt, COACH_SYSTEM_INSTRUCTION, schema);

      const nextQuestion: InterviewQuestion = {
        id: `q-${nextIndex}-${Date.now()}`,
        index: nextIndex,
        totalPlanned,
        category: generated.category,
        competency: generated.competency,
        question: generated.question,
        contextNote: generated.contextNote,
        isFollowUp: false,
      };

      res.json({ completed: false, nextQuestion });
    } catch (error) {
      sendErrorResponse(res, error, 'Sonraki mülakat sorusu üretilemedi.');
    }
  });

  app.post('/api/career/analyze', async (req: Request, res: Response) => {
    try {
      const { profile, weakCompetencies } = req.body as {
        profile?: UserProfile;
        weakCompetencies?: string[];
      };

      if (!profile || !profile.targetRole?.trim() || !profile.experienceLevel) {
        res.status(400).json({
          error: 'CV, yetkinlik boşluğu ve portfolyo analizi için hedef rol ve deneyim seviyesi gereklidir.',
        });
        return;
      }

      const weaknessNote =
        weakCompetencies && weakCompetencies.length > 0
          ? `Mülakat sırasında gözlemlenen zayıf yetkinlikler: ${weakCompetencies.join(', ')}`
          : 'Mülakat henüz tamamlanmadı; doğrudan rol, iş ilanı ve özgeçmiş verisine odaklan.';

      const groundingQuery = `Güncel iş piyasası ve işe alım beklentileri için Google Araması ile doğrulanmış bilgi topla:
Hedef Rol: ${profile.targetRole.trim()}
Deneyim Seviyesi: ${formatExperienceLabel(profile.experienceLevel)}
${weakCompetencies?.length ? `Odaklanılacak eksikler: ${weakCompetencies.join(', ')}` : ''}
Bu rol için güncel olarak en çok aranan teknik araçlar, yetkinlik standartları ve öne çıkan portfolyo beklentileri nelerdir? Kısa ve somut özetle.`;

      const grounded = await generateGroundedWebContext(
        groundingQuery,
        COACH_SYSTEM_INSTRUCTION
      );

      const prompt = `Aday için kapsamlı CV/Profil Geliştirme, Yetkinlik Boşluğu (Skill Gap) Analizi ve Somut Portfolyo/Proje Önerisi hazırla.

${buildProfileContextBlock(profile)}

${weaknessNote}

${
  grounded.summaryText
    ? `Google Arama ile Doğrulanmış Güncel Piyasa Bağlamı:\n${grounded.summaryText}\n`
    : ''
}Kurallar:
- "profileSummary": Adayın hedef role uygunluğunu 2-3 cümlede gerçekçi değerlendir.
- "cvImprovements": 3 veya 4 somut CV/profil iyileştirmesi öner. Eğer özgeçmiş girilmemişse, bu rol ve deneyim seviyesinde CV'de mutlaka bulunması gereken bölümler ve örnek madde cümlesi yaz.
- "skillGaps": 3-5 yetkinlik boşluğu belirle; mevcut durum, hedef rol beklentisi, öncelik ('Yüksek', 'Orta' veya 'Destekleyici') ve somut kapatma adımı sun.
- "portfolioProjects": Yetkinlik boşluklarını kapatacak 2-3 gerçekçi, uygulanabilir portfolyo/proje önerisi sun; problem tanımı, kapsam, kullanılacak araç/teknolojiler, hangi açığı kapattığı ve CV'de nasıl tek cümleyle sunulacağını yaz.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          profileSummary: { type: Type.STRING },
          cvImprovements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                currentObservation: { type: Type.STRING },
                actionableSuggestion: { type: Type.STRING },
                exampleBullet: { type: Type.STRING },
              },
              required: ['section', 'currentObservation', 'actionableSuggestion', 'exampleBullet'],
            },
          },
          skillGaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                currentLevel: { type: Type.STRING },
                targetExpectation: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['Yüksek', 'Orta', 'Destekleyici'] },
                closingAction: { type: Type.STRING },
              },
              required: ['skill', 'currentLevel', 'targetExpectation', 'priority', 'closingAction'],
            },
          },
          portfolioProjects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                problemStatement: { type: Type.STRING },
                scopeSummary: { type: Type.STRING },
                toolsAndStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                targetGapClosed: { type: Type.STRING },
                cvPresentationTip: { type: Type.STRING },
              },
              required: [
                'title',
                'problemStatement',
                'scopeSummary',
                'toolsAndStack',
                'targetGapClosed',
                'cvPresentationTip',
              ],
            },
          },
        },
        required: ['profileSummary', 'cvImprovements', 'skillGaps', 'portfolioProjects'],
      };

      const analysis = await generateJsonWithRetry<CareerAnalysisResult>(
        prompt,
        COACH_SYSTEM_INSTRUCTION,
        schema
      );

      res.json({
        analysis: {
          ...analysis,
          sources: grounded.sources,
        },
      });
    } catch (error) {
      sendErrorResponse(res, error, 'Kariyer ve yetkinlik analizi oluşturulamadı.');
    }
  });

  app.post('/api/career/courses', async (req: Request, res: Response) => {
    try {
      const { profile, weakCompetencies } = req.body as {
        profile?: UserProfile;
        weakCompetencies?: string[];
      };

      if (!profile || !profile.targetRole?.trim() || !profile.experienceLevel) {
        res.status(400).json({
          error: 'Kurs önerileri için hedef rol ve deneyim seviyesi gereklidir.',
        });
        return;
      }

      const focusWeaknesses =
        weakCompetencies && weakCompetencies.length > 0
          ? weakCompetencies.join(', ')
          : 'Rol için kritik teknik araç kullanımı, sunum ve iletişim netliği, yapılandırılmış problem çözme';

      const groundingQuery = `Google Araması kullanarak aşağıdaki rol ve yetkinlik açıkları için güncel ve güvenilir eğitim platformlarını, ücretsiz/açık kursları ve resmi dokümantasyon yollarını araştır:
Hedef Rol: ${profile.targetRole.trim()}
Seviye: ${formatExperienceLabel(profile.experienceLevel)}
Zayıf Yetkinlikler: ${focusWeaknesses}
Türkiye'de ve globalde erişilebilir güncel eğitim/kurs programlarını (ör. BTK Akademi, Patika.dev, Coursera, edX, freeCodeCamp, resmi dokümantasyonlar) ve neden uygun olduklarını özetle.`;

      const grounded = await generateGroundedWebContext(
        groundingQuery,
        COACH_SYSTEM_INSTRUCTION
      );

      const prompt = `Adayın hedef rolüne, deneyim seviyesine ve özellikle mülakatta/analizde zayıf kalan yetkinliklerine göre 4 somut kurs veya eğitim yaklaşımı öner.

${buildProfileContextBlock(profile)}

Odaklanılacak Zayıf Yetkinlikler / Açıklar: ${focusWeaknesses}

${
  grounded.summaryText
    ? `Google Arama ile Doğrulanmış Güncel Eğitim Bulguları:\n${grounded.summaryText}\n`
    : ''
}KRİTİK KURALLAR:
- ASLA güncel tarih, başlangıç günü, kontenjan, ücret veya uydurma doğrudan web bağlantısı (URL) YAZMA.
- Bunun yerine önerilen kurs/eğitim türünü ("formatType": ör. "Uygulamalı Video & Proje Patikası", "İletişim & Sunum Atölyesi", "Resmi Dokümantasyon + Laboratuvar") ve platform/alan mantığını ("platformLogic": ör. "BTK Akademi veya Patika.dev Türkçe başlangıç patikaları", "Coursera / edX üniversite tabanlı sertifika programları") açıkça belirt.
- "searchKeywords": Adayın bu platformlarda güvenle aratabileceği net anahtar kelimeler ver.
- "rationale": Bu kaynağın NEDEN seçildiğini ve adayın hangi somut açığını kapatacağını 1-2 net cümleyle açıkla.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          courses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                competencyTarget: { type: Type.STRING },
                rationale: { type: Type.STRING },
                formatType: { type: Type.STRING },
                platformLogic: { type: Type.STRING },
                searchKeywords: { type: Type.STRING },
                estimatedLevel: { type: Type.STRING },
              },
              required: [
                'title',
                'competencyTarget',
                'rationale',
                'formatType',
                'platformLogic',
                'searchKeywords',
                'estimatedLevel',
              ],
            },
          },
        },
        required: ['courses'],
      };

      const result = await generateJsonWithRetry<{ courses: CourseRecommendation[] }>(
        prompt,
        COACH_SYSTEM_INSTRUCTION,
        schema
      );

      res.json({ courses: result.courses, sources: grounded.sources });
    } catch (error) {
      sendErrorResponse(res, error, 'Eğitim ve kurs önerileri oluşturulamadı.');
    }
  });

  app.post('/api/career/events', async (req: Request, res: Response) => {
    try {
      const { profile } = req.body as { profile?: UserProfile };

      if (!profile || !profile.targetRole?.trim()) {
        res.status(400).json({
          error: 'Etkinlik önerileri için önce profilinizde hedef rolünüzü belirtin.',
        });
        return;
      }

      const hasHobbies = profile.hobbies?.trim().length >= 3;
      const format = profile.eventFormat || 'belirtilmedi';
      const hasCity = profile.city?.trim().length >= 2;

      if (!hasHobbies) {
        const missing: CommunityRecommendationsResult = {
          needsMoreDetails: true,
          missingDetailPrompt:
            'İlgi alanlarınız ve hobileriniz henüz girilmemiş. Hobilerinizi paylaşırsanız bunları ücretsiz atölye, seminer veya topluluk formatlarıyla eşleştirebilirim.',
          recommendations: [],
        };
        res.json({ result: missing });
        return;
      }

      if (format === 'belirtilmedi' || ((format === 'yuz_yuze' || format === 'hibrit') && !hasCity)) {
        const missing: CommunityRecommendationsResult = {
          needsMoreDetails: true,
          missingDetailPrompt:
            format === 'belirtilmedi'
              ? 'Katılım formatınızı (Çevrimiçi, Yüz Yüze veya Hibrit) ve yüz yüze istiyorsanız şehir bilginizi paylaşın ki gerçekçi topluluk ve etkinlik formatları önerebileyim.'
              : 'Yüz yüze veya hibrit format seçtiğiniz için şehir bilginizi de eklemeniz gerekiyor.',
          recommendations: [],
        };
        res.json({ result: missing });
        return;
      }

      const groundingQuery = `Google Araması kullanarak aşağıdaki ilgi alanları ve şehir/format bilgisine uygun aktif ve ücretsiz topluluk ekosistemlerini, açık atölye/seminer kanallarını veya kulüpleri araştır:
İlgi Alanları / Hobiler: ${profile.hobbies.trim()}
Format: ${formatEventFormatLabel(format)}
Şehir: ${profile.city?.trim() || 'Çevrimiçi / Konumdan Bağımsız'}
Tarih veya kontenjan uydurmadan, mevcut aktif topluluk türlerini, kültür merkezlerini veya buluşma platformlarını özetle.`;

      const grounded = await generateGroundedWebContext(
        groundingQuery,
        COACH_SYSTEM_INSTRUCTION
      );

      const prompt = `Adayın ilgi alanlarına ve hobilerine göre 4 adet ÜCRETSİZ atölye, seminer, kulüp/topluluk buluşması veya açık etkinlik formatı öner.

${buildProfileContextBlock(profile)}

${
  grounded.summaryText
    ? `Google Arama ile Doğrulanmış Topluluk ve Etkinlik Bağlamı:\n${grounded.summaryText}\n`
    : ''
}KRİTİK KURALLAR:
- ASLA emin olunmayan güncel tarih, saat, kontenjan veya sahte doğrudan URL UYDURMA.
- Önerilen etkinlik türünü ("eventType": ör. "Ücretsiz Açık Topluluk Buluşması", "Çevrimiçi Akran Geri Bildirim Atölyesi", "Belediye / Kültür Merkezi Açık Semineri") ve bu etkinliklerin hangi platform/topluluk mantığıyla bulunabileceğini ("platformOrVenueLogic": ör. "Meetup, Kommunity veya yerel üniversite kulüplerinin açık etkinlik takvimleri") net anlat.
- Her öneride "hobbyConnection" ile adayın hobisine nasıl bağlandığını, "benefitCategory" ('Sosyal Beceri', 'Üretkenlik' veya 'İş-Yaşam Dengesi') ve "careerBenefit" ile kariyerdeki sosyal beceri, üretkenlik veya iş-yaşam dengesine katkısını açıkça bağla.
- "format" alanı adayın tercihine uygun olarak 'Çevrimiçi', 'Yüz Yüze' veya 'Hibrit' olmalı; "cityContext" şehir/bölge veya "Konumdan Bağımsız (Çevrimiçi)" bilgisini yansıtmalı.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                hobbyConnection: { type: Type.STRING },
                careerBenefit: { type: Type.STRING },
                benefitCategory: {
                  type: Type.STRING,
                  enum: ['Sosyal Beceri', 'Üretkenlik', 'İş-Yaşam Dengesi'],
                },
                eventType: { type: Type.STRING },
                platformOrVenueLogic: { type: Type.STRING },
                format: { type: Type.STRING, enum: ['Çevrimiçi', 'Yüz Yüze', 'Hibrit'] },
                cityContext: { type: Type.STRING },
              },
              required: [
                'title',
                'hobbyConnection',
                'careerBenefit',
                'benefitCategory',
                'eventType',
                'platformOrVenueLogic',
                'format',
                'cityContext',
              ],
            },
          },
        },
        required: ['recommendations'],
      };

      const generated = await generateJsonWithRetry<{
        recommendations: CommunityRecommendationsResult['recommendations'];
      }>(prompt, COACH_SYSTEM_INSTRUCTION, schema);

      const result: CommunityRecommendationsResult = {
        needsMoreDetails: false,
        missingDetailPrompt: '',
        recommendations: generated.recommendations,
        sources: grounded.sources,
      };

      res.json({ result });
    } catch (error) {
      sendErrorResponse(res, error, 'Etkinlik ve topluluk önerileri oluşturulamadı.');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kariyer Pusulası sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor.`);
  });
}

createServer().catch((err) => {
  console.error('Sunucu başlatılamadı:', err);
  process.exit(1);
});
