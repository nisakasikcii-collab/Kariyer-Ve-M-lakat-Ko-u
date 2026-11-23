import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateWeakCompetencies,
  checkCommunityInputCompleteness,
  computeInterviewProgress,
  createFollowUpQuestionObject,
  validateInterviewAnswer,
  validateProfileInput,
} from './validation';
import type { InterviewQuestion, InterviewTurn, UserProfile } from '../types/career';

const baseProfile: UserProfile = {
  targetRole: 'Junior Frontend Developer',
  experienceLevel: 'yeni_mezun',
  jobPosting: 'React, TypeScript ve REST API deneyimi olan takım arkadaşı arıyoruz.',
  resumeText: 'Bilgisayar Mühendisliği mezunu, React ile 2 staj projesi geliştirdi.',
  hobbies: 'Fotoğrafçılık, satranç, açık kaynak projeler',
  city: 'İstanbul',
  eventFormat: 'hibrit',
};

test('validateProfileInput rejects empty targetRole and missing experienceLevel', () => {
  const result = validateProfileInput({
    ...baseProfile,
    targetRole: '   ',
    experienceLevel: '',
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.targetRole);
  assert.ok(result.errors.experienceLevel);
});

test('validateProfileInput rejects numeric-only role and short posting/resume', () => {
  const result = validateProfileInput({
    ...baseProfile,
    targetRole: '12345',
    jobPosting: 'kısa ilan',
    resumeText: 'kısa cv',
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.targetRole);
  assert.ok(result.errors.jobPosting);
  assert.ok(result.errors.resumeText);
});

test('validateProfileInput passes valid profile and warns when both CV and posting are empty', () => {
  const result = validateProfileInput({
    ...baseProfile,
    jobPosting: '',
    resumeText: '',
  });
  assert.equal(result.valid, true);
  assert.equal(result.suggestions.length, 1);
});

test('validateInterviewAnswer rejects empty and ultra-short responses', () => {
  assert.equal(validateInterviewAnswer('').valid, false);
  assert.equal(validateInterviewAnswer('Biliyorum evet.').valid, false);
  assert.equal(
    validateInterviewAnswer(
      'Önceki projemde performans darboğazını profiler ile tespit edip gereksiz renderları azalttım.'
    ).valid,
    true
  );
});

test('checkCommunityInputCompleteness asks for format or city when missing', () => {
  const missingFormat = checkCommunityInputCompleteness({
    ...baseProfile,
    eventFormat: 'belirtilmedi',
  });
  assert.equal(missingFormat.ready, false);
  assert.equal(missingFormat.needsCityOrFormat, true);

  const missingCity = checkCommunityInputCompleteness({
    ...baseProfile,
    eventFormat: 'yuz_yuze',
    city: '',
  });
  assert.equal(missingCity.ready, false);
  assert.equal(missingCity.needsCityOrFormat, true);

  const onlineNoCity = checkCommunityInputCompleteness({
    ...baseProfile,
    eventFormat: 'cevrimici',
    city: '',
  });
  assert.equal(onlineNoCity.ready, true);
});

test('aggregateWeakCompetencies merges case-insensitively and sorts by frequency', () => {
  const turns = [
    {
      evaluation: {
        detectedWeaknesses: ['Ölçülebilir Sonuç', 'Veri Analizi'],
      },
    },
    {
      evaluation: {
        detectedWeaknesses: ['ölçülebilir sonuç', 'Sunum Becerisi'],
      },
    },
  ] as unknown as Array<Pick<InterviewTurn, 'evaluation'>>;

  const aggregated = aggregateWeakCompetencies(turns);
  assert.equal(aggregated[0].count, 2);
  assert.equal(aggregated[0].name.toLocaleLowerCase('tr-TR'), 'ölçülebilir sonuç');
  assert.equal(aggregated.length, 3);
});

test('computeInterviewProgress tracks primary vs follow-up answers accurately', () => {
  const q1: InterviewQuestion = {
    id: 'q1',
    index: 1,
    totalPlanned: 4,
    category: 'Teknik',
    competency: 'React',
    question: 'State yönetimi yaklaşımınız nedir?',
    contextNote: 'Temel mimari',
    isFollowUp: false,
  };
  const q1FollowUp = createFollowUpQuestionObject(q1, {
    questionId: 'q1',
    strengths: [],
    gaps: [],
    starRewrite: { situation: '', task: '', action: '', result: '' },
    betterExample: '',
    detectedWeaknesses: [],
    shouldFollowUp: true,
    followUpQuestion: 'Context API yerine ne zaman harici store seçersiniz?',
    followUpReason: 'Ölçeklenebilirlik sınırı',
    readinessNote: '',
  });

  const turns: InterviewTurn[] = [
    {
      question: q1,
      answer: 'Duruma göre Context veya Zustand kullanıyorum.',
      evaluation: {
        questionId: 'q1',
        strengths: ['Net tercih'],
        gaps: ['Ölçüt eksik'],
        starRewrite: { situation: 's', task: 't', action: 'a', result: 'r' },
        betterExample: 'ex',
        detectedWeaknesses: ['Mimari Gerekçelendirme'],
        shouldFollowUp: true,
        followUpQuestion: q1FollowUp.question,
        followUpReason: 'Ölçeklenebilirlik',
        readinessNote: 'İyi başlangıç',
      },
      submittedAt: '2026-11-23T10:00:00Z',
    },
    {
      question: q1FollowUp,
      answer: 'Sık güncellenen global state durumlarında selector desteği için Zustand seçerim.',
      evaluation: {
        questionId: q1FollowUp.id,
        strengths: ['Somut teknik ölçüt'],
        gaps: [],
        starRewrite: { situation: 's', task: 't', action: 'a', result: 'r' },
        betterExample: 'ex',
        detectedWeaknesses: [],
        shouldFollowUp: false,
        readinessNote: 'Netleştirildi',
      },
      submittedAt: '2026-11-23T10:02:00Z',
    },
  ];

  const progress = computeInterviewProgress(turns, null, 4);
  assert.equal(progress.primaryAnswered, 1);
  assert.equal(progress.followUpsAnswered, 1);
  assert.equal(progress.completionPercent, 25);
  assert.equal(progress.isComplete, false);
});
