import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    emailOTP: '',
    planType: 'free'
  });

  // Available subscription plans
  const plans = [
    { id: 'free', name: 'Free (Daily Market Outlook Only)' },
    { id: 'fin_silver', name: 'Fin Silver - ₹99/month or ₹990/year' },
    { id: 'fin_gold', name: 'Fin Gold - ₹299/month or ₹2,990/year' },
    { id: 'fin_platinum', name: 'Fin Platinum - ₹499/month or ₹4,990/year' },
    { id: 'tfin_silver', name: 'T-Fin Silver - ₹225/month or ₹2,250/year' },
    { id: 'tfin_gold', name: 'T-Fin Gold - ₹425/month or ₹4,250/year' },
    { id: 'tfin_platinum', name: 'T-Fin Platinum - ₹625/month or ₹6,250/year' },
    { id: 'test_monthly_7', name: 'Test Plan - ₹7/month' }
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First verify email OTP
      if (!formData.emailOTP) {
        toast({
          title: 'Verification Required',
          description: 'Please verify your email address with OTP',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Verify Email OTP
      const verificationResult = await authService.verifyOTP(
        formData.email,
        formData.emailOTP
      );

      if (!verificationResult.success) {
        toast({
          title: 'Verification Failed',
          description: verificationResult.message || 'Email verification failed. Please check the code and try again.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Register the user
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.mobile,
        formData.planType
      );

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Account created successfully!',
          variant: 'default'
        });

        // Redirect to payment page with plan info
        navigate(`/payment?plan=${formData.planType}&email=${formData.email}&name=${encodeURIComponent(formData.name)}`);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create account',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong during signup. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // Since we removed the Google login functionality, show a message
      toast({
        title: 'Information',
        description: 'Google login is currently being updated. Please use email registration.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Google signup error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          {/* Header with logo */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center">
              <img src="/trade-encore-logo.gif" alt="Trade Encore" className="h-8" />
              <span className="ml-2 font-semibold text-white">Trade Encore</span>
            </div>
            <Link to="/" className="text-gray-400 hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {/* Main content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Sign up</h2>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Create your account</h2>
              <p className="text-gray-400">Fill in your details and verify your email address with the verification code.</p>
            </div>
            
            {/* Social login buttons */}
            <div className="mb-6 flex justify-center space-x-4">
              {/* Google button */}
              <button 
                onClick={handleGoogleSignup}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>
            
            {/* Signup form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3 placeholder-gray-400"
                />
              </div>
              
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3 placeholder-gray-400"
                />
              </div>
              
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-300" />
                  )}
                </button>
              </div>
              
              <div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Mobile Number"
                    pattern="[0-9]{10}"
                    required
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: e.target.value });
                    }}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3 placeholder-gray-400"
                  />
                  {formData.mobile && formData.mobile.length !== 10 && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Please enter a 10-digit mobile number
                    </p>
                  )}
                </div>
              </div>
              
              {/* Email OTP verification */}
              <div>
                <label htmlFor="emailOTP" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Verification Code
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="emailOTP"
                    type="text"
                    placeholder="Email OTP"
                    value={formData.emailOTP || ''}
                    onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value })}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3 placeholder-gray-400"
                    maxLength={6}
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (formData.email) {
                        // Set loading state for OTP button
                        setIsLoading(true);
                        toast({
                          title: 'Sending verification code',
                          description: 'Please wait...',
                          variant: 'default'
                        });
                        
                        // Call the sendEmailOTP function from auth service
                        authService.sendEmailOTP(formData.email)
                          .then(response => {
                            if (response.success) {
                              toast({
                                title: 'Verification Code Sent',
                                description: 'A verification code has been sent to your email address. Please check your inbox and spam folder.',
                                variant: 'default'
                              });
                            } else {
                              console.error('Email OTP error:', response);
                              toast({
                                title: 'Error Sending Code',
                                description: response.message || 'Failed to send verification code. Please try again.',
                                variant: 'destructive'
                              });
                            }
                          })
                          .catch(error => {
                            console.error('Email OTP exception:', error);
                            toast({
                              title: 'Error',
                              description: 'Network error. Please check your connection and try again.',
                              variant: 'destructive'
                            });
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      } else {
                        toast({
                          title: 'Email Required',
                          description: 'Please enter your email address first',
                          variant: 'destructive'
                        });
                      }
                    }}
                    disabled={!formData.email || isLoading}
                    className="whitespace-nowrap"
                  >
                    {isLoading ? 'Sending...' : 'Send Code'}
                  </Button>
                </div>
              </div>
              
              <div>
                <Select
                  value={formData.planType}
                  onValueChange={(value) => setFormData({ ...formData, planType: value })}
                >
                  <SelectTrigger className="w-full border border-gray-600 bg-gray-700 text-white rounded-md py-2 px-3">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.name} className="hover:bg-gray-700">
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'SIGN UP FREE'}
              </Button>
              
              <p className="text-sm text-gray-400 mt-4">
                By signing up, you agree to our <Link to="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                <br />
                We'll send you a verification code via email to confirm your identity.
              </p>
            </form>
            
            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-900 text-center text-xs text-gray-400 border-t border-gray-700">
            <p>SEBI Registered Research Analyst - Reg. No: INH000009269</p>
            <p>All recommendations are subject to market risks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
