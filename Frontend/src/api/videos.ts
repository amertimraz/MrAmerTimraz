import client from './client';
import type { Video } from '../types';

export const videosApi = {
  getByCourse: (courseId: number) =>
    client.get<Video[]>(`/videos/course/${courseId}`).then(r => r.data),

  getById: (id: number) => client.get<Video>(`/videos/${id}`).then(r => r.data),

  create: (data: object) => client.post<Video>('/videos', data).then(r => r.data),

  update: (id: number, data: object) => client.put(`/videos/${id}`, data),

  delete: (id: number) => client.delete(`/videos/${id}`),
};
