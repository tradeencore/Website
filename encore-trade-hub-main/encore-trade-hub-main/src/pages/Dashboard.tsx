import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  TrendingUp, 
  FileText, 
  BarChart, 
  User, 
  LogOut,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type SubscriptionBadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

interface RecommendationData {
  date: string;
  symbol: string;
  type: string;
  details: string;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isAuthenticated, isSubscriptionActive } = useAuth();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    navigate('/login');
  };

  const fetchData = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch subscription data
      if (user?.id) {
        const subData = await subscriptionService.getActiveSubscription(user.id);
        setSubscription(subData);

        // Calculate days left
        if (subData?.endDate) {
          const end = new Date(subData.endDate);
          const now = new Date();
          const diffTime = end.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays);
        }
      }

      // Fetch recommendations from Google Sheet
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getRecommendations'
        })
      });

      const data = await response.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, isAuthenticated, user, toast]);

  const renderSubscriptionStatus = () => {
    if (!subscription) {
      return (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              No Active Subscription
            </CardTitle>
            <CardDescription>
              You don't have an active subscription. Subscribe now to access all features.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/subscription">
                View Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }

    const isActive = isSubscriptionActive();
    const isExpiringSoon = daysLeft !== null && daysLeft <= 7;
    
    return (
      <Card className={`mb-6 ${
        isActive 
          ? isExpiringSoon 
            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' 
            : 'border-green-200 bg-green-50 dark:bg-green-900/20'
          : 'border-red-200 bg-red-50 dark:bg-red-900/20'
      }`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center">
                {isActive ? (
                  isExpiringSoon ? (
                    <Clock className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  )
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                )}
                {isActive ? 'Active Subscription' : 'Subscription Expired'}
              </CardTitle>
              <CardDescription className="mt-1">
                {isActive 
                  ? isExpiringSoon
                    ? `Your subscription will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
                    : `Next billing date: ${new Date(subscription.endDate).toLocaleDateString()}`
                  : 'Your subscription has expired. Renew now to continue accessing premium features.'
                }
              </CardDescription>
            </div>
            <Badge variant={(isActive ? (isExpiringSoon ? 'default' : 'success') : 'destructive') as SubscriptionBadgeVariant}>
              {isActive ? (isExpiringSoon ? 'Expiring Soon' : 'Active') : 'Expired'}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {subscription.planId.includes('monthly') ? 'Monthly Plan' : 'Yearly Plan'}
          </div>
          <Button asChild variant={isExpiringSoon ? 'default' : 'outline'}>
            <Link to="/subscription">
              {isExpiringSoon ? 'Renew Now' : 'Manage Subscription'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Hi {user?.name || 'there'},</h1>
          <p className="text-xl text-[var(--tv-text-secondary)]">
            Thank you for being our valued <span className="italic">member</span>
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text inline-block">
            OUR PREMIUM SERVICES
          </h2>
          <p className="text-xl mt-4">
            You can now access our best risk-assessed recommendations
          </p>
        </div>

        {/* User Actions */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          {subscription && (
            <Badge variant="outline" className="ml-2">
              {isSubscriptionActive() ? 'Active' : 'Expired'}
            </Badge>
          )}
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4">
                <FileText className="w-full h-full text-blue-500" />
              </div>
              <CardTitle>Daily Market Outlook</CardTitle>
              <CardDescription>
                Daily snapshot of market trends, indicators, and potential market-moving events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4">
                <TrendingUp className="w-full h-full text-purple-500" />
              </div>
              <CardTitle>Long Term Recommendations</CardTitle>
              <CardDescription>
                Strategic investment advice for horizons exceeding three years
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4">
                <BarChart className="w-full h-full text-green-500" />
              </div>
              <CardTitle>Positional Recommendations</CardTitle>
              <CardDescription>
                Short-term trading opportunities with detailed entry and exit points
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4">
                <TrendingUp className="w-full h-full text-red-500" />
              </div>
              <CardTitle>Derivative Recommendations</CardTitle>
              <CardDescription>
                Strategic guidance for trading derivatives and managing risk
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Subscription Status */}
        {renderSubscriptionStatus()}

        {/* Latest Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Recommendations</CardTitle>
            <CardDescription>Recent market recommendations and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Symbol</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{rec.date}</td>
                      <td className="py-2 px-4 font-medium">{rec.symbol}</td>
                      <td className="py-2 px-4">{rec.type}</td>
                      <td className="py-2 px-4">{rec.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <div className="pt-4">
          <Button asChild>
            <Link to="/subscription">
              {subscription ? 'Manage Subscription' : 'Get Subscription'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
