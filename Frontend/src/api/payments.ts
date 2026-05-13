import client from './client';
import type { PaymentRequest, BookletPurchaseStats } from '../types';

export const paymentsApi = {
  createRequest: (courseId: number | null, amountPaid: number, notes: string, receipt?: File, liveSessionId?: number | null, bookletId?: number | null) => {
    const form = new FormData();
    if (courseId) form.append('courseId', String(courseId));
    if (liveSessionId) form.append('liveSessionId', String(liveSessionId));
    if (bookletId) form.append('bookletId', String(bookletId));
    
    form.append('amountPaid', String(amountPaid));
    form.append('notes', notes);
    if (receipt) form.append('receipt', receipt);
    return client.post<PaymentRequest>('/payments/request', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getAll: () => client.get<PaymentRequest[]>('/payments').then(r => r.data),

  getMy: () => client.get<PaymentRequest[]>('/payments/my').then(r => r.data),

  review: (id: number, approve: boolean, adminNote?: string) =>
    client.put<PaymentRequest>(`/payments/${id}/review`, { approve, adminNote }).then(r => r.data),

  getStatus: (courseId?: number, sessionId?: number, bookletId?: number) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', String(courseId));
    if (sessionId) params.append('sessionId', String(sessionId));
    if (bookletId) params.append('bookletId', String(bookletId));
    return client.get<{ hasPendingOrApproved: boolean }>(`/payments/status?${params}`).then(r => r.data);
  },

  getAccessStatus: (courseId?: number, sessionId?: number, bookletId?: number) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', String(courseId));
    if (sessionId) params.append('sessionId', String(sessionId));
    if (bookletId) params.append('bookletId', String(bookletId));
    return client.get<{ hasAccess: boolean }>(`/payments/access?${params}`).then(r => r.data);
  },

  getBookletStats: () => client.get<BookletPurchaseStats>('/payments/booklet-stats').then(r => r.data),

  initiateKashier: (data: { courseId?: number; liveSessionId?: number; bookletId?: number; amountPaid: number; notes?: string; guestName?: string; guestPhone?: string }) =>
    client.post<{ paymentUrl: string }>('/payments/kashier/initiate', data).then(r => r.data),
};
