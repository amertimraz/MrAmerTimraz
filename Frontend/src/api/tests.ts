import client from './client';
import type { Test, TestResult, StudentResult } from '../types';

export const testsApi = {
  getByCourse: (courseId: number) =>
    client.get<Test[]>(`/tests/course/${courseId}`).then(r => r.data),

  getById: (id: number) => client.get<Test>(`/tests/${id}`).then(r => r.data),

  create: (data: object) => client.post<Test>('/tests', data).then(r => r.data),

  addQuestion: (testId: number, data: object) =>
    client.post(`/tests/${testId}/questions`, data).then(r => r.data),

  deleteQuestion: (questionId: number) =>
    client.delete(`/tests/questions/${questionId}`),

  publish: (testId: number) =>
    client.post(`/tests/${testId}/publish`).then(r => r.data),

  submit: (data: object) =>
    client.post<TestResult>('/tests/submit', data).then(r => r.data),

  getMyResults: () =>
    client.get<StudentResult[]>('/tests/results/my').then(r => r.data),

  getTestResults: (testId: number) =>
    client.get(`/tests/${testId}/results`).then(r => r.data),

  deleteTest: (testId: number) => client.delete(`/tests/${testId}`),

  getMyTests: () => client.get<Test[]>('/tests/teacher/my').then(r => r.data),
};
