export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface Syllabus {
  id: number;
  title: string;
  description?: string;
  documentType: 'PDF' | 'WORD' | 'TEXT' | 'OTHER';
  originalDocumentUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
}

export interface Topic {
  id: number;
  title: string;
  content?: string;
  estimatedDurationMinutes?: number;
  deadline?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  syllabusId: number;
  progress?: Progress;
  assignments?: Assignment[];
}

export interface Progress {
  id: number;
  completed: boolean;
  completionPercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  topicId: number;
}

export interface Assignment {
  id: number;
  title: string;
  content?: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'GOD';
  maxPoints?: number;
  isCompleted: boolean;
  earnedPoints?: number;
  createdAt: string;
  updatedAt: string;
  topicId: number;
  questions?: Question[];
}

export interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points?: number;
  createdAt: string;
  updatedAt: string;
  assignmentId: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
  questionId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface UploadSyllabusRequest {
  file: File;
  title: string;
  description?: string;
  userId: number;
}

export interface CreateTopicRequest {
  title: string;
  content?: string;
  estimatedDurationMinutes?: number;
  deadline?: string;
  orderIndex: number;
  syllabusId: number;
}

export interface TrackProgressRequest {
  topicId: number;
  completionPercentage: number;
}
