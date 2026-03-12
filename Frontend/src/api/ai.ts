import client from './client';

export interface AiParsedQuestion {
  text: string;
  type: 'MCQ' | 'TrueFalse';
  options: string[];
  correctAnswer: string | null;
}

export const aiApi = {
  describe: (title: string, context: string) =>
    client.post<{ description: string }>('/ai/describe', { title, context }).then(r => r.data),

  parseQuiz: (text: string) =>
    client.post<{ questions: AiParsedQuestion[] }>('/ai/parse-quiz', { text }).then(r => r.data),

  detectAnswer: (text: string, options: string[], type: string) =>
    client.post<{ correctAnswer: string | null; hint?: string }>('/ai/detect-answer', { text, options, type }).then(r => r.data),
};
