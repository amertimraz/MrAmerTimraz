import client from './client';
import type { Notification } from '../types';

export const notificationsApi = {
  getMy: () => client.get<Notification[]>('/notifications').then(r => r.data),

  getUnreadCount: () =>
    client.get<{ count: number }>('/notifications/unread-count').then(r => r.data),

  markRead: (id: number) => client.put(`/notifications/${id}/read`),

  broadcast: (data: FormData) =>
    client.post('/notifications/broadcast', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};
