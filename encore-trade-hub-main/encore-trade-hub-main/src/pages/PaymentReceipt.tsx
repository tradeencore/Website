import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Download, Mail, MessageCircle } from 'lucide-react';

interface ReceiptData {
  name: string;
  email: string;
  mobile?: string;
  planType: string;
  subscriptionType: string;
  amount: number;
  paymentId: string;
  subscriptionDate: string;
  expiryOn: string;
}

export default function PaymentReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState({
    email: false,
    whatsapp: false
  });
  
  // Parse query parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    // Get receipt data from query parameters
    const name = queryParams.get('name') || user?.name || '';
    const email = queryParams.get('email') || user?.email || '';
    const mobile = queryParams.get('mobile') || '';
    const planType = queryParams.get('plan') || '';
    const subscriptionType = queryParams.get('subscriptionType') || 'monthly';
    const amount = parseInt(queryParams.get('amount') || '0');
    const paymentId = queryParams.get('paymentId') || '';
    const subscriptionDate = queryParams.get('subscriptionDate') || new Date().toISOString().split('T')[0];
    const expiryOn = queryParams.get('expiryOn') || '';
    
    // Check if we have the minimum required data
    if (!name || !email || !planType || !paymentId) {
      toast({
        title: 'Missing Information',
        description: 'Could not load receipt due to missing information.',
        variant: 'destructive'
      });
      navigate('/dashboard');
      return;
    }
    
    // Set receipt data
    setReceiptData({
      name,
      email,
      mobile,
      planType,
      subscriptionType,
      amount,
      paymentId,
      subscriptionDate,
      expiryOn
    });
    
    // Get notification status
    const emailSent = queryParams.get('emailSent') === 'true';
    const whatsappSent = queryParams.get('whatsappSent') === 'true';
    
    setNotificationStatus({
      email: emailSent,
      whatsapp: whatsappSent
    });
    
    setIsLoading(false);
  }, [location.search, navigate, toast, user]);
  
  const handleDownloadReceipt = (): void => {
    // In a real implementation, this would download a PDF receipt
    // For now, we'll just show a toast notification
    toast({
      title: 'Receipt Download',
      description: 'Your receipt is being generated and will download shortly.',
      variant: 'default'
    });
    
    // Simulate PDF generation delay
    setTimeout(() => {
      if (!receiptData) return;
    
    // Create a simple text receipt
    const receiptText = `
TRADE ENCORE - PAYMENT RECEIPT
==============================
Name: ${receiptData.name}
Email: ${receiptData.email}
Plan: ${receiptData.planType}
Subscription: ${receiptData.subscriptionType}
Amount: ₹${receiptData.amount}
Payment ID: ${receiptData.paymentId}
Date: ${receiptData.subscriptionDate}
Valid until: ${receiptData.expiryOn}
      `;
      
      // Create a Blob with the receipt text
      const blob = new Blob([receiptText], { type: 'text/plain' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TradeEncore_Receipt_${receiptData?.paymentId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };
  
  const handleContinueToDashboard = (): void => {
    navigate('/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading receipt...</h2>
          <p>Please wait while we load your payment receipt.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Payment Successful</h1>
      
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2">1</div>
              <p className="text-sm font-medium">Sign Up</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2">2</div>
              <p className="text-sm font-medium">Payment</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2">3</div>
              <p className="text-sm font-medium">Confirmation</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center mx-auto mb-2">4</div>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
              <h2 className="text-xl font-semibold">Payment Confirmed</h2>
            </div>
            <p className="mb-4">Thank you for subscribing to Trade Encore. Your payment has been successfully processed and your subscription is now active.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Details</h3>
                <p className="font-medium">{receiptData?.planType} - {receiptData?.subscriptionType ? receiptData.subscriptionType.charAt(0).toUpperCase() + receiptData.subscriptionType.slice(1) : ''}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">₹{receiptData?.amount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Until</h3>
                <p className="font-medium">{receiptData?.expiryOn}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment ID</h3>
                <p className="font-medium">{receiptData?.paymentId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</h3>
                <p className="font-medium">{receiptData?.subscriptionDate}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notifications Sent</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${notificationStatus.email ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {notificationStatus.email ? <CheckCircle className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">Email Receipt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationStatus.email 
                      ? `Sent to ${receiptData?.email}` 
                      : 'Will be sent shortly'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${notificationStatus.whatsapp ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {notificationStatus.whatsapp ? <CheckCircle className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium">WhatsApp Notification</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationStatus.whatsapp 
                      ? `Sent to ${receiptData?.mobile}` 
                      : receiptData?.mobile 
                        ? 'Will be sent shortly' 
                        : 'No mobile number provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Next steps card */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">1</div>
                <p>Access your dashboard to view premium content and features</p>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">2</div>
                <p>Check your email for your receipt and welcome information</p>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">3</div>
                <p>Download your receipt for your records</p>
              </li>
            </ul>
          </div>
        </Card>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
