import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TestPlan() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Load Razorpay script when component mounts
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initiatePayment = async () => {
    setIsLoading(true);
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign up or log in before subscribing to a plan.",
        variant: "default"
      });
      setIsLoading(false);
      // Store plan selection in localStorage and redirect to signup
      localStorage.setItem('selectedPlan', 'test');
      localStorage.setItem('planAmount', '7');
      navigate('/signup');
      return;
    }
    
    try {
      // Call the backend to initiate payment
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiatePayment',
          email: user.email,
          amount: 7, // ₹7 payment
          currency: 'INR',
          planType: 'test'
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
      // Process the payment with Razorpay
      processPayment(data.data.orderId, data.data.amount);
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment Initiation Failed",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const processPayment = (orderId: string, amount: number) => {
    try {
      if (!window.Razorpay) {
        toast({
          title: "Error",
          description: "Payment gateway not loaded. Please refresh the page.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: amount, // Amount in paise from backend
        currency: 'INR',
        name: 'Trade Encore',
        description: 'Test Plan Subscription',
        order_id: orderId,
        handler: async function(response: any) {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'verifyPayment',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Payment Successful",
                description: "Your test plan subscription has been activated.",
                variant: "default"
              });
              
              // Redirect to dashboard or receipt page
              navigate('/dashboard');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Verification Failed",
              description: "Your payment was processed but verification failed. Please contact support.",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#2962ff'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsLoading(false);
          }
        }
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      
      // Register payment failed handler
      razorpay.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Your payment could not be processed",
          variant: "destructive"
        });
        setIsLoading(false);
      });
      
      // Open Razorpay checkout
      razorpay.open();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Plan - ₹7 Only</h1>
      
      <Card className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Test Plan Features</h2>
        <ul className="mb-6 space-y-2 list-disc pl-5">
          <li>7-day access to Trade Encore platform</li>
          <li>Basic trading insights</li>
          <li>Limited market analysis</li>
          <li>Perfect for new users to try our services</li>
        </ul>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <span className="text-3xl font-bold">₹7</span>
            <span className="text-gray-500 ml-1">one-time payment</span>
          </div>
          
          <Button 
            onClick={initiatePayment}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
          
          {!isAuthenticated && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>You'll need to sign up or log in to complete your subscription.</p>
              <div className="flex justify-center gap-4 mt-2">
                <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
                <Link to="/login" className="text-blue-600 hover:underline">Log In</Link>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-8 text-center text-gray-600">
        <h3 className="font-medium mb-2">How it works:</h3>
        <ol className="inline-flex flex-col md:flex-row gap-2 md:gap-8 justify-center items-center">
          <li className="flex items-center">1. Select plan <span className="mx-2 hidden md:inline">→</span></li>
          <li className="flex items-center">2. Sign up <span className="mx-2 hidden md:inline">→</span></li>
          <li className="flex items-center">3. Make payment <span className="mx-2 hidden md:inline">→</span></li>
          <li className="flex items-center">4. Access dashboard</li>
        </ol>
      </div>
    </div>
  );
}
