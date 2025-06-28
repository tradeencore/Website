import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TestPayment() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay script when component mounts
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    setIsLoading(true);
    
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

      // Create a mock order ID
      const orderId = 'order_' + Date.now();
      
      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: 99900, // ₹999 in paise
        currency: 'INR',
        name: 'Trade Encore',
        description: 'Test Payment',
        order_id: orderId,
        handler: function(response: any) {
          console.log('Payment successful:', response);
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
            variant: "default"
          });
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
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
      console.error('Error initializing payment:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Payment Page</h1>
      
      <Card className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Test Razorpay Integration</h2>
        <p className="mb-6 text-gray-500">
          Click the button below to test a Razorpay payment of ₹999.
        </p>
        
        <div className="flex justify-center">
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Processing...' : 'Pay ₹999'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
