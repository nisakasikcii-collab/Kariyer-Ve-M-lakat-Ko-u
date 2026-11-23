import { useEffect, useMemo, useState } from 'react';
import { CareerAnalysisView } from './components/CareerAnalysisView';
import { CoursesView } from './components/CoursesView';
import { EventsCommunityView } from './components/EventsCommunityView';
import { InterviewCoachView } from './components/InterviewCoachView';
import { ProfileSetupView } from './components/ProfileSetupView';
import { TopBar } from './components/TopBar';
import { SAMPLE_PROFILE_PRESETS } from './data/presets';
import {
  analyzeCareerProfile,
  evaluateInterviewAnswer,
  fetchCommunityEvents,
  fetchCourseRecommendations,
  fetchNextInterviewQuestion,
  startInterviewSession,
} from './services/coachApi';
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
  WorkspaceTab,
} from './types/career';
import {
  aggregateWeakCompetencies,
  createFollowUpQuestionObject,
  validateProfileInput,
} from './utils/validation';

const STORAGE_KEY = 'kariyer_pusulasi_profile_v1';

const EMPTY_PROFILE: UserProfile = {
  targetRole: '',
  experienceLevel: '',
  jobPosting: '',
  resumeText: '',
  hobbies: '',
  city: '',
  eventFormat: 'belirtilmedi',
};

function loadInitialProfile(): { profile: UserProfile; startTab: WorkspaceTab } {
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    return {
      profile: SAMPLE_PROFILE_PRESETS[0].profile,
      startTab: 'interview',
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      if (parsed && typeof parsed.targetRole === 'string') {
        return {
          profile: { ...EMPTY_PROFILE, ...parsed },
          startTab: 'profile',
        };
      }
    }
  } catch {
    // Ignore malformed localStorage
  }

  return { profile: EMPTY_PROFILE, startTab: 'profile' };
}

