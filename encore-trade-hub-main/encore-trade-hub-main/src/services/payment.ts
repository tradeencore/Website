import { Payment, PaymentStatus } from '@/types/payment';

export const paymentService = {
  async initiatePayment(userId: string): Promise<Payment> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiatePayment',
          userId,
          amount: 7 // Fixed amount of ₹7
        })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to initiate payment');
    }
  },

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyPayment',
          paymentId
        })
      });
      const data = await response.json();
      return data.status;
    } catch (error) {
      return PaymentStatus.FAILED;
    }
  },

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPaymentHistory',
          userId
        })
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  }
};
