import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { name: string; username: string; phoneNumber: string; password: string; role: string }) =>
    client.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { identifier: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', data).then(r => r.data),

  me: () => client.get<User>('/auth/me').then(r => r.data),

  getUsers: () => client.get<User[]>('/auth/users').then(r => r.data),

  getUserById: (id: number) => client.get<User>(`/auth/users/${id}`).then(r => r.data),

  deleteUser: (id: number) => client.delete(`/auth/users/${id}`),

  updateUser: (id: number, data: object) => client.put(`/auth/users/${id}`, data),

  // Update own profile image (any authenticated user)
  updateMyProfileImage: (imageUrl: string) =>
    client.put<User>('/auth/profile/image', { imageUrl }).then(r => r.data),

  // Admin updates any user's image
  updateUserProfileImage: (id: number, imageUrl: string) =>
    client.put(`/auth/users/${id}/image`, { imageUrl }),

  // Get user stats (admin)
  getUserStats: (id: number) =>
    client.get<{ enrolledCount: number; completedTests: number }>(`/auth/users/${id}/stats`).then(r => r.data),
};
