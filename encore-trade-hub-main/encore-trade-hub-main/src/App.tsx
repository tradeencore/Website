import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from './components/Layout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BlogEditor from './pages/BlogEditor';
import Index from "./pages/Index";
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import TestPayment from './pages/TestPayment';
import DirectPayment from './pages/DirectPayment';
import PaymentReceipt from './pages/PaymentReceipt';
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Pricing from './pages/Pricing';
import FinSilver from './pages/plans/FinSilver';
import FinGold from './pages/plans/FinGold';
import FinPlatinum from './pages/plans/FinPlatinum';
import TFinSilver from './pages/plans/TFinSilver';
import TFinGold from './pages/plans/TFinGold';
import TFinPlatinum from './pages/plans/TFinPlatinum';
import TestPlan from './pages/plans/TestPlan';
import SubscriptionPlans from './pages/SubscriptionPlans';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Disclaimer from './pages/Disclaimer';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/disclaimer" element={<Layout><Disclaimer /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/blog" element={<Layout><Index /></Layout>} />
            <Route path="/plans/fin-silver" element={<Layout><FinSilver /></Layout>} />
            <Route path="/plans/fin-gold" element={<Layout><FinGold /></Layout>} />
            <Route path="/plans/fin-platinum" element={<Layout><FinPlatinum /></Layout>} />
            <Route path="/plans/t-fin-silver" element={<Layout><TFinSilver /></Layout>} />
            <Route path="/plans/t-fin-gold" element={<Layout><TFinGold /></Layout>} />
            <Route path="/plans/t-fin-platinum" element={<Layout><TFinPlatinum /></Layout>} />
            <Route path="/plans/test-plan" element={<Layout><TestPlan /></Layout>} />
            <Route path="/subscription" element={<Layout><SubscriptionPlans /></Layout>} />
            <Route path="/privacy" element={<Layout><Disclaimer /></Layout>} />
            <Route path="/terms" element={<Layout><Disclaimer /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/signup" element={<Layout><Signup /></Layout>} />
            <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
            <Route path="/test-payment" element={<Layout><TestPayment /></Layout>} />
            <Route path="/payment" element={<Layout><DirectPayment /></Layout>} />
            <Route path="/payment-receipt" element={<Layout><PaymentReceipt /></Layout>} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/posts/new" element={<BlogEditor />} />
              <Route path="/admin/posts/edit/:id" element={<BlogEditor />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            
            {/* Admin login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* 404 - Not Found */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
