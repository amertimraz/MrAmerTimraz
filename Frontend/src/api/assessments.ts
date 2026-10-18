import client from './client';

export interface AssessmentWeekSummary {
  week: number;
  unit?: string | null;
  lesson?: string | null;
  sourceUrl: string;
  sourceAvailable: boolean;
  hasSolution: boolean;
  itemCount: number;
  publishedAt?: string | null;
}

export interface AssessmentTrackSummary {
  key: string;
  stage: string;
  stageLabel: string;
  subject: string;
  term: number;
  weeks: AssessmentWeekSummary[];
}

export type AssessmentItem =
  | { type: 'tf'; text: string; answer: boolean; note?: string }
  | { type: 'mcq'; text: string; code?: string; options: string[]; answer: number; note?: string }
  | { type: 'open'; text: string; answer: string; code?: string; output?: string };

export interface AssessmentPart {
  group: string;
  title: string;
  items: AssessmentItem[];
}

export interface AssessmentContent {
  track: string;
  week: number;
  unit: string;
  lesson: string;
  parts: AssessmentPart[];
}

export const assessmentsApi = {
  getCatalog: () =>
    client.get<{ tracks: AssessmentTrackSummary[] }>('/assessments').then(res => res.data.tracks),

  getWeek: (track: string, week: number) =>
    client.get<AssessmentContent>(`/assessments/${track}/${week}`).then(res => res.data),
};

export const visitsApi = {
  // Registers a visit and returns the new total.
  hit: (page: string) => client.post<{ count: number }>(`/visits/${page}`).then(res => res.data.count),
  get: (page: string) => client.get<{ count: number }>(`/visits/${page}`).then(res => res.data.count),
};
