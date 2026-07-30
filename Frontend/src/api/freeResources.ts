import client from './client';
import type { FreeResource } from '../types';

export const freeResourcesApi = {
  getAll: (all: boolean = false) =>
    client.get<FreeResource[]>(`/freeresources?all=${all}`).then(res => res.data),

  getById: (id: number) =>
    client.get<FreeResource>(`/freeresources/${id}`).then(res => res.data),

  create: (data: Partial<FreeResource>) =>
    client.post<FreeResource>('/freeresources', data).then(res => res.data),

  update: (id: number, data: Partial<FreeResource>) =>
    client.put<FreeResource>(`/freeresources/${id}`, data).then(res => res.data),

  delete: (id: number) =>
    client.delete(`/freeresources/${id}`).then(res => res.data),

  getDownloadUrl: (id: number) =>
    `${import.meta.env.VITE_API_URL || '/api'}/freeresources/${id}/download`,
};
