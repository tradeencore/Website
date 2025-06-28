import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('user');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if admin login tab is active
      if (activeTab === 'admin') {
        // Use admin credentials - allow both 'admin' and 'admin@tradeencore.com'
        const adminEmail = formData.email || 'admin';
        const result = await login(adminEmail, formData.password);
        
        if (result.success) {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin dashboard.",
          });
          navigate('/admin/dashboard');
        } else {
          setError('Invalid admin credentials');
        }
      } else {
        // Regular user login with Google Sheets verification
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome to Trade Encore.",
          });
          navigate('/dashboard');
        } else {
          setError(result.error || 'Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        toast({
          title: "Google Login Successful",
          description: "Welcome to Trade Encore.",
        });
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('An error occurred during Google login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithMicrosoft();
      navigate('/dashboard');
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in with Microsoft',
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Failed to login with Microsoft',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tv-background)]">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-6 bg-[var(--tv-background)] border-[var(--tv-border-color)]">
          <Link 
            to="/" 
            className="flex items-center text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--tv-text-primary)]">Trade Encore</h2>
            <p className="text-[var(--tv-text-secondary)] mt-2">
              Sign in to access your account
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Member Login</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-[var(--tv-text-primary)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-[var(--tv-text-primary)]">
                    Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[var(--tv-text-secondary)]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[var(--tv-text-secondary)]" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link to="/forgot-password" className="text-[var(--tv-primary)] hover:text-[var(--tv-primary-hover)]">
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="text-sm">
                    <Link to="/signup" className="text-[var(--tv-primary)] hover:text-[var(--tv-primary-hover)]">
                      Create an account
                    </Link>
                  </div>
                </div>

                <div className="text-xs text-center text-[var(--tv-text-secondary)] mt-4 mb-2">
                  <p>Demo User Credentials:</p>
                  <p>Email: demo@tradeencore.com | Password: demo123</p>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--tv-background)] px-2 text-[var(--tv-text-secondary)]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMicrosoftLogin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                    Microsoft
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="admin-email" className="block text-sm font-medium text-[var(--tv-text-primary)]">
                    Admin Username
                  </Label>
                  <Input
                    id="admin-email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="admin or admin@tradeencore.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
                  />
                </div>

                <div>
                  <Label htmlFor="admin-password" className="block text-sm font-medium text-[var(--tv-text-primary)]">
                    Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full bg-[var(--tv-background-secondary)] text-[var(--tv-text-primary)]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[var(--tv-text-secondary)]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[var(--tv-text-secondary)]" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <div className="text-xs text-center text-[var(--tv-text-secondary)] mt-4 mb-2">
                  <p>Demo Admin Credentials:</p>
                  <p>Username: admin | Password: admin</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Admin Sign in'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
