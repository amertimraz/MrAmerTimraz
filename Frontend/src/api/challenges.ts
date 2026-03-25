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
  price: number;
  isVisible: boolean;
  timeLimitMinutes: number;
  snippets?: ChallengeSnippet[];
}

export const challengesApi = {
  // Student
  getVisible: () =>
    client.get<Challenge[]>('/challenges').then(r => r.data),

  getBySlug: (slug: string) =>
    client.get<Challenge>(`/challenges/slug/${slug}`).then(r => r.data),

  // Admin
  getAllAdmin: () =>
    client.get<Challenge[]>('/challenges/admin').then(r => r.data),

  create: (challenge: Partial<Challenge>) =>
    client.post<Challenge>('/challenges', challenge).then(r => r.data),

  update: (id: number, challenge: Partial<Challenge>) =>
    client.put<Challenge>(`/challenges/${id}`, challenge).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/challenges/${id}`)
};
