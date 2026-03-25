import client from './client';

export interface ChallengeSnippet {
  id?: number;
  code: string;
  analysisType: 'Correct' | 'Syntax' | 'Logic';
  analysisMessage: string;
  orderIndex: number;
}

export interface Challenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  targetOutput: string;
  testId: number;
  orderIndex: number;
  snippets: ChallengeSnippet[];
}

export interface TofasTest {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  isVisible: boolean;
  timeLimitMinutes: number;
  createdAt: string;
  questions?: Challenge[];
}

export const challengesApi = {
  // Student
  getVisible: () =>
    client.get<TofasTest[]>('/challenges').then(r => r.data),

  getBySlug: (slug: string) =>
    client.get<TofasTest>(`/challenges/slug/${slug}`).then(r => r.data),

  // Admin (Tests)
  getAllAdmin: () =>
    client.get<TofasTest[]>('/challenges/admin').then(r => r.data),

  createTest: (test: Partial<TofasTest>) =>
    client.post<TofasTest>('/challenges', test).then(r => r.data),

  updateTest: (id: number, test: Partial<TofasTest>) =>
    client.put<TofasTest>(`/challenges/${id}`, test).then(r => r.data),

  deleteTest: (id: number) =>
    client.delete(`/challenges/${id}`),

  // Admin (Questions)
  addQuestion: (testId: number, question: Partial<Challenge>) =>
    client.post<Challenge>(`/challenges/${testId}/questions`, question).then(r => r.data),

  updateQuestion: (id: number, question: Partial<Challenge>) =>
    client.put<void>(`/challenges/questions/${id}`, question).then(r => r.data),

  deleteQuestion: (id: number) =>
    client.delete(`/challenges/questions/${id}`)
};
