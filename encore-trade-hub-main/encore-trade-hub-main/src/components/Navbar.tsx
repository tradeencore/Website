import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Menu as MenuIcon, X, Facebook, Instagram, Linkedin, Twitter, Youtube, UserCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/services/subscription";

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { user, isAuthenticated, logout, isSubscriptionActive } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isActive: boolean;
    expiresSoon: boolean;
    daysLeft?: number;
  }>({ isActive: false, expiresSoon: false });

  useEffect(() => {
    const checkSubscription = async () => {
      if (user && user.role !== 'admin') {
        try {
          const subscription = await subscriptionService.getActiveSubscription(user.id);
          if (subscription) {
            const expiryDate = new Date(subscription.endDate);
            const today = new Date();
            const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            setSubscriptionStatus({
              isActive: true,
              expiresSoon: daysLeft <= 7,
              daysLeft
            });
          } else {
            setSubscriptionStatus({
              isActive: false,
              expiresSoon: false
            });
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    checkSubscription();
  }, [user]);
  const navigate = useNavigate();
  const { theme } = useTheme(); // We're keeping dark theme only

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme toggle removed - using dark theme only

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (isAuthenticated()) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className="bg-[var(--tv-background)] border-b border-[var(--tv-border-color)] w-full h-16 shadow-md backdrop-blur-md bg-opacity-95"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img src="/trade-encore-logo.gif" alt="Trade Encore" className="h-10 w-10 bg-white rounded" />
              <span className="text-lg font-semibold text-[var(--tv-text-primary)] hidden sm:block whitespace-nowrap">Trade Encore</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
              >
                Homepage
              </Link>
              <Link 
                to="/pricing" 
                className="text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
              >
                Become a Member
              </Link>
              <Link 
                to="/blog" 
                className="text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
              >
                Daily Market Analysis
              </Link>
              {/* Charts, Analysis, and Education links removed as requested */}
              {/* Dashboard link moved to the right side button */}
              {subscriptionStatus.expiresSoon && (
                <div className="mt-2 ml-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Your subscription expires in {subscriptionStatus.daysLeft} days
                  </div>
                  <Link 
                    to="/subscription" 
                    className="mt-1 inline-block text-yellow-700 dark:text-yellow-300 font-medium hover:underline"
                  >
                    Renew now
                  </Link>
                </div>
              )}
              <Link 
                to="/referral" 
                className="text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
              >
                Referral Program
              </Link>
              <Link 
                to="/contact" 
                className="text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
              <div className="relative">
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center gap-1 text-[var(--tv-text-primary)] hover:text-primary transition-colors whitespace-nowrap"
                >
                  <UserCircle size={18} />
                  <span>My Dashboard</span>
                </button>
                {subscriptionStatus.expiresSoon && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                  </span>
                )}
              </div>
              {isAuthenticated() && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[var(--tv-text-primary)] hover:text-red-500 transition-colors whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Social Media Icons */}
            <div className="hidden md:flex items-center gap-2">
              <a href="https://www.facebook.com/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.linkedin.com/company/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://twitter.com/tradeencore" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://youtube.com/@tradeencore" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                <Youtube size={18} />
              </a>
            </div>

            {/* Theme Toggle button removed - using dark theme only */}

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-[var(--tv-background-secondary)] transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-[var(--tv-text-primary)]" />
              ) : (
                <MenuIcon className="h-5 w-5 text-[var(--tv-text-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-16 inset-x-0 z-50 backdrop-blur-sm"
            >
              <div className="px-4 py-2 bg-[var(--tv-background)] border-b border-[var(--tv-border-color)] shadow-lg backdrop-blur-md bg-opacity-95">
                <div className="space-y-2">
                  <Link
                    to="/"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--tv-text-primary)] hover:bg-[var(--tv-background-secondary)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Homepage
                  </Link>
                  <Link
                    to="/pricing"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--tv-text-primary)] hover:bg-[var(--tv-background-secondary)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Become a Member
                  </Link>
                  <Link
                    to="/blog"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--tv-text-primary)] hover:bg-[var(--tv-background-secondary)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daily Market Analysis
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--tv-text-primary)] hover:bg-[var(--tv-background-secondary)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/referral"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-[var(--tv-text-primary)] hover:bg-[var(--tv-background-secondary)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Referral Program
                  </Link>
                </div>
                {/* Mobile Social Icons */}
                <div className="flex items-center gap-4 px-3 py-4 border-t border-[var(--tv-border-color)] mt-2">
                  <a href="https://www.facebook.com/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="https://www.instagram.com/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="https://www.linkedin.com/company/tradeencore/" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://twitter.com/tradeencore" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href="https://youtube.com/@tradeencore" target="_blank" rel="noopener noreferrer" className="text-[var(--tv-text-primary)] hover:text-primary transition-colors">
                    <Youtube size={18} />
                  </a>
                </div>
                <div className="space-y-2 mt-2">
                  <button 
                    onClick={handleDashboardClick} 
                    className="w-full px-3 py-2 bg-[var(--tv-button-primary)] text-white hover:bg-[#1a237e]/90 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md rounded-md"
                  >
                    My Dashboard
                  </button>
                  {isAuthenticated() && (
                    <button 
                      onClick={handleLogout} 
                      className="w-full px-3 py-2 bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md rounded-md"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
