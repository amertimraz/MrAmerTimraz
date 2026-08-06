import client from './client';
import type { TeacherPackage } from '../types';

export const teacherPackagesApi = {
  getAll: (all: boolean = false) =>
    client.get<TeacherPackage[]>(`/teacherpackages?all=${all}`).then(res => res.data),

  getById: (id: number) =>
    client.get<TeacherPackage>(`/teacherpackages/${id}`).then(res => res.data),

  create: (data: Partial<TeacherPackage>) =>
    client.post<TeacherPackage>('/teacherpackages', data).then(res => res.data),

  update: (id: number, data: Partial<TeacherPackage>) =>
    client.put<TeacherPackage>(`/teacherpackages/${id}`, data).then(res => res.data),

  delete: (id: number) =>
    client.delete(`/teacherpackages/${id}`).then(res => res.data),
};
