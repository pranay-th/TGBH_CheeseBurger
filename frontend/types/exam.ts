export interface User {
  name: string;
  email: string;
  password?: string;
}

export interface TestCase {
  input: any;
  expected: any;
}

export interface MCQOption {
  id: string;
  text: string;
}

interface BaseQuestion {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  question: string;
  options: MCQOption[];
  correctAnswer: string;
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding';
  question: string;
  language: string;
  template: string;
  testCases: TestCase[];
}

export type Question = MCQQuestion | CodingQuestion;

export interface ExamState {
  currentUser: User | null;
  currentQuestion: number;
  examStarted: boolean;
  fullscreenMode: boolean;
  tabSwitchCount: number;
  time: number;
  showLoginModalState: boolean;
  showSignupModalState: boolean;
  showCompletionMessage: boolean;
  showEditor: boolean;
  endTime: number | null;
  codeAnswers: Record<number, string>;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Record<number, string>;
  timeRemaining: number;
  isSubmitted: boolean;
} 