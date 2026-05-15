import client from './client';
import type { LibraryItem, LibraryStudentInfo, UserType } from '../types';

interface LibraryItemPayload {
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
  thumbnailUrl?: string;
}

interface StudentInfoPayload {
  name: string;
  userType: UserType;
  phone: string;
  governorate: string;
  noteTitle: string;
  action: 'view' | 'download';
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
  incrementView: (id: number) =>
    client.post<{ viewCount: number }>(`/library/${id}/view`).then(r => r.data),
  incrementDownload: (id: number) =>
    client.post<{ downloadCount: number }>(`/library/${id}/download`).then(r => r.data),

  submitStudentInfo: (noteId: number, data: StudentInfoPayload) =>
    client.post('/library/student-info', { noteId, ...data }).then(r => r.data),

  getStudentInfos: () =>
    client.get<LibraryStudentInfo[]>('/library/student-info').then(r => r.data),

  getRequireInfo: () =>
    client.get<{ require: boolean }>('/library/require-info').then(r => r.data),

  setRequireInfo: (require: boolean) =>
    client.post('/library/require-info', { require }).then(r => r.data),

  getLockStatus: () =>
    client.get<{ isLocked: boolean; modalType: string; freeDownloadLink: string; lockThumbnailUrl: string; lockMemoTitle: string; freeDownloadCount: number; showLockThumbnail: boolean }>('/library/lock-status').then(r => r.data),

  setLockStatus: (data: { isLocked: boolean; modalType?: string; freeDownloadLink?: string; lockThumbnailUrl?: string; lockMemoTitle?: string; showLockThumbnail?: boolean }) =>
    client.post('/library/lock-status', data).then(r => r.data),

  incrementFreeDownload: () =>
    client.post<{ count: number }>('/library/increment-free-download').then(r => r.data),
};
