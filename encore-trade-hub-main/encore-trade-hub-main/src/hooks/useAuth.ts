import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUserToSheet, verifyUserCredentials } from '@/services/sheets';

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role?: 'user' | 'admin';
  subscription?: {
    planType: string;
    subscriptionType: string;
    subscriptionDate: string;
    expiryOn: string;
  };
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  loginType: 'google';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      setLoading(true);
      
      // Check for admin login
      if (email === 'trademaster@tradeencore.com' && password === 'admin') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Trade Master',
          email: 'trademaster@tradeencore.com',
          role: 'admin',
          subscription: {
            planType: 'premium',
            subscriptionType: 'lifetime',
            subscriptionDate: new Date().toISOString().split('T')[0],
            expiryOn: '2099-12-31',
          },
        };
        
        const token = 'admin-token-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true };
      }
      
      // Regular user login
      const result = await verifyUserCredentials(email, password);
      
      if (result.success && result.userData) {
        const userData = result.userData;
        const subscriptionData = userData.subscription || {};
        
        const user: User = {
          id: `user-${Date.now()}`,
          name: userData.name || email.split('@')[0],
          email: email,
          role: 'user',
          subscription: {
            planType: (subscriptionData as any)?.planType || 'free',
            subscriptionType: (subscriptionData as any)?.subscriptionType || 'trial',
            subscriptionDate: (subscriptionData as any)?.subscriptionDate || new Date().toISOString().split('T')[0],
            expiryOn: (subscriptionData as any)?.expiryOn || '2099-12-31'
          }
        };
        
        const token = 'user-token-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        setUser(user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.message || 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An error occurred during login. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleUserData: GoogleUser): Promise<{success: boolean; error?: string}> => {
    try {
      setLoading(true);
      
      // Create user object from Google data
      const googleUser: User = {
        id: googleUserData.id || 'google-' + Math.random().toString(36).substring(2, 11),
        name: googleUserData.name,
        email: googleUserData.email,
        photoUrl: googleUserData.photoUrl,
        role: 'user',
        subscription: {
          planType: 'free',
          subscriptionType: 'trial',
          subscriptionDate: new Date().toISOString().split('T')[0],
          expiryOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7-day trial
        }
      };
      
      // Generate a token
      const token = 'google-token-' + Math.random().toString(36).substring(2, 15);
      
      // Save user data to Google Sheets
      await addUserToSheet({
        name: googleUser.name,
        email: googleUser.email,
        password: 'oauth-login', // No password for OAuth users
        mobile: '',
        planType: 'free',
        subscriptionType: 'trial',
        subscriptionDate: new Date().toISOString().split('T')[0],
        expiryOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7-day trial
        loginType: 'google'
      });
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(googleUser));
      setUser(googleUser);
      
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tradeEncoreToken');
    localStorage.removeItem('tradeEncoreUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token');
  };
  
  const isSubscriptionActive = (): boolean => {
    if (!user) return false;
    
    // Admin always has access
    if (user.role === 'admin') return true;
    
    // Check subscription for regular users
    if (!user.subscription?.expiryOn) return false;
    
    try {
      // Check if subscription is expired
      const expiryDate = new Date(user.subscription.expiryOn);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      
      return expiryDate >= today;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    loginWithGoogle,
    isAuthenticated,
    isSubscriptionActive,
  };
};

export default useAuth;
