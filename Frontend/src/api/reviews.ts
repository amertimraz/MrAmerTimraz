import client from './client';

export interface ReviewQuizSummary {
  id: number;
  title: string;
  questionCount: number;
}

export interface ReviewStageSummary {
  stage: string;
  quizzes: ReviewQuizSummary[];
}

export interface ReviewQuestionPublic {
  id: number;
  text: string;
  options: string[];
  order: number;
}

export interface ReviewQuizPublic {
  id: number;
  title: string;
  stage: string;
  questions: ReviewQuestionPublic[];
}

export interface ReviewAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface ReviewSubmitResult {
  score: number;
  totalQuestions: number;
  rank: number;
}

export interface ReviewLeaderboardEntry {
  studentName: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  createdAt: string;
}

export const reviewsApi = {
  getStages: () =>
    client.get<ReviewStageSummary[]>('/reviews/stages').then(res => res.data),

  getQuiz: (id: number) =>
    client.get<ReviewQuizPublic>(`/reviews/quizzes/${id}`).then(res => res.data),

  submit: (id: number, studentName: string, durationSeconds: number, answers: ReviewAnswer[]) =>
    client.post<ReviewSubmitResult>(`/reviews/quizzes/${id}/submit`, {
      studentName,
      durationSeconds,
      answers,
    }).then(res => res.data),

  getLeaderboard: (id: number) =>
    client.get<ReviewLeaderboardEntry[]>(`/reviews/quizzes/${id}/leaderboard`).then(res => res.data),
};
