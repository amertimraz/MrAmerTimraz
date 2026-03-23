import client from './client';
import type { PaymentRequest } from '../types';

export const paymentsApi = {
  createRequest: (courseId: number | null, amountPaid: number, notes: string, receipt?: File, liveSessionId?: number | null) => {
    const form = new FormData();
    if (courseId) form.append('courseId', String(courseId));
    if (liveSessionId) form.append('liveSessionId', String(liveSessionId));
    
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

  getStatus: (courseId: number) =>
    client.get<{ hasPendingOrApproved: boolean }>(`/payments/status/${courseId}`).then(r => r.data),
};
