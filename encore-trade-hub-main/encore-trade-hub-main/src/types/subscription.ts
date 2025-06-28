export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  interval: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  features: string[];
}

export interface CreateSubscriptionRequest {
  planId: string;
  interval: 'monthly' | 'yearly';
  customerId?: string;
}

// This is the response format we get from our mock implementation and Razorpay
export interface SubscriptionResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface RazorpaySubscriptionResponse {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at: number;
  quantity: number;
  notes: Record<string, string>;
}
