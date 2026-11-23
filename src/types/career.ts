export type ExperienceLevel =
  | 'stajyer'
  | 'yeni_mezun'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'kariyer_degisimi';

export type EventFormat = 'belirtilmedi' | 'cevrimici' | 'yuz_yuze' | 'hibrit';

export type WorkspaceTab =
  | 'profile'
  | 'interview'
  | 'analysis'
  | 'courses'
  | 'events';

export interface UserProfile {
  targetRole: string;
  experienceLevel: ExperienceLevel | '';
  jobPosting: string;
  resumeText: string;
  hobbies: string;
  city: string;
  eventFormat: EventFormat;
}

export interface InterviewQuestion {
  id: string;
  index: number;
  totalPlanned: number;
  category: string;
  competency: string;
  question: string;
  contextNote: string;
  isFollowUp: boolean;
  parentQuestionId?: string;
}

export interface StarRewrite {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface AnswerEvaluation {
  questionId: string;
  strengths: string[];
  gaps: string[];
  starRewrite: StarRewrite;
  betterExample: string;
  detectedWeaknesses: string[];
  shouldFollowUp: boolean;
  followUpQuestion?: string;
  followUpReason?: string;
  readinessNote: string;
}

export interface InterviewTurn {
  question: InterviewQuestion;
  answer: string;
  evaluation: AnswerEvaluation;
  submittedAt: string;
}

export interface InterviewSessionPlan {
  focusAreas: string[];
  totalPrimaryQuestions: number;
  coachingStrategy: string;
}

export interface CvImprovementItem {
  section: string;
  currentObservation: string;
  actionableSuggestion: string;
  exampleBullet: string;
}

export interface SkillGapItem {
  skill: string;
  currentLevel: string;
  targetExpectation: string;
  priority: 'Yüksek' | 'Orta' | 'Destekleyici';
  closingAction: string;
}

export interface PortfolioProjectSuggestion {
  title: string;
  problemStatement: string;
  scopeSummary: string;
  toolsAndStack: string[];
  targetGapClosed: string;
  cvPresentationTip: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
  domain: string;
}

export interface CareerAnalysisResult {
  profileSummary: string;
  cvImprovements: CvImprovementItem[];
  skillGaps: SkillGapItem[];
  portfolioProjects: PortfolioProjectSuggestion[];
  sources?: GroundingSource[];
}

export interface CourseRecommendation {
  title: string;
  competencyTarget: string;
  rationale: string;
  formatType: string;
  platformLogic: string;
  searchKeywords: string;
  estimatedLevel: string;
}

export interface CoursesRecommendationsResult {
  courses: CourseRecommendation[];
  sources: GroundingSource[];
}

export interface CommunityEventRecommendation {
  title: string;
  hobbyConnection: string;
  careerBenefit: string;
  benefitCategory: 'Sosyal Beceri' | 'Üretkenlik' | 'İş-Yaşam Dengesi';
  eventType: string;
  platformOrVenueLogic: string;
  format: 'Çevrimiçi' | 'Yüz Yüze' | 'Hibrit';
  cityContext: string;
}

export interface CommunityRecommendationsResult {
  needsMoreDetails: boolean;
  missingDetailPrompt: string;
  recommendations: CommunityEventRecommendation[];
  sources?: GroundingSource[];
}
