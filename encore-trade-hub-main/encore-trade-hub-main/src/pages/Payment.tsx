import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get query parameters
    const queryParams = new URLSearchParams(location.search);
    const plan = queryParams.get('plan');
    const email = queryParams.get('email');
    
    if (!plan || !email) {
      toast({
        title: 'Error',
        description: 'Missing required payment information. Please try again.',
        variant: 'destructive'
      });
      navigate('/signup');
      return;
    }
    
    // Redirect to direct-payment with the same query parameters
    navigate(`/direct-payment${location.search}`);
  }, [location.search, navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting to payment page...</h2>
        <p>Please wait while we redirect you to the payment page.</p>
      </div>
    </div>
  );
}
