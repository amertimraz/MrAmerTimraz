import client from './client';
import type { LiveSession } from '../types';

export const liveSessionsApi = {
  // Students
  getActive: async () => {
    const { data } = await client.get<LiveSession[]>('/LiveSessions');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await client.get<LiveSession>(`/LiveSessions/${id}`);
    return data;
  },
  
  // Admin
  getAllAdmin: async () => {
    const { data } = await client.get<LiveSession[]>('/LiveSessions/admin');
    return data;
  },
  create: async (session: Partial<LiveSession>) => {
    const { data } = await client.post<LiveSession>('/LiveSessions', session);
    return data;
  },
  update: async (id: number, session: Partial<LiveSession>) => {
    await client.put(`/LiveSessions/${id}`, session);
  },
  delete: async (id: number) => {
    await client.delete(`/LiveSessions/${id}`);
  },

  // Booking status
  getBookingStatus: async (sessionId: number) => {
    const { data } = await client.get<{ hasPendingOrApproved: boolean }>(
      `/Payments/status?sessionId=${sessionId}`
    );
    return data;
  }
};
