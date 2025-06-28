import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { subscriptionService } from '@/services/subscription';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import SignupForm from './SignupForm';
import { addUserToSheet } from '@/services/sheets';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanDetailProps {
  title: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  popular?: boolean;
}

const PlanDetail = ({
  title,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  benefits,
  popular
}: PlanDetailProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Function to dynamically load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        // Resolve anyway to continue the flow
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (period: 'monthly' | 'yearly', userData?: any) => {
    setIsProcessing(true);
    try {
      console.log('Starting payment process for', period, 'subscription');
      console.log('User data:', userData);
      
      // Directly create payment options without order_id for direct checkout
      // This is a simpler approach that doesn't require backend API
      const amount = period === 'monthly' ? parseInt(monthlyPrice) * 100 : parseInt(yearlyPrice) * 100;
      console.log('Payment amount:', amount / 100, 'INR');
      
      // Create a simple options object for Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: amount,
        currency: 'INR',
        name: 'Trade Encore',
        description: `${title} - ${period} subscription`,
        // No order_id needed for direct checkout
        handler: async (paymentResponse: any) => {
          console.log('Payment successful:', paymentResponse);
          
          // Save user data to Google Sheet
          if (userData) {
            console.log('Saving user data to sheet:', userData);
            const subscriptionDate = new Date();
            const expiryDate = new Date();
            if (period === 'monthly') {
              expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }

            try {
              await addUserToSheet({
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                planType: title,
                subscriptionType: period,
                subscriptionDate: subscriptionDate.toISOString(),
                expiryOn: expiryDate.toISOString(),
                paymentId: paymentResponse.razorpay_payment_id
              });
              console.log('User data saved to sheet successfully');
            } catch (sheetError) {
              console.error('Error saving to sheet:', sheetError);
              // Continue anyway since payment was successful
            }
          }

          toast({
            title: 'Payment Successful',
            description: 'Your subscription has been activated!',
            variant: 'default'
          });

          // Navigate to dashboard
          navigate('/dashboard');
        },
        prefill: userData ? {
          name: userData.name,
          email: userData.email,
          contact: userData.mobile
        } : undefined,
        theme: {
          color: '#2962ff'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
          }
        }
      };

      console.log('Opening Razorpay with options:', { ...options, key: '***HIDDEN***' });
      
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        try {
          // Create Razorpay instance
          const razorpay = new window.Razorpay(options);
          
          // Handle payment failure
          razorpay.on('payment.failed', function(response: any) {
            console.error('Payment failed:', response.error);
            toast({
              title: 'Payment Failed',
              description: response.error.description || 'Your payment could not be processed',
              variant: 'destructive'
            });
            setIsProcessing(false);
          });
          
          // Open Razorpay checkout
          razorpay.open();
        } catch (error) {
          console.error('Error initializing Razorpay:', error);
          toast({
            title: 'Error',
            description: 'Failed to initialize payment gateway. Please try again.',
            variant: 'destructive'
          });
          setIsProcessing(false);
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please try again.',
          variant: 'destructive'
        });
        setIsProcessing(false);
      };
      
      document.body.appendChild(script);
    } catch (err) {
      console.error('Payment processing error:', err);
      toast({
        title: 'Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignupSuccess = async (data: any) => {
    setUserData(data);
    setShowSignup(false);
    await handlePayment(billingPeriod, data);
  };

  const handleSubscription = async (period: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to subscribe to this plan',
        variant: 'destructive',
      });
      setShowSignup(true);
      return;
    }

    await handlePayment(period);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="sm:max-w-md">
          <SignupForm
            onSuccess={handleSignupSuccess}
            planType={title}
            subscriptionType={billingPeriod}
          />
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2962ff] mb-4 font-heading">{title}</h1>
        <p className="text-xl text-[var(--tv-text-secondary)]">{description}</p>
      </div>

      {/* Pricing Section */}
      <Card className="max-w-2xl mx-auto mb-12 p-8 border-2 border-[#1a237e] relative">
        {popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#1a237e] text-white px-6 py-1 rounded-full text-sm font-semibold">
              MOST POPULAR
            </span>
          </div>
        )}
        
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[var(--tv-background-light)]">
            <TabsTrigger 
              value="monthly"
              className="text-[var(--tv-text-primary)] data-[state=active]:text-[#2962ff]"
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly Billing
            </TabsTrigger>
            <TabsTrigger 
              value="yearly"
              className="text-[var(--tv-text-primary)] data-[state=active]:text-[#2962ff]"
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly Billing
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                Save 15%
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="text-center mb-8">
            <div className="space-y-4">
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold">₹{monthlyPrice}</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-gray-600">Flexible monthly billing</p>
              <Button
                className="w-full bg-[#1a237e] text-white hover:bg-[#1a237e]/90"
                onClick={() => handleSubscription('monthly')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Subscribe Monthly'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="yearly" className="text-center mb-8">
            <div className="space-y-4">
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold">₹{yearlyPrice}</span>
                <span className="text-gray-500 ml-2">/year</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Annual billing with 2 months free</p>
                <p className="text-sm font-medium text-green-600">
                  Save ₹{parseInt(monthlyPrice) * 2} annually
                </p>
              </div>
              <Button
                className="w-full bg-[#1a237e] text-white hover:bg-[#1a237e]/90"
                onClick={() => handleSubscription('yearly')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Subscribe Yearly'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-[var(--tv-text-primary)] leading-snug">
              <span className="mr-2 text-xl leading-none mt-1">{feature.split(' ')[0]}</span>
              <span>{feature.split(' ').slice(1).join(' ')}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {benefits.map((benefit, index) => (
          <Card key={index} className="p-6 border border-[var(--tv-border-color)] hover:border-[#2962ff] transition-all duration-200 bg-[var(--tv-background)]">
            <div className="text-4xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-bold text-[var(--tv-text-primary)] mb-2">{benefit.title}</h3>
            <p className="text-[var(--tv-text-secondary)]">{benefit.description}</p>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2962ff] mb-4 font-heading">Have Questions?</h2>
        <p className="text-[var(--tv-text-secondary)] mb-6">Our team is here to help you make the right choice</p>
        <Button 
          variant="outline"
          className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white"
          onClick={() => navigate('/contact')}
        >
          Contact Us
        </Button>
      </div>
    </div>
  );
};

export default PlanDetail;
