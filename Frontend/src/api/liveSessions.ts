import axios from 'axios';
import type { LiveSession } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const liveSessionsApi = {
  // Students
  getActive: async () => {
    const { data } = await axios.get<LiveSession[]>(`${API_URL}/LiveSessions`);
    return data;
  },
  getById: async (id: number) => {
    const { data } = await axios.get<LiveSession>(`${API_URL}/LiveSessions/${id}`);
    return data;
  },
  
  // Admin
  getAllAdmin: async () => {
    const { data } = await axios.get<LiveSession[]>(`${API_URL}/LiveSessions/admin`);
    return data;
  },
  create: async (session: Partial<LiveSession>) => {
    const { data } = await axios.post<LiveSession>(`${API_URL}/LiveSessions`, session);
    return data;
  },
  update: async (id: number, session: Partial<LiveSession>) => {
    await axios.put(`${API_URL}/LiveSessions/${id}`, session);
  },
  delete: async (id: number) => {
    await axios.delete(`${API_URL}/LiveSessions/${id}`);
  },

  // Booking status
  getBookingStatus: async (sessionId: number) => {
    const { data } = await axios.get<{ hasPendingOrApproved: boolean }>(
      `${API_URL}/Payments/status?sessionId=${sessionId}`
    );
    return data;
  }
};
