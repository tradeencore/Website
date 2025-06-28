export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in paise
  interval: 'monthly' | 'yearly';
  features: string[];
  isTest?: boolean;
}

export interface SubscriptionResponse {
  id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  planId: string;
  userId: string;
  startDate: string;
  endDate: string;
  paymentId?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: 'razorpay' | 'test';
  userEmail: string;
  userId: string;
}

// Test subscription plans
const TEST_PLANS: SubscriptionPlan[] = [
  {
    id: 'test_monthly_1',
    name: 'Test Monthly Plan',
    description: 'Test subscription for ₹1/month',
    price: 100, // ₹1 in paise
    interval: 'monthly',
    features: ['Full access to dashboard', 'Test subscription'],
    isTest: true
  },
  {
    id: 'test_monthly_7',
    name: 'Test Plan ₹7',
    description: 'Test subscription for ₹7/month',
    price: 700, // ₹7 in paise
    interval: 'monthly',
    features: ['Full access to dashboard', 'Test subscription', 'Complete testing flow'],
    isTest: true
  },
  {
    id: 'test_yearly_1',
    name: 'Test Yearly Plan',
    description: 'Test subscription for ₹10/year',
    price: 1000, // ₹10 in paise
    interval: 'yearly',
    features: ['Full access to dashboard', 'Test subscription', 'Discounted rate'],
    isTest: true
  }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || !import.meta.env.VITE_TEST_MODE; // Default to test mode

// In-memory storage for test subscriptions
const testSubscriptions: Record<string, SubscriptionResponse> = {};

export const subscriptionService = {
  // Get all available subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    if (TEST_MODE) {
      return [...TEST_PLANS];
    }
    
    const response = await fetch(`${API_URL}/plans`);
    if (!response.ok) {
      throw new Error('Failed to fetch subscription plans');
    }
    return response.json();
  },

  // Get a specific plan by ID
  async getPlan(planId: string): Promise<SubscriptionPlan | undefined> {
    if (TEST_MODE) {
      return TEST_PLANS.find(plan => plan.id === planId);
    }
    
    const response = await fetch(`${API_URL}/plans/${planId}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to fetch subscription plan');
    }
    return response.json();
  },

  // Create a new subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    if (TEST_MODE) {
      const plan = TEST_PLANS.find(p => p.id === request.planId);
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      const now = new Date();
      const endDate = new Date(now);
      
      if (plan.interval === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription: SubscriptionResponse = {
        id: `sub_${Date.now()}`,
        status: 'active',
        planId: plan.id,
        userId: request.userId,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        paymentId: `pay_${Date.now()}`,
        receipt: `rcpt_${Date.now()}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Store in memory for test mode
      testSubscriptions[subscription.id] = subscription;
      
      // Also store in localStorage for persistence
      const userSubscriptions = JSON.parse(localStorage.getItem('testSubscriptions') || '{}');
      userSubscriptions[request.userId] = subscription;
      localStorage.setItem('testSubscriptions', JSON.stringify(userSubscriptions));
      
      return subscription;
    }

    // Real API call in production
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    return response.json();
  },

  // Get active subscription for the current user
  async getActiveSubscription(userId: string): Promise<SubscriptionResponse | null> {
    if (TEST_MODE) {
      // Check in-memory first
      const sub = Object.values(testSubscriptions)
        .find(sub => sub.userId === userId && sub.status === 'active' && new Date(sub.endDate) > new Date());
      
      if (sub) return sub;
      
      // Check localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem('testSubscriptions') || '{}');
      const userSub = userSubscriptions[userId];
      
      if (userSub && new Date(userSub.endDate) > new Date()) {
        return userSub;
      }
      
      return null;
    }

    const response = await fetch(`${API_URL}/subscriptions/active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch active subscription');
    }

    return response.json();
  },

  // Cancel a subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (TEST_MODE) {
      if (testSubscriptions[subscriptionId]) {
        testSubscriptions[subscriptionId].status = 'cancelled';
        testSubscriptions[subscriptionId].updatedAt = new Date().toISOString();
      }
      
      // Also update in localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem('testSubscriptions') || '{}');
      for (const userId in userSubscriptions) {
        if (userSubscriptions[userId].id === subscriptionId) {
          userSubscriptions[userId].status = 'cancelled';
          userSubscriptions[userId].updatedAt = new Date().toISOString();
          localStorage.setItem('testSubscriptions', JSON.stringify(userSubscriptions));
          break;
        }
      }
      
      return;
    }

    const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  },
  
  // Get subscription by ID
  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse | null> {
    if (TEST_MODE) {
      // Check in-memory first
      if (testSubscriptions[subscriptionId]) {
        return testSubscriptions[subscriptionId];
      }
      
      // Check localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem('testSubscriptions') || '{}');
      for (const userId in userSubscriptions) {
        if (userSubscriptions[userId].id === subscriptionId) {
          return userSubscriptions[userId];
        }
      }
      
      return null;
    }
    
    const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch subscription');
    }
    
    return response.json();
  },
};
