import client from './client';
import type { InteractiveQuiz, InteractiveQuizSummary } from '../types';

export interface QuizPayload {
  title: string;
  subject?: string;
  grade?: string;
  description?: string;
}

export interface QuestionPayload {
  text: string;
  type: 'MCQ' | 'TrueFalse';
  options?: string;
  correctAnswer?: string;
  explanation?: string;
}

export const quizzesApi = {
  getAll: () =>
    client.get<InteractiveQuizSummary[]>('/interactive-quizzes').then(r => r.data),

  getById: (id: number) =>
    client.get<InteractiveQuiz>(`/interactive-quizzes/${id}`).then(r => r.data),

  create: (data: QuizPayload) =>
    client.post<InteractiveQuiz>('/interactive-quizzes', data).then(r => r.data),

  update: (id: number, data: QuizPayload) =>
    client.put<InteractiveQuiz>(`/interactive-quizzes/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/interactive-quizzes/${id}`),

  bulkAddQuestions: (quizId: number, questions: QuestionPayload[]) =>
    client.post(`/interactive-quizzes/${quizId}/questions/bulk`, questions).then(r => r.data),

  clearQuestions: (quizId: number) =>
    client.delete(`/interactive-quizzes/${quizId}/questions`),

  deleteQuestion: (questionId: number) =>
    client.delete(`/interactive-quizzes/questions/${questionId}`),

  updateQuestion: (questionId: number, data: QuestionPayload) =>
    client.put(`/interactive-quizzes/questions/${questionId}`, data).then(r => r.data),
};
