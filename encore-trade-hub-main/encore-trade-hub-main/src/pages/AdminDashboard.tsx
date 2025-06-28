import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, PenSquare, MessageSquare, Settings, LogOut, Users, Shield, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [posts, setPosts] = useState([
    // Temporary mock data
    { id: 1, title: 'Market Analysis - June 2025', status: 'published', comments: 5, date: '2025-06-14' },
    { id: 2, title: 'Weekly Market Outlook', status: 'draft', comments: 0, date: '2025-06-14' },
  ]);
  
  const [users, setUsers] = useState([
    // Temporary mock data
    { id: 1, name: 'John Doe', email: 'john@example.com', planType: 'Premium', subscriptionType: 'yearly', subscriptionDate: '2025-01-15', expiryOn: '2026-01-15', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', planType: 'Basic', subscriptionType: 'monthly', subscriptionDate: '2025-05-20', expiryOn: '2025-06-20', status: 'active' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', planType: 'Enterprise', subscriptionType: 'yearly', subscriptionDate: '2025-03-10', expiryOn: '2026-03-10', status: 'active' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', planType: 'Basic', subscriptionType: 'monthly', subscriptionDate: '2025-04-05', expiryOn: '2025-05-05', status: 'expired' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
  }, [navigate, isAuthenticated, user, toast]);

  const handleLogout = () => {
    // Use the auth context logout function
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const handleNewPost = () => {
    navigate('/admin/posts/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Blog Posts</h2>
                <Button onClick={handleNewPost}>
                  <PenSquare className="w-4 h-4 mr-2" /> New Post
                </Button>
              </div>

              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold">
                        {post.title}
                      </CardTitle>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>{post.date}</span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments} comments
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/posts/edit/${post.id}`)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    <option value="all">All Plans</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(user => {
                          // Filter by search term
                          const matchesSearch = 
                            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          // Filter by plan type
                          const matchesPlan = selectedPlan === 'all' || user.planType === selectedPlan;
                          
                          return matchesSearch && matchesPlan;
                        })
                        .map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.planType}</TableCell>
                            <TableCell>{user.subscriptionType}</TableCell>
                            <TableCell>{user.subscriptionDate}</TableCell>
                            <TableCell>{user.expiryOn}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Shield className="mr-2 h-4 w-4" /> Change Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                    <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {users.filter(user => user.status === 'active').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+5% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Premium Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {users.filter(user => user.planType === 'Premium').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">+8% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comment Moderation</CardTitle>
                  <CardDescription>
                    Review and approve comments before they appear on the blog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Comment moderation interface will go here */}
                  <p className="text-sm text-gray-600">No pending comments to review.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Settings</CardTitle>
                    <CardDescription>
                      Configure your blog settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Blog Title</label>
                        <Input defaultValue="Trade Encore" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Blog Description</label>
                        <Input defaultValue="Professional Trading Insights and Analysis" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Posts Per Page</label>
                        <Input type="number" defaultValue="10" />
                      </div>
                      <Button className="mt-2">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>
                      Manage subscription plans and pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Basic Plan</h3>
                          <p className="text-sm text-gray-500">Monthly</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹999</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Premium Plan</h3>
                          <p className="text-sm text-gray-500">Yearly</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹9999</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Enterprise Plan</h3>
                          <p className="text-sm text-gray-500">Custom</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Custom</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add New Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>
                      Configure content access for different subscription plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Daily Market Updates</h3>
                          <p className="text-sm text-gray-500">Morning market analysis</p>
                        </div>
                        <select className="border rounded-md px-2 py-1 text-sm">
                          <option>All Plans</option>
                          <option>Basic & Above</option>
                          <option>Premium & Above</option>
                          <option>Enterprise Only</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Premium Recommendations</h3>
                          <p className="text-sm text-gray-500">High-quality stock picks</p>
                        </div>
                        <select className="border rounded-md px-2 py-1 text-sm">
                          <option>All Plans</option>
                          <option>Basic & Above</option>
                          <option selected>Premium & Above</option>
                          <option>Enterprise Only</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">Portfolio Review</h3>
                          <p className="text-sm text-gray-500">Personalized analysis</p>
                        </div>
                        <select className="border rounded-md px-2 py-1 text-sm">
                          <option>All Plans</option>
                          <option>Basic & Above</option>
                          <option>Premium & Above</option>
                          <option selected>Enterprise Only</option>
                        </select>
                      </div>
                      
                      <Button className="mt-2">
                        Save Access Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Google Sheets Integration</CardTitle>
                    <CardDescription>
                      Configure Google Sheets integration for user data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Google Apps Script Web App URL</label>
                        <Input defaultValue="https://script.google.com/macros/s/your-script-id/exec" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sheet ID</label>
                        <Input defaultValue="your-google-sheet-id" />
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="auto-sync" className="mr-2" />
                        <label htmlFor="auto-sync" className="text-sm">Enable automatic data synchronization</label>
                      </div>
                      <Button className="mt-2">
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
