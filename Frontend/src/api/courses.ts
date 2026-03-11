import client from './client';
import type { Course } from '../types';

export const coursesApi = {
  getAll: (publishedOnly = false) =>
    client.get<Course[]>('/courses', { params: { publishedOnly } }).then(r => r.data),

  getById: (id: number) => client.get<Course>(`/courses/${id}`).then(r => r.data),

  getMyCourses: () => client.get<Course[]>('/courses/teacher/my').then(r => r.data),

  getStudentCourses: () => client.get<Course[]>('/courses/student/my').then(r => r.data),

  create: (data: object) => client.post<Course>('/courses', data).then(r => r.data),

  update: (id: number, data: object) => client.put<Course>(`/courses/${id}`, data).then(r => r.data),

  delete: (id: number) => client.delete(`/courses/${id}`),

  enroll: (id: number) => client.post(`/courses/${id}/enroll`).then(r => r.data),
};
