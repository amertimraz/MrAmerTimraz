import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
  snippets?: ChallengeSnippet[];
}

export const challengesApi = {
  // Student
  getVisible: async () => {
    const { data } = await axios.get<Challenge[]>(`${API_URL}/challenges`);
    return data;
  },
  getBySlug: async (slug: string) => {
    const { data } = await axios.get<Challenge>(`${API_URL}/challenges/slug/${slug}`);
    return data;
  },

  // Admin
  getAllAdmin: async () => {
    const { data } = await axios.get<Challenge[]>(`${API_URL}/challenges/admin`);
    return data;
  },
  create: async (challenge: Partial<Challenge>) => {
    const { data } = await axios.post<Challenge>(`${API_URL}/challenges`, challenge);
    return data;
  },
  update: async (id: number, challenge: Partial<Challenge>) => {
    await axios.put(`${API_URL}/challenges/${id}`, challenge);
  },
  delete: async (id: number) => {
    await axios.delete(`${API_URL}/challenges/${id}`);
  }
};
