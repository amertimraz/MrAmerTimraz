import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { name: string; username: string; phoneNumber: string; password: string; role: string }) =>
    client.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { identifier: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', data).then(r => r.data),

  me: () => client.get<User>('/auth/me').then(r => r.data),

  getUsers: () => client.get<User[]>('/auth/users').then(r => r.data),

  deleteUser: (id: number) => client.delete(`/auth/users/${id}`),

  updateUser: (id: number, data: object) => client.put(`/auth/users/${id}`, data),
};
