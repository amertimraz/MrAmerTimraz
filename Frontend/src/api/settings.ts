import client from './client';

export interface PaymentSettings {
  vodafoneCashNumber: string;
  instapayNumber: string;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolder: string;
  paymentInstructions: string;
}

export interface UpdatePaymentSettings {
  vodafoneCashNumber?: string;
  instapayNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolder?: string;
  paymentInstructions?: string;
}

export const settingsApi = {
  getPaymentSettings: () => 
    client.get<PaymentSettings>('/settings/payment').then(r => r.data),
  
  updatePaymentSettings: (data: UpdatePaymentSettings) => 
    client.put('/settings/payment', data).then(r => r.data),
};
