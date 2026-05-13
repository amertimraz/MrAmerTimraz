import client from './client';
import type { Booklet } from '../types';

export const bookletsApi = {
  getAll: (all: boolean = false) => 
    client.get<Booklet[]>(`/booklets?all=${all}`).then(res => res.data),
    
  getById: (id: number) => 
    client.get<Booklet>(`/booklets/${id}`).then(res => res.data),

  create: (data: Partial<Booklet>) => 
    client.post<Booklet>('/booklets', data).then(res => res.data),

  update: (id: number, data: Partial<Booklet>) => 
    client.put<Booklet>(`/booklets/${id}`, data).then(res => res.data),

  delete: (id: number) => 
    client.delete(`/booklets/${id}`).then(res => res.data),

  getDownloadUrl: (id: number) => 
    `${import.meta.env.VITE_API_URL || ''}/api/booklets/${id}/download`,
};
