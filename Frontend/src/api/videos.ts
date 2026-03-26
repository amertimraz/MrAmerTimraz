import client from './client';
import type { Video, VideoComment } from '../types';

export const videosApi = {
  getByCourse: (courseId: number) =>
    client.get<Video[]>(`/videos/course/${courseId}`).then(r => r.data),

  getById: (id: number) => client.get<Video>(`/videos/${id}`).then(r => r.data),

  getBySlug: (slug: string) => client.get<Video>(`/videos/slug/${slug}`).then(r => r.data),

  create: (data: Partial<Video>) => client.post<Video>('/videos', data).then(r => r.data),

  update: (id: number, data: Partial<Video>) => client.put(`/videos/${id}`, data),

  delete: (id: number) => client.delete(`/videos/${id}`),

  getComments: (videoId: number) => client.get<VideoComment[]>(`/videos/${videoId}/comments`).then(r => r.data),

  addComment: (videoId: number, content: string) => client.post<VideoComment>(`/videos/${videoId}/comments`, { content }).then(r => r.data),
  deleteComment: (commentId: number) => client.delete(`/videos/comments/${commentId}`),
};
