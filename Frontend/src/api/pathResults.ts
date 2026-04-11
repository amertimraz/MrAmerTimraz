import client from './client';

export interface PathResultStats {
  totalUsers: number;
  todayCount: number;
  thisWeekCount: number;
  trackDistribution: {
    trackId: string;
    trackName: string;
    count: number;
  }[];
}

export interface CreatePathResultDto {
  studentName?: string;
  trackId: string;
  trackName: string;
  sessionId?: string;
}

export const pathResultsApi = {
  create: (data: CreatePathResultDto) =>
    client.post('/pathresults', data).then(r => r.data),

  getStats: () =>
    client.get<PathResultStats>('/pathresults/stats').then(r => r.data),

  getRecent: (count = 5) =>
    client.get(`/pathresults/recent?count=${count}`).then(r => r.data),
};
