import client from './client';

export interface TeacherBookletSummary {
  id: number;
  title: string;
  gradeLevel?: string | null;
  subject?: string | null;
  term?: string | null;
  pageCount?: number | null;
  coverImageUrl?: string | null;
  studentPrice?: number | null;
  teacherPrice?: number | null;
  hasSamples: boolean;
}

export interface SamplePage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface TeacherBookletDetails extends Omit<TeacherBookletSummary, 'hasSamples'> {
  teacherSummary?: string | null;
  description?: string | null;
  samples: SamplePage[];
}

export interface InquiryPayload {
  bookletId?: number | null;
  name: string;
  phone: string;
  governorate: string;
  gradeLevel?: string;
  subject?: string;
  quantity: number;
  notes?: string;
  website?: string; // honeypot, must stay empty
}

export interface InquiryResult {
  id: number;
  whatsAppUrl?: string;
}

export interface TeacherInquiryRow {
  id: number;
  name: string;
  phone: string;
  governorate: string;
  gradeLevel?: string | null;
  subject?: string | null;
  quantity: number;
  notes?: string | null;
  status: 'New' | 'Contacted' | 'Sold' | 'Cancelled';
  adminNote?: string | null;
  createdAt: string;
  bookletId?: number | null;
  bookletTitle?: string | null;
}

export interface AdminTeacherBooklet {
  id: number;
  title: string;
  gradeLevel?: string | null;
  subject?: string | null;
  isPublished: boolean;
  teacherShowcase: boolean;
  teacherSummary?: string | null;
  studentPrice?: number | null;
  teacherPrice?: number | null;
  coverImageUrl?: string | null;
  samples: SamplePage[];
}

export const teachersApi = {
  list: () =>
    client.get<{ items: TeacherBookletSummary[] }>('/teacher-booklets').then(r => r.data.items),

  get: (id: number) =>
    client.get<TeacherBookletDetails>(`/teacher-booklets/${id}`).then(r => r.data),

  sendInquiry: (payload: InquiryPayload) =>
    client.post<InquiryResult>('/teacher-inquiries', payload).then(r => r.data),

  // Admin
  adminList: (params: { status?: string; governorate?: string; bookletId?: number; page?: number }) =>
    client
      .get<{ total: number; newCount: number; items: TeacherInquiryRow[] }>('/admin/teacher-inquiries', { params })
      .then(r => r.data),

  adminBooklets: () =>
    client.get<{ items: AdminTeacherBooklet[] }>('/admin/teacher-booklets').then(r => r.data.items),

  updateBooklet: (id: number, body: { teacherShowcase: boolean; teacherSummary?: string | null; teacherPrice?: number | null; studentPrice?: number | null }) =>
    client.put(`/admin/teacher-booklets/${id}`, body).then(r => r.data),

  uploadSample: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return client
      .post(`/admin/teacher-booklets/${id}/samples/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data);
  },

  deleteSample: (id: number, sampleId: number) =>
    client.delete(`/admin/teacher-booklets/${id}/samples/${sampleId}`).then(r => r.data),

  updateInquiry: (id: number, body: { status?: string; adminNote?: string }) =>
    client.put(`/admin/teacher-inquiries/${id}`, body).then(r => r.data),
};
