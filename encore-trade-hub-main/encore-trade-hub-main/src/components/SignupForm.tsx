import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';

interface SignupFormProps {
  onSuccess: (userData: {
    name: string;
    email: string;
    phone: string;
  }) => void;
  planType?: string;
  subscriptionType?: 'monthly' | 'yearly';
}

const SignupForm = ({ onSuccess, planType, subscriptionType }: SignupFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [otpData, setOtpData] = useState({
    emailOTP: '',
    phoneOTP: '',
    emailSent: false,
    phoneSent: false,
    emailVerified: false,
    phoneVerified: false
  });

  // Log props on component mount to verify data flow
  useEffect(() => {
    console.log('SignupForm mounted with props:', { planType, subscriptionType });
  }, [planType, subscriptionType]);

  const sendEmailOTP = async () => {
    if (!formData.email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await authService.sendEmailOTP(formData.email);
      
      if (response.success) {
        setOtpData(prev => ({ ...prev, emailSent: true }));
        toast({
          title: 'OTP Sent',
          description: 'Verification code sent to your email',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Failed to send OTP',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Email OTP error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email verification code',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendPhoneOTP = async () => {
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await authService.sendSMSOTP(formData.phone);
      
      if (response.success) {
        setOtpData(prev => ({ ...prev, phoneSent: true }));
        toast({
          title: 'OTP Sent',
          description: 'Verification code sent to your phone',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Failed to send OTP',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Phone OTP error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send phone verification code',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyOTPs = async () => {
    if (!otpData.emailOTP || !otpData.phoneOTP) {
      toast({
        title: 'Missing verification codes',
        description: 'Please enter both verification codes',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      // Only verify email OTP as per the updated auth service
      const verificationResult = await authService.verifyOTP(
        formData.email,
        otpData.emailOTP
      );
      
      if (verificationResult.success) {
        setOtpData(prev => ({ 
          ...prev, 
          emailVerified: true,
          // Since we're only using email verification now
          phoneVerified: true 
        }));
        toast({
          title: 'Verification successful',
          description: verificationResult.message || 'Your email has been verified',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Verification failed',
          description: verificationResult.message || 'The verification code is incorrect',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify codes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      setIsLoading(true);
      
      // Validate form fields
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // Validate phone number format
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a valid 10-digit phone number.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // Check if both email and phone are verified
      if (!otpData.emailVerified || !otpData.phoneVerified) {
        toast({
          title: 'Verification required',
          description: 'Please verify your email and phone before continuing',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Log success before calling onSuccess callback
      console.log('Signup validation successful, proceeding to payment');
      
      // Call the onSuccess callback with user data
      onSuccess({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong during signup. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto bg-[var(--tv-background)] border-[var(--tv-border-color)]">
      <h2 className="text-2xl font-bold text-[var(--tv-text-primary)] mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              pattern="[0-9]{10}"
              className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
            />
            <Button 
              type="button" 
              onClick={sendPhoneOTP}
              disabled={isLoading || otpData.phoneSent}
              className="bg-[var(--tv-blue-500)] text-white"
            >
              {otpData.phoneSent ? 'Sent' : 'Send OTP'}
            </Button>
          </div>
          {otpData.phoneSent && (
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Phone OTP"
                value={otpData.phoneOTP}
                onChange={(e) => setOtpData({ ...otpData, phoneOTP: e.target.value })}
                className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
              />
              {!otpData.phoneVerified && (
                <Button 
                  type="button" 
                  onClick={verifyOTPs}
                  disabled={isLoading || !otpData.emailSent || !otpData.phoneSent}
                  className="bg-[var(--tv-blue-500)] text-white"
                >
                  Verify
                </Button>
              )}
              {otpData.phoneVerified && (
                <span className="text-green-500 flex items-center">✓ Verified</span>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
            />
            <Button 
              type="button" 
              onClick={sendEmailOTP}
              disabled={isLoading || otpData.emailSent}
              className="bg-[var(--tv-blue-500)] text-white"
            >
              {otpData.emailSent ? 'Sent' : 'Send OTP'}
            </Button>
          </div>
          {otpData.emailSent && (
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Email OTP"
                value={otpData.emailOTP}
                onChange={(e) => setOtpData({ ...otpData, emailOTP: e.target.value })}
                className="bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
              />
              {otpData.emailVerified && (
                <span className="text-green-500 flex items-center">✓ Verified</span>
              )}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--tv-blue-500)] text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (otpData.emailVerified && otpData.phoneVerified ? 'Continue to Payment' : 'Verify & Continue')}
        </Button>
        <p className="text-sm text-[var(--tv-text-secondary)] text-center mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[var(--tv-blue-500)] hover:underline"
          >
            Log in
          </button>
        </p>
      </form>
    </Card>
  );
};

export default SignupForm;
