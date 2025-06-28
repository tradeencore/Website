import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyUserCredentials, appendToSheet } from '../services/sheets';

// Define user types
export type UserRole = 'user' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  photoUrl?: string;
  mobile?: string; // Added WhatsApp number
  role?: UserRole;
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
  mobile: string; // Added WhatsApp number
  loginType: 'google';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  loginWithGoogle: (whatsappNumber: string, planType: string) => Promise<{success: boolean; user: User; error?: string}>;
  loginWithMicrosoft: () => Promise<{success: boolean; error?: string}>;
  isAuthenticated: () => boolean;
  isSubscriptionActive: () => boolean;
  isSubscriptionExpired: (expiryDate: string) => boolean;
  updateUserSubscription: (subscriptionData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

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

  // Check if the user's subscription is expired
  const isSubscriptionExpired = useCallback(() => {
    if (!user || !user.subscription || !user.subscription.expiryOn) return true;
    
    // Handle lifetime subscription
    if (user.subscription.subscriptionType === 'lifetime') return false;
    
    const today = new Date();
    const expiryDate = new Date(user.subscription.expiryOn);
    
    return today > expiryDate;
  }, [user]);

  // Check if user's subscription is active
  const isSubscriptionActive = useCallback(() => {
    if (!user) return false;
    
    // Admin always has access
    if (user.role === 'admin') return true;
    
    // Check subscription for regular users
    if (!user.subscription?.expiryOn) return false;
    
    return !isSubscriptionExpired();
  }, [user, isSubscriptionExpired]);

  const login = async (email: string, password: string) => {
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
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return { success: true };
      }
      
      // Regular user login
      interface UserData {
        name?: string;
        subscription?: {
          planType?: string;
          subscriptionType?: string;
          subscriptionDate?: string;
          expiryOn?: string;
        };
      }
      
      interface VerificationResult {
        success: boolean;
        userData?: UserData;
        message?: string;
      }
      
      const result: VerificationResult = await verifyUserCredentials(email, password);
      
      if (result.success) {
        const userData: UserData = result.userData || {};
        const subscriptionData = userData.subscription || {};
        
        // Check if subscription is expired
        const expiryDate = subscriptionData.expiryOn || 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const isExpired = isSubscriptionExpired();
        
        const user: User = {
          id: `user-${Date.now()}`,
          name: userData.name || email.split('@')[0],
          email: email,
          role: 'user',
          subscription: {
            planType: subscriptionData.planType || 'free',
            subscriptionType: subscriptionData.subscriptionType || 'trial',
            subscriptionDate: subscriptionData.subscriptionDate || new Date().toISOString().split('T')[0],
            expiryOn: expiryDate
          }
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { 
          success: true,
          isExpired
        };
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

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tradeEncoreToken');
    localStorage.removeItem('tradeEncoreUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    setUser(null);
  };

  const loginWithGoogle = useCallback(async (whatsappNumber: string, planType: string): Promise<{success: boolean; user: User; error?: string}> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, we would use the Google OAuth API
      // For now, we'll simulate a successful Google login response
      const name = "Google User";
      const email = "google.user@gmail.com";
      const photoUrl = "https://lh3.googleusercontent.com/a/default-user";
      
      // Check if user already exists in the system
      try {
        // Try to verify if this Google user already exists
        // We use a special password for OAuth users
        const verificationResult = await verifyUserCredentials(email, 'oauth-login');
        
        if (verificationResult.success && verificationResult.userData) {
          // User exists, use the data from Google Sheets
          const userData = {
            ...verificationResult.userData,
            id: `google-${Date.now()}` // Add an ID if not present
          };
          
          setUser(userData);
          
          // Generate a token
          const token = btoa(`${email}:${Date.now()}`);
          setToken(token);
          
          // Update the user data with WhatsApp number if it's not already set
          if (!('mobile' in userData) || userData.mobile !== whatsappNumber) {
            userData.mobile = whatsappNumber;
            
            // Update the user data in Google Sheets
            await appendToSheet({
              name: userData.name,
              email: userData.email,
              password: 'oauth-login',
              mobile: whatsappNumber,
              planType: userData.subscription?.planType || planType,
              subscriptionType: userData.subscription?.subscriptionType || '',
              loginType: 'google'
            });
          }
          
          // Store in localStorage
          localStorage.setItem('tradeEncore_user', JSON.stringify(userData));
          localStorage.setItem('tradeEncore_token', token);
          
          setLoading(false);
          return { success: true, user: userData };
        }
      } catch (verifyError) {
        console.error('Error verifying existing Google user:', verifyError);
        // Continue with new user creation if verification fails
      }
      
      // User doesn't exist, create a new one with trial subscription
      const newUser: User = {
        id: `google-${Date.now()}`,
        name,
        email,
        photoUrl,
        mobile: whatsappNumber, // Add WhatsApp number
        role: 'user',
        subscription: {
          planType: planType || 'free',
          subscriptionType: 'trial',
          subscriptionDate: new Date().toISOString().split('T')[0],
          expiryOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7-day trial
        }
      };
      
      // Generate a token
      const token = btoa(`${email}:${Date.now()}`);
      
      // Save user data to Google Sheets
      try {
        const sheetResponse = await appendToSheet({
          name,
          email,
          password: 'oauth-login', // Special marker for OAuth logins
          mobile: whatsappNumber, // Add WhatsApp number
          planType: planType || 'free',
          subscriptionType: 'trial',
          subscriptionDate: newUser.subscription.subscriptionDate,
          expiryOn: newUser.subscription.expiryOn
        });
        
        // If the sheet response includes an expiry date, use it
        if (sheetResponse && sheetResponse.data && sheetResponse.data.expiryOn) {
          newUser.subscription.expiryOn = sheetResponse.data.expiryOn;
        }
      } catch (sheetError) {
        console.error('Error saving to Google Sheets:', sheetError);
        // Continue with login even if sheet save fails
      }
      
      // Set user and token in state
      setUser(newUser);
      setToken(token);
      
      // Store in localStorage
      localStorage.setItem('tradeEncore_user', JSON.stringify(newUser));
      localStorage.setItem('tradeEncore_token', token);
      
      setLoading(false);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google');
      setLoading(false);
      return { success: false, user: {} as User, error: 'Failed to login with Google' };
    }
  }, []);

  const loginWithMicrosoft = async (): Promise<{success: boolean; error?: string}> => {
    try {
      setLoading(true);
      
      // Simulate Microsoft login (replace with actual Microsoft authentication)
      const microsoftUser: User = {
        id: 'microsoft-' + Math.random().toString(36).substring(2, 11),
        name: 'Microsoft User',
        email: 'user@example.com',
        photoUrl: '',
        role: 'user',
        subscription: {
          planType: 'free',
          subscriptionType: 'trial',
          subscriptionDate: new Date().toISOString().split('T')[0],
          expiryOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7-day trial
        }
      };
      
      // Generate a token
      const token = 'microsoft-token-' + Math.random().toString(36).substring(2, 15);
      
      // Save user data to Google Sheets
      await appendToSheet({
        name: microsoftUser.name,
        email: microsoftUser.email,
        password: 'oauth-login', // No password for OAuth users
        planType: 'free',
        subscriptionType: 'trial',
        subscriptionDate: microsoftUser.subscription.subscriptionDate,
        expiryOn: microsoftUser.subscription.expiryOn,
        loginType: 'microsoft'
      });
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(microsoftUser));
      setUser(microsoftUser);
      
      return { success: true };
    } catch (error) {
      console.error('Microsoft login error:', error);
      return { success: false, error: 'Microsoft login failed' };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };
  


  const updateUserSubscription = (subscriptionData: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription: {
          planType: subscriptionData.planType,
          subscriptionType: subscriptionData.subscriptionType,
          subscriptionDate: subscriptionData.subscriptionDate,
          expiryOn: subscriptionData.expiryOn
        }
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      loginWithGoogle,
      loginWithMicrosoft,
      isAuthenticated,
      isSubscriptionActive,
      isSubscriptionExpired,
      updateUserSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};
