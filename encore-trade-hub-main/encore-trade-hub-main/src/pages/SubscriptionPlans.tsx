import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService, SubscriptionPlan, SubscriptionResponse } from '@/services/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isSubscriptionActive } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [plansData, subscription] = await Promise.all([
          subscriptionService.getPlans(),
          user ? subscriptionService.getActiveSubscription(user.id) : Promise.resolve(null)
        ]);
        
        setPlans(plansData);
        setActiveSubscription(subscription);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription plans. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, isAuthenticated, toast]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      setSubscribing(planId);
      
      // In test mode, we'll simulate a successful subscription
      const subscription = await subscriptionService.createSubscription({
        planId,
        paymentMethod: 'test',
        userEmail: user.email,
        userId: user.id
      });

      setActiveSubscription(subscription);
      
      toast({
        title: 'Subscription Successful!',
        description: 'Your subscription has been activated successfully.',
      });
      
      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: error instanceof Error ? error.message : 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (price: number) => {
    // Convert paise to rupees
    const rupees = price / 100;
    return `₹${rupees.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>
        
        {activeSubscription && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">
                You are currently on the <span className="font-bold">
                  {plans.find(p => p.id === activeSubscription.planId)?.name || 'Active Plan'}
                </span> (expires {new Date(activeSubscription.endDate).toLocaleDateString()})
              </span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = activeSubscription?.planId === plan.id;
            const isSubscribing = subscribing === plan.id;
            
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${
                isCurrentPlan ? 'ring-2 ring-primary' : ''
              }`}>
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Current Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help choosing a plan? <a href="#" className="text-primary hover:underline">Contact support</a></p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs">
              <p className="font-medium">Development Mode</p>
              <p className="mt-1">Test payments are simulated. No real money will be charged.</p>
              <p>Use test card: <code className="bg-muted px-1.5 py-0.5 rounded">4111 1111 1111 1111</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
