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
} from '../types/career';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(data.error || `İstek başarısız oldu (${response.status}).`);
  }
  return data;
}

export async function startInterviewSession(profile: UserProfile): Promise<{
  sessionPlan: InterviewSessionPlan;
  currentQuestion: InterviewQuestion;
}> {
  return postJson('/api/interview/start', { profile });
}

export async function evaluateInterviewAnswer(params: {
  profile: UserProfile;
  question: InterviewQuestion;
  answer: string;
  history: InterviewTurn[];
}): Promise<{ evaluation: AnswerEvaluation }> {
  return postJson('/api/interview/evaluate', params);
}

export async function fetchNextInterviewQuestion(params: {
  profile: UserProfile;
  history: InterviewTurn[];
  sessionPlan: InterviewSessionPlan;
}): Promise<{ completed: boolean; nextQuestion: InterviewQuestion | null }> {
  return postJson('/api/interview/next', params);
}

export async function analyzeCareerProfile(params: {
  profile: UserProfile;
  weakCompetencies: string[];
}): Promise<{ analysis: CareerAnalysisResult }> {
  return postJson('/api/career/analyze', params);
}

export async function fetchCourseRecommendations(params: {
  profile: UserProfile;
  weakCompetencies: string[];
}): Promise<{ courses: CourseRecommendation[]; sources?: GroundingSource[] }> {
  return postJson('/api/career/courses', params);
}

export async function fetchCommunityEvents(params: {
  profile: UserProfile;
}): Promise<{ result: CommunityRecommendationsResult }> {
  return postJson('/api/career/events', params);
}
