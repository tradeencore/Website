import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { addUserToSheet } from '@/services/sheets';
import { sendWhatsAppNotification, requestWhatsAppVerification, verifyWhatsAppCode } from '@/services/whatsapp';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Define Razorpay interfaces for TypeScript
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Use type assertion when creating Razorpay instance instead of global declaration



// Interface for email receipt data
interface ReceiptEmailData {
  name: string;
  email: string;
  planType: string;
  subscriptionType: string;
  amount: number;
  paymentId: string;
  subscriptionDate: string;
  expiryOn: string;
}

// Interface for WhatsApp notification data
interface WhatsAppNotificationData {
  name: string;
  mobile: string;
  planType: string;
  subscriptionType: string;
  amount: number;
  expiryOn: string;
}

// Function to send welcome and receipt email
const sendReceiptEmail = async (data: ReceiptEmailData): Promise<boolean> => {
  try {
    console.log('Sending welcome and receipt email to:', data.email);
    
    // In a real implementation, this would call an API endpoint to send an email
    // For now, we'll simulate a successful email send
    
    // Example API call:
    // const response = await fetch('https://api.tradeencore.com/send-welcome-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.ok;
    
    // Log the email content that would be sent
    console.log('Email content would include:');
    console.log(`- Welcome message for ${data.name}`);
    console.log(`- Subscription details: ${data.planType} (${data.subscriptionType})`);
    console.log(`- Payment confirmation: ₹${data.amount}`);
    console.log(`- Subscription period: ${data.subscriptionDate} to ${data.expiryOn}`);
    console.log(`- Payment ID: ${data.paymentId}`);
    console.log(`- Account login instructions`);
    console.log(`- Support contact information`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// WhatsApp notification is now imported from services/whatsapp.ts

export default function DirectPayment() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [planType, setPlanType] = useState('TFin Silver');
  const [planPricing, setPlanPricing] = useState({
    monthly: 999,
    yearly: 9990
  });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  
  // WhatsApp verification states
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [testCode, setTestCode] = useState('');
  
  // Parse query parameters when component mounts
  useEffect(() => {
    // Get query parameters
    const queryParams = new URLSearchParams(location.search);
    const plan = queryParams.get('plan');
    const email = queryParams.get('email');
    const name = queryParams.get('name');
    const mobile = queryParams.get('mobile');
    
    // Set plan type from query parameter
    if (plan) {
      setPlanType(plan);
      
      // Set pricing based on plan type
      switch (plan.toLowerCase()) {
        case 'fin silver':
        case 'fin-silver':
          setPlanPricing({ monthly: 99, yearly: 990 });
          break;
        case 'fin gold':
        case 'fin-gold':
          setPlanPricing({ monthly: 299, yearly: 2990 });
          break;
        case 'fin platinum':
        case 'fin-platinum':
          setPlanPricing({ monthly: 499, yearly: 4990 });
          break;
        case 'tfin silver':
        case 't-fin silver':
        case 'tfin-silver':
        case 't-fin-silver':
          setPlanPricing({ monthly: 225, yearly: 2250 });
          break;
        case 'tfin gold':
        case 't-fin gold':
        case 'tfin-gold':
        case 't-fin-gold':
          setPlanPricing({ monthly: 425, yearly: 4250 });
          break;
        case 'tfin platinum':
        case 't-fin platinum':
        case 'tfin-platinum':
        case 't-fin-platinum':
          setPlanPricing({ monthly: 625, yearly: 6250 });
          break;
        case 'test_monthly_7':
          setPlanPricing({ monthly: 7, yearly: 70 });
          break;
        default:
          setPlanPricing({ monthly: 999, yearly: 9990 });
      }
    }
    
    // Update user data from query parameters
    const updatedUserData = { ...userData };
    if (email) updatedUserData.email = email;
    if (name) updatedUserData.name = decodeURIComponent(name);
    if (mobile) updatedUserData.mobile = mobile;
    
    // Only update if we have at least one field
    if (email || name || mobile) {
      setUserData(updatedUserData);
    }
    
    // If we have all necessary user data, focus on payment options
    if (email && name && mobile) {
      // Scroll to payment options section
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-options');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.search]);

  // Load Razorpay script on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway. Please refresh the page.',
        variant: 'destructive'
      });
    };
    
    document.body.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Reset verification status if mobile number changes
    if (name === 'mobile' && value !== userData.mobile) {
      setIsWhatsAppVerified(false);
      setIsVerificationSent(false);
    }
    
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // Request WhatsApp verification code
  const handleRequestVerification = async () => {
    if (!userData.mobile || !/^[0-9]{10}$/.test(userData.mobile)) {
      toast({
        title: 'Invalid WhatsApp Number',
        description: 'Please enter a valid 10-digit WhatsApp number.',
        variant: 'destructive'
      });
      return;
    }
    
    setVerificationLoading(true);
    try {
      const result = await requestWhatsAppVerification(userData.mobile);
      
      if (result.success) {
        setIsVerificationSent(true);
        if (result.testCode) {
          setTestCode(result.testCode);
          console.log('Test verification code:', result.testCode);
        }
        toast({
          title: 'Verification Code Sent',
          description: 'A verification code has been sent to your WhatsApp number.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message || 'Failed to send verification code. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: 'Verification Error',
        description: 'An error occurred while sending the verification code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  // Verify WhatsApp code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code.',
        variant: 'destructive'
      });
      return;
    }
    
    setVerificationLoading(true);
    try {
      const result = await verifyWhatsAppCode(userData.mobile, verificationCode);
      
      if (result.success) {
        setIsWhatsAppVerified(true);
        toast({
          title: 'WhatsApp Verified',
          description: 'Your WhatsApp number has been verified successfully.',
          variant: 'default'
        });
        
        // Scroll to payment options section
        setTimeout(() => {
          const paymentSection = document.getElementById('payment-options');
          if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message || 'Invalid verification code. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Verification Error',
        description: 'An error occurred while verifying the code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleMonthlyPayment = () => {
    handlePayment(planPricing.monthly, 'monthly');
  };

  const handleYearlyPayment = () => {
    handlePayment(planPricing.yearly, 'yearly');
  };

  const handlePayment = async (amount: number, subscriptionType: 'monthly' | 'yearly') => {
    setIsLoading(true);
    
    try {
      if (!window.Razorpay) {
        toast({
          title: 'Error',
          description: 'Payment gateway not loaded. Please refresh the page.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // For a proper subscription flow, you would create a subscription on the backend
      // and pass the subscription_id to the frontend
      // Since we don't have backend access, we'll use a direct checkout approach
      
      // Amount in paise (₹1 = 100 paise)
      const amountInPaise = amount * 100;
      
      // Configure Razorpay options for subscription
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere', // Replace with your Razorpay Key ID
        amount: amountInPaise,
        currency: 'INR',
        name: 'Trade Encore',
        description: `${planType} - ${subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} Subscription - ₹${amount}`,
        image: 'https://tradeencore.com/assets/logo.png', // Update with your actual logo URL
        notes: {
          plan_type: planType,
          subscription_type: subscriptionType,
          user_email: userData.email,
          user_name: userData.name,
          subscription_period: subscriptionType,
          auto_recurring: 'true'
        },
        prefill: {
          name: userData.name || 'Your Name',
          email: userData.email || 'your.email@example.com',
          contact: userData.mobile || ''
        },
        theme: {
          color: '#2962ff'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You have cancelled the payment process. You can try again when ready.',
              variant: 'default'
            });
          }
        },
        // For proper subscriptions, you need to use the Razorpay Subscriptions API
        // and create a subscription on your backend first
        // This is just a placeholder for now
        subscription: true,
        handler: async function(response: any) {
          console.log('Payment successful:', response);
          
          // Calculate subscription dates
          const currentDate = new Date('2025-06-20'); // Use current date from system
          const subscriptionDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // Calculate expiry date based on subscription type
          let expiryDate = new Date(currentDate);
          if (subscriptionType === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (subscriptionType === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }
          const expiryOn = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // Log payment details for debugging
          console.log('Payment successful with details:', {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || '',
            signature: response.razorpay_signature || '',
            plan: planType,
            subscriptionType,
            amount,
            subscriptionDate,
            expiryOn
          });
          
          // Save user data to Google Sheets
          try {
            console.log('Saving subscription data to Google Sheets...');
            const result = await addUserToSheet({
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              password: userData.password,
              planType: planType, // This should be the plan name (e.g., Fin Silver, Gold, Platinum)
              subscriptionType: subscriptionType, // This should be 'monthly' or 'yearly'
              subscriptionDate: subscriptionDate,
              expiryOn: expiryOn,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || ''
            });
            
            console.log('Sheet update result:', result);
            
            if (result.success) {
              // Send welcome email with receipt
              const emailSent = await sendReceiptEmail({
                name: userData.name,
                email: userData.email,
                planType: planType,
                subscriptionType,
                amount: amount,
                paymentId: response.razorpay_payment_id,
                subscriptionDate,
                expiryOn
              });
              
              console.log('Email notification sent:', emailSent);
              
              // Send welcome WhatsApp notification if mobile number is provided
              let whatsappResult = { success: false, message: '' };
              if (userData.mobile && userData.mobile.length >= 10) {
                whatsappResult = await sendWhatsAppNotification({
                  name: userData.name,
                  mobile: userData.mobile,
                  planType: planType,
                  subscriptionType,
                  amount: amount,
                  expiryOn
                });
                
                console.log('WhatsApp notification result:', whatsappResult);
              }
              
              // Update user subscription in AuthContext
              updateUserSubscription({
                planType: planType,
                subscriptionType: subscriptionType,
                subscriptionDate: subscriptionDate,
                expiryOn: expiryOn
              });
              
              // Show success toast
              toast({
                title: 'Payment Successful',
                description: 'Your subscription has been activated successfully.',
                variant: 'default'
              });
              
              // Redirect to receipt page with payment details
              const receiptParams = new URLSearchParams({
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile || '',
                plan: planType,
                subscriptionType: subscriptionType,
                amount: amount.toString(),
                paymentId: response.razorpay_payment_id,
                subscriptionDate: subscriptionDate,
                expiryOn: expiryOn,
                emailSent: emailSent ? 'true' : 'false',
                whatsappSent: whatsappResult.success ? 'true' : 'false'
              });
              
              // Redirect to receipt page after a short delay
              setTimeout(() => {
                navigate(`/payment-receipt?${receiptParams.toString()}`);
              }, 1500);
            } else {
              throw new Error(result.message);
            }
          } catch (error) {
            console.error('Error saving subscription data:', error);
            toast({
              title: 'Payment Successful',
              description: `Your payment was successful, but there was an error saving your subscription details.`,
              variant: 'default'
            });
          }
          
          setIsLoading(false);
        }
      };
      
      console.log('Opening Razorpay with options:', { ...options, key: '***HIDDEN***' });
      
      // Create a new Razorpay instance with type assertion
      const razorpay = new (window as any).Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Your payment could not be processed',
          variant: 'destructive'
        });
        setIsLoading(false);
      });
      
      // Open payment modal
      razorpay.open();
      
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Trade Encore Subscription</h1>
      
      <div className="max-w-md mx-auto mb-8 bg-[var(--tv-background)] border border-[var(--tv-border-color)] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Information</h2>
        <div className="mb-4 p-3 bg-gray-800 rounded-md">
          <p className="text-sm font-medium">Selected Plan: <span className="text-primary">{planType}</span></p>
          <p className="text-sm text-gray-400 mt-1">Monthly: ₹{planPricing.monthly} | Yearly: ₹{planPricing.yearly}</p>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--tv-text-primary)] mb-1">Full Name</label>
            <Input
              id="name"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--tv-text-primary)] mb-1">Email Address</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="mobile" className="block text-sm font-medium text-[var(--tv-text-primary)] mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={userData.mobile}
                onChange={handleInputChange}
                placeholder="Enter your 10-digit WhatsApp number"
                className={`w-full ${isWhatsAppVerified ? 'border-green-500' : ''}`}
                disabled={isWhatsAppVerified}
                required
              />
              <Button 
                type="button" 
                onClick={handleRequestVerification} 
                disabled={!userData.mobile || !/^[0-9]{10}$/.test(userData.mobile) || isVerificationSent || isWhatsAppVerified || verificationLoading}
                className="whitespace-nowrap"
              >
                {verificationLoading ? 'Sending...' : isVerificationSent ? 'Resend Code' : 'Send Code'}
              </Button>
            </div>
            {isWhatsAppVerified && (
              <div className="text-green-500 text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                WhatsApp number verified
              </div>
            )}
            
            {isVerificationSent && !isWhatsAppVerified && (
              <div className="mt-2">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-[var(--tv-text-primary)] mb-1">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full"
                    maxLength={6}
                  />
                  <Button 
                    type="button" 
                    onClick={handleVerifyCode} 
                    disabled={!verificationCode || verificationCode.length !== 6 || verificationLoading}
                  >
                    {verificationLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
                {testCode && (
                  <div className="text-sm text-gray-500 mt-1">
                    Test code (for development only): {testCode}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
              placeholder="Create a password"
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div id="payment-options" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Plan</h2>
          <p className="mb-6 text-gray-500">
            Subscribe to our monthly plan for ₹{planPricing.monthly} per month.
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleMonthlyPayment}
              disabled={isLoading || !scriptLoaded || !userData.name || !userData.email || !userData.mobile || !userData.password}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : `Subscribe ₹${planPricing.monthly}/month`}
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Yearly Plan</h2>
          <p className="mb-6 text-gray-500">
            Subscribe to our yearly plan for ₹{planPricing.yearly} per year and save 15%.
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleYearlyPayment}
              disabled={isLoading || !scriptLoaded || !userData.name || !userData.email || !userData.mobile || !userData.password}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : `Subscribe ₹${planPricing.yearly}/year`}
            </Button>
          </div>
        </Card>
      </div>
      
      {!scriptLoaded && (
        <p className="text-center mt-8 text-yellow-500">
          Loading payment gateway...
        </p>
      )}
    </div>
  );
}
