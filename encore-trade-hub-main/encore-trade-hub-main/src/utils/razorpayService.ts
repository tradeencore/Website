
// Razorpay integration service for Trade Encore

export interface RazorpayOptions {
  key: string;
  subscription_id?: string;
  amount?: number;
  currency?: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  description: string;
}

export class RazorpayService {
  private static isScriptLoaded = false;

  // Load Razorpay script dynamically
  static async loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isScriptLoaded || window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  // Create subscription payment
  static async createSubscriptionPayment(
    plan: SubscriptionPlan,
    customerDetails: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: (response: RazorpayResponse) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      await this.loadRazorpayScript();

      // In production, you would get these from your Google Apps Script
      const razorpayKey = 'rzp_test_1234567890'; // This would be retrieved from backend
      const subscriptionId = `sub_${plan.id}_${Date.now()}`; // This would be created by backend

      const options: RazorpayOptions = {
        key: razorpayKey,
        subscription_id: subscriptionId,
        name: 'Trade Encore',
        description: `${plan.name} - ${plan.description}`,
        image: '/favicon.ico', // This would be the base64 logo from Google Apps Script
        handler: onSuccess,
        prefill: customerDetails,
        theme: {
          color: '#1e3a8a' // Trade Encore's navy blue
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  // Create one-time payment
  static async createOneTimePayment(
    amount: number,
    description: string,
    customerDetails: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: (response: RazorpayResponse) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      await this.loadRazorpayScript();

      const razorpayKey = 'rzp_test_1234567890'; // This would be retrieved from backend

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Trade Encore',
        description: description,
        image: '/favicon.ico',
        handler: onSuccess,
        prefill: customerDetails,
        theme: {
          color: '#1e3a8a'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  // Subscription plans configuration
  static getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic',
        amount: 2999,
        currency: 'INR',
        interval: 'monthly',
        description: 'Perfect for individual investors'
      },
      {
        id: 'premium',
        name: 'Premium',
        amount: 4999,
        currency: 'INR',
        interval: 'monthly',
        description: 'Most popular for active traders'
      },
      {
        id: 'professional',
        name: 'Professional',
        amount: 7999,
        currency: 'INR',
        interval: 'monthly',
        description: 'Complete research suite'
      }
    ];
  }

  // Verify payment with backend
  static async verifyPayment(paymentId: string, subscriptionId?: string): Promise<boolean> {
    try {
      // This would call your Google Apps Script function to verify the payment
      // google.script.run.verifyPayment(paymentId, subscriptionId);
      
      console.log('Verifying payment:', { paymentId, subscriptionId });
      
      // Simulate verification
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
