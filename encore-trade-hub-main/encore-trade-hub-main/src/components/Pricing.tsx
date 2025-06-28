
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₹2,999',
      period: '/month',
      description: 'Perfect for individual investors',
      badge: null,
      features: [
        'Daily Market Outlook',
        'Basic Research Reports',
        'Email Support',
        'Mobile App Access',
        'Risk Disclaimers'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹4,999',
      period: '/month',
      description: 'Most popular for active traders',
      badge: 'Most Popular',
      features: [
        'All Basic Features',
        'Long Term Recommendations',
        'Positional Trading Calls',
        'Technical Analysis Reports',
        'WhatsApp Support',
        'Priority Customer Service'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹7,999',
      period: '/month',
      description: 'Complete research suite',
      badge: 'Best Value',
      features: [
        'All Premium Features',
        'Derivative Strategies',
        'Mutual Fund Advisory',
        'One-on-One Consultation',
        'Custom Portfolio Review',
        'Advanced Analytics',
        'Dedicated Relationship Manager'
      ]
    }
  ];

  const initiatePayment = async (planId: string, planName: string, price: string) => {
    setIsLoading(planId);
    
    try {
      // In a real implementation, you would call your Google Apps Script function
      // to create a Razorpay subscription and get the subscription ID
      
      // Simulated delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayCheckout(planId, planName, price);
        document.head.appendChild(script);
      } else {
        openRazorpayCheckout(planId, planName, price);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const openRazorpayCheckout = (planId: string, planName: string, price: string) => {
    const options = {
      key: "rzp_text-[var(--tv-text-[var(--tv-button-primary)])]4567890", // This would be retrieved from your Google Apps Script
      subscription_id: `sub_${planId}_${Date.now()}`, // This would come from your backend
      name: "Trade Encore",
      description: `${planName} Subscription Plan`,
      image: "/lovable-uploads/trade-encore-logo.png", // This would be the base64 logo from Google Apps Script
      handler: function (response: any) {
        console.log('Payment success:', response);
        // Call Google Apps Script function to verify payment
        // google.script.run.verifyPayment(response.razorpay_payment_id, response.razorpay_subscription_id);
        
        toast({
          title: "Payment Successful!",
          description: "Welcome to Trade Encore! You can now access your dashboard.",
        });
        
        // Redirect to dashboard or login
        window.location.href = '/login';
      },
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      theme: {
        color: "[var(--tv-button-primary)]" // Trade Encore's navy blue
      },
      modal: {
        ondismiss: function() {
          setIsLoading(null);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <section id="pricing" className="py-20 bg-[var(--tv-button-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--tv-text-primary)] mb-4">
            Choose Your Research Plan
          </h2>
          <p className="text-xl text-[var(--tv-text-secondary)] max-w-3xl mx-auto">
            Select the plan that best fits your investment needs. All plans include 
            SEBI compliant research and professional analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative hover:shadow-xl transition-shadow duration-300 ${
                plan.badge === 'Most Popular' ? 'border-[var(--tv-button-primary)] shadow-lg scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-[var(--tv-button-primary)] text-[var(--tv-text-secondary)]">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="py-4">
                  <span className="text-4xl font-bold text-[var(--tv-text-secondary)]imary">{plan.price}</span>
                  <span className="text-[var(--tv-text-secondary)]">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-[var(--tv-text-secondary)]imary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-6" 
                  variant={plan.badge === 'Most Popular' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => initiatePayment(plan.id, plan.name, plan.price)}
                  disabled={isLoading === plan.id}
                >
                  {isLoading === plan.id ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-[var(--tv-text-primary)] mb-4">
              Secure Payment with Razorpay
            </h3>
            <p className="text-[var(--tv-text-secondary)] mb-4">
              All payments are processed securely through Razorpay. We accept all major 
              credit/debit cards, UPI, net banking, and digital wallets.
            </p>
            <div className="text-sm text-[var(--tv-text-secondary)]">
              <p>• 7-day money-back guarantee</p>
              <p>• Cancel anytime</p>
              <p>• 24/7 customer support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
