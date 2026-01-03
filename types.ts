
export enum Category {
  POLITICS = 'Politics',
  SECURITY = 'Security',
  SPORT = 'Sports',
  GEOPOLITICS = 'Geopolitics',
  ORGANIZATIONS = 'Organizations & Acronyms',
  ECONOMY = 'Economy & Policy',
  ADMINISTRATION = 'Public Administration',
  CONSTITUTION_ETHICS = 'Constitution & Ethics',
  TECH_CULTURE = 'Tech, Culture & Infrastructure',
  GENERAL = 'General'
}

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  groundingSources?: { uri: string; title: string }[];
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface HubSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  prompt: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  results: QuizResult[];
  status: 'idle' | 'loading' | 'active' | 'finished' | 'error' | 'browsing';
  error: string | null;
  hubContent?: string;
  hubTitle?: string;
}
