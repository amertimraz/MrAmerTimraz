import client from './client';
import type { LibraryItem } from '../types';

interface LibraryItemPayload {
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
  thumbnailUrl?: string;
}

export const libraryApi = {
  getAll: (category?: string) =>
    client.get<LibraryItem[]>('/library', { params: category ? { category } : {} }).then(r => r.data),

  getCategories: () =>
    client.get<string[]>('/library/categories').then(r => r.data),

  create: (data: LibraryItemPayload) =>
    client.post<LibraryItem>('/library', data).then(r => r.data),

  update: (id: number, data: LibraryItemPayload) =>
    client.put<LibraryItem>(`/library/${id}`, data).then(r => r.data),

  delete: (id: number) => client.delete(`/library/${id}`),
};
