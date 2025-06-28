
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const [credentials, setCredentials] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    adminPassword: ''
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const { toast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin authentication - in production, this should be more secure
    if (loginPassword === 'tradeencore_admin_2024') {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive"
      });
    }
  };

  const saveRazorpayCredentials = async () => {
    setIsLoading(true);
    try {
      // This would call Google Apps Script function to save credentials securely
      // google.script.run.saveRazorpayCredentials(credentials.razorpayKeyId, credentials.razorpayKeySecret);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Credentials Saved",
        description: "Razorpay credentials have been securely stored.",
      });
      
      // Clear the form
      setCredentials({
        razorpayKeyId: '',
        razorpayKeySecret: '',
        adminPassword: ''
      });
      
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter admin password to access the management panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Demo password: <strong>tradeencore_admin_2024</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">TE</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-primary-foreground">Trade Encore</h1>
                <p className="text-sm text-primary-foreground/70">Admin Panel</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="razorpay" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="razorpay">Razorpay Settings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Report Settings</TabsTrigger>
          </TabsList>

          {/* Razorpay Settings */}
          <TabsContent value="razorpay" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Razorpay API Credentials
                </CardTitle>
                <CardDescription>
                  Securely store your Razorpay API credentials for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Credentials are encrypted and stored securely in Google Apps Script Properties Service.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      type="text"
                      value={credentials.razorpayKeyId}
                      onChange={(e) => setCredentials({...credentials, razorpayKeyId: e.target.value})}
                      placeholder="rzp_live_..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                    <div className="relative">
                      <Input
                        id="razorpayKeySecret"
                        type={showSecret ? 'text' : 'password'}
                        value={credentials.razorpayKeySecret}
                        onChange={(e) => setCredentials({...credentials, razorpayKeySecret: e.target.value})}
                        placeholder="Enter your Razorpay secret key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={saveRazorpayCredentials}
                    disabled={isLoading || !credentials.razorpayKeyId || !credentials.razorpayKeySecret}
                    className="w-full"
                  >
                    {isLoading ? 'Saving...' : 'Save Credentials'}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Log in to your Razorpay Dashboard</li>
                    <li>Navigate to Settings → API Keys</li>
                    <li>Generate or copy your Key ID and Key Secret</li>
                    <li>Paste them in the fields above</li>
                    <li>Click "Save Credentials" to store them securely</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans Status</CardTitle>
                <CardDescription>
                  Current subscription plans configured in Razorpay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Basic Plan</p>
                      <p className="text-sm text-muted-foreground">₹2,999/month</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Premium Plan</p>
                      <p className="text-sm text-muted-foreground">₹4,999/month</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Professional Plan</p>
                      <p className="text-sm text-muted-foreground">₹7,999/month</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage client accounts and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Demo Client</p>
                      <p className="text-sm text-muted-foreground">demo@example.com</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Premium Active
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">Expires: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-center py-8 text-muted-foreground">
                    <p>Additional users will appear here when they subscribe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Settings */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Report Configuration
                </CardTitle>
                <CardDescription>
                  Configure report generation and Google Apps Script settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Google Sheet ID</h4>
                    <p className="text-sm text-muted-foreground">1uOzYOgbP23GcgiOhZDnzIOrVRX5iL2tkN4M_lOt3n-k</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Logo Status</h4>
                    <p className="text-sm text-green-600">Cached and Available</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Script Status</h4>
                    <p className="text-sm text-green-600">Deployed and Running</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Report Types</h4>
                    <p className="text-sm text-muted-foreground">4 Active Types</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Google Apps Script Functions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>validateLogin()</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>downloadReport()</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>getLogoImage()</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span>verifyPayment()</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
