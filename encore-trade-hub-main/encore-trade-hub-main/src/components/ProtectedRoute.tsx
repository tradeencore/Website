import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requireSubscription?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ 
  requireSubscription = true,
  adminOnly = false 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isSubscriptionActive, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check subscription status if required
  if (requireSubscription && user?.role !== 'admin') {
    const hasActiveSubscription = isSubscriptionActive();
    
    if (!hasActiveSubscription) {
      // Redirect to subscription page if subscription is required but not active
      return <Navigate to="/subscription" state={{ from: location }} replace />;
    }
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