export default function App() {
  const initial = useMemo(() => loadInitialProfile(), []);

  const [profile, setProfile] = useState<UserProfile>(initial.profile);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initial.startTab);

  // Interview state
  const [sessionPlan, setSessionPlan] = useState<InterviewSessionPlan | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [pendingEvaluation, setPendingEvaluation] = useState<AnswerEvaluation | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [interviewLoading, setInterviewLoading] = useState<
    'idle' | 'starting' | 'evaluating' | 'next'
  >('idle');
  const [interviewError, setInterviewError] = useState('');

  // Career Analysis state
  const [analysis, setAnalysis] = useState<CareerAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Courses state
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [courseSources, setCourseSources] = useState<GroundingSource[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');

  // Events state
  const [eventsResult, setEventsResult] = useState<CommunityRecommendationsResult | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');

  const profileReady = useMemo(
    () => validateProfileInput(profile).valid,
    [profile]
  );

  const weakCompetencies = useMemo(
    () => aggregateWeakCompetencies(turns).map((item) => item.name),
    [turns]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const handleStartInterview = async (targetProfile: UserProfile = profile) => {
    setInterviewError('');
    setPendingEvaluation(null);
    setPendingAnswer('');
    setTurns([]);
    setInterviewLoading('starting');
    setActiveTab('interview');

    try {
      const data = await startInterviewSession(targetProfile);
      setSessionPlan(data.sessionPlan);
      setCurrentQuestion(data.currentQuestion);
    } catch (error) {
      setSessionPlan(null);
      setCurrentQuestion(null);
      setInterviewError(
        error instanceof Error ? error.message : 'Mülakat oturumu başlatılamadı.'
      );
    } finally {
      setInterviewLoading('idle');
    }
  };

  const handleSaveProfile = (updated: UserProfile, goToInterview: boolean) => {
    setProfile(updated);
    setAnalysis(null);
    setCourses([]);
    setCourseSources([]);
    setEventsResult(null);

    if (goToInterview) {
      void handleStartInterview(updated);
    }
  };

  const handleResetAll = () => {
    setProfile(EMPTY_PROFILE);
    setSessionPlan(null);
    setCurrentQuestion(null);
    setPendingEvaluation(null);
    setPendingAnswer('');
    setTurns([]);
    setInterviewError('');
    setAnalysis(null);
    setAnalysisError('');
    setCourses([]);
    setCourseSources([]);
    setCoursesError('');
    setEventsResult(null);
    setEventsError('');
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setInterviewError('');
    setInterviewLoading('evaluating');

    try {
      const { evaluation } = await evaluateInterviewAnswer({
        profile,
        question: currentQuestion,
        answer,
        history: turns,
      });

      const recordedTurn: InterviewTurn = {
        question: currentQuestion,
        answer,
        evaluation,
        submittedAt: new Date().toISOString(),
      };

      setTurns((prev) => [...prev, recordedTurn]);
      setPendingAnswer(answer);
      setPendingEvaluation(evaluation);
    } catch (error) {
      setInterviewError(
        error instanceof Error ? error.message : 'Yanıtınız değerlendirilemedi.'
      );
    } finally {
      setInterviewLoading('idle');
    }
  };

  const handleAcceptFollowUp = () => {
    if (!currentQuestion || !pendingEvaluation) return;
    const followUp = createFollowUpQuestionObject(currentQuestion, pendingEvaluation);
    setCurrentQuestion(followUp);
    setPendingEvaluation(null);
    setPendingAnswer('');
  };

  const handleAdvanceNextQuestion = async () => {
    if (!sessionPlan) return;
    setInterviewError('');
    setPendingEvaluation(null);
    setPendingAnswer('');
    setInterviewLoading('next');

    try {
      const res = await fetchNextInterviewQuestion({
        profile,
        history: turns,
        sessionPlan,
      });

      if (res.completed || !res.nextQuestion) {
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(res.nextQuestion);
      }
    } catch (error) {
      setInterviewError(
        error instanceof Error ? error.message : 'Sonraki soru alınırken bir hata oluştu.'
      );
    } finally {
      setInterviewLoading('idle');
    }
  };

  const handleGenerateAnalysis = async () => {
    setAnalysisError('');
    setAnalysisLoading(true);
    try {
      const data = await analyzeCareerProfile({ profile, weakCompetencies });
      setAnalysis(data.analysis);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'Kariyer analizi oluşturulamadı.'
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleFetchCourses = async () => {
    setCoursesError('');
    setCoursesLoading(true);
    try {
      const data = await fetchCourseRecommendations({ profile, weakCompetencies });
      setCourses(data.courses);
      setCourseSources(data.sources ?? []);
    } catch (error) {
      setCoursesError(
        error instanceof Error ? error.message : 'Eğitim önerileri oluşturulamadı.'
      );
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleFetchEvents = async (targetProfile: UserProfile = profile) => {
    setEventsError('');
    setEventsLoading(true);
    try {
      const data = await fetchCommunityEvents({ profile: targetProfile });
      setEventsResult(data.result);
    } catch (error) {
      setEventsError(
        error instanceof Error ? error.message : 'Etkinlik önerileri oluşturulamadı.'
      );
    } finally {
      setEventsLoading(false);
    }
  };

  const handleUpdateCommunityDetails = (
    updates: Partial<UserProfile>,
    fetchAfter: boolean
  ) => {
    const nextProfile = { ...profile, ...updates };
    setProfile(nextProfile);
    if (fetchAfter) {
      void handleFetchEvents(nextProfile);
    }
  };

  const handleTopBarPrimaryAction = () => {
    if (!profileReady) {
      setActiveTab('profile');
      return;
    }
    void handleStartInterview(profile);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrimaryAction={handleTopBarPrimaryAction}
        hasActiveSession={Boolean(sessionPlan)}
        profileReady={profileReady}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && (
          <ProfileSetupView
            key={`${profile.targetRole}-${profile.experienceLevel}-${profile.eventFormat}`}
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onResetAll={handleResetAll}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewCoachView
            profile={profile}
            profileReady={profileReady}
            sessionPlan={sessionPlan}
            currentQuestion={currentQuestion}
            pendingEvaluation={pendingEvaluation}
            pendingAnswer={pendingAnswer}
            turns={turns}
            loadingState={interviewLoading}
            errorMessage={interviewError}
            onGoToProfile={() => setActiveTab('profile')}
            onStartInterview={() => void handleStartInterview(profile)}
            onSubmitAnswer={(ans) => void handleSubmitAnswer(ans)}
            onAcceptFollowUp={handleAcceptFollowUp}
            onAdvanceNextQuestion={() => void handleAdvanceNextQuestion()}
            onOpenCourses={() => {
              setActiveTab('courses');
              if (courses.length === 0) {
                void handleFetchCourses();
              }
            }}
            onOpenAnalysis={() => {
              setActiveTab('analysis');
              if (!analysis) {
                void handleGenerateAnalysis();
              }
            }}
          />
        )}

        {activeTab === 'analysis' && (
          <CareerAnalysisView
            profile={profile}
            profileReady={profileReady}
            weakCompetencies={weakCompetencies}
            analysis={analysis}
            loading={analysisLoading}
            errorMessage={analysisError}
            onGenerateAnalysis={() => void handleGenerateAnalysis()}
            onGoToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            profile={profile}
            profileReady={profileReady}
            weakCompetencies={weakCompetencies}
            courses={courses}
            courseSources={courseSources}
            loading={coursesLoading}
            errorMessage={coursesError}
            onFetchCourses={() => void handleFetchCourses()}
            onGoToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'events' && (
          <EventsCommunityView
            profile={profile}
            profileReady={profileReady}
            eventsResult={eventsResult}
            loading={eventsLoading}
            errorMessage={eventsError}
            onUpdateCommunityDetails={handleUpdateCommunityDetails}
            onFetchEvents={() => void handleFetchEvents(profile)}
            onGoToProfile={() => setActiveTab('profile')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Kariyer Pusulası — Sıralı Mülakat ve Kariyer Gelişim Çalışma Alanı</span>
          <span>
            Tüm değerlendirmeler rol bağlamınıza ve STAR metoduna göre dinamik olarak üretilir.
          </span>
        </div>
      </footer>
    </div>
  );
}
