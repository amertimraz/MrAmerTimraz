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

  addComment: (videoId: number, content: string, parentId?: number) => 
    client.post<VideoComment>(`/videos/${videoId}/comments`, { content, parentId }).then(r => r.data),

  deleteComment: (commentId: number) => client.delete(`/videos/comments/${commentId}`),
  
  toggleReaction: (commentId: number, type: string) => 
    client.post(`/videos/comments/${commentId}/react`, { type }),

  // Mux Direct Upload
  createMuxDirectUpload: () =>
    client.post<{ uploadUrl: string; assetId: string }>('/videos/mux/direct-upload').then(r => r.data),

  getMuxPlaybackId: (assetId: string) =>
    client.get<{ playbackId: string; url: string }>(`/videos/mux/asset/${assetId}/playback`).then(r => r.data),
};
