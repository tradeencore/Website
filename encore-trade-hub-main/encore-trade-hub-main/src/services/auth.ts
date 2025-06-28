import { User, UserRole } from '@/types/user';
import { toast } from '@/hooks/use-toast';

interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const authService = {
  async sendEmailOTP(email: string): Promise<OTPResponse> {
    try {
      console.log('Sending email OTP to:', email);
      console.log('Using Google Apps Script URL:', import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
      
      // Show sending message
      console.log('Sending verification code...');
      
      // Try both methods simultaneously for faster response
      const [iframePromise, fetchPromise] = [
        this.sendOTPViaIframe(email),
        this.sendOTPViaFetch(email)
      ];
      
      // Use Promise.race to get the first successful response
      const result = await Promise.race([
        iframePromise.then(result => {
          console.log('Iframe method completed first:', result);
          return result;
        }),
        fetchPromise.then(result => {
          console.log('Fetch method completed first:', result);
          return result;
        }),
        // Timeout after 15 seconds
        new Promise<OTPResponse>((resolve) => {
          setTimeout(() => {
            resolve({ success: false, message: 'Request timed out. Please try again.' });
          }, 15000);
        })
      ]);
      
      if (result.success) {
        console.log('Email OTP sent successfully');
        return result;
      } else {
        // If the first method failed, check if the other method succeeded
        try {
          const remainingResults = await Promise.all([
            iframePromise.catch(() => ({ success: false })),
            fetchPromise.catch(() => ({ success: false }))
          ]);
          
          const successResult = remainingResults.find(r => r.success);
          if (successResult) {
            console.log('Found successful OTP send method in remaining results');
            return successResult;
          }
        } catch (e) {
          console.error('Error checking remaining OTP methods:', e);
        }
        
        console.error('All OTP sending methods failed');
        return { success: false, message: 'Failed to send verification code. Please try again.' };
      }
    } catch (error) {
      console.error('Failed to send email OTP:', error);
      return { success: false, message: 'Failed to send email OTP: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
  },
  
  // Helper method: Send OTP via hidden iframe (works around CORS)
  async sendOTPViaIframe(email: string): Promise<OTPResponse> {
    return new Promise((resolve) => {
      // Create URL with parameters
      const url = new URL(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.append('action', 'sendEmailOTP');
      url.searchParams.append('email', email);
      url.searchParams.append('timestamp', Date.now().toString()); // Add timestamp to prevent caching
      
      console.log('Sending OTP via iframe to URL:', url.toString());
      
      // Create an iframe to load the URL
      const iframeId = `email-otp-iframe-${Date.now()}`; // Unique ID to prevent conflicts
      let iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Set a timeout for the request
      const timeoutId = setTimeout(() => {
        console.log('Email OTP iframe request timed out');
        cleanupIframe();
        resolve({ success: false, message: 'Request timed out. Please try again.' });
      }, 12000);
      
      // Function to clean up iframe
      const cleanupIframe = () => {
        try {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        } catch (e) {
          console.error('Error removing iframe:', e);
        }
      };
      
      // Set up load handler
      iframe.onload = () => {
        clearTimeout(timeoutId);
        console.log('Email OTP iframe loaded successfully');
        
        // Wait a moment before resolving to ensure the script has time to execute
        setTimeout(() => {
          cleanupIframe();
          resolve({ success: true, message: 'Verification code sent to your email' });
        }, 1000);
      };
      
      // Set up error handler
      iframe.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Email OTP iframe failed to load');
        cleanupIframe();
        resolve({ success: false, message: 'Network error. Please try again.' });
      };
      
      // Load the URL
      iframe.src = url.toString();
      console.log('Loading iframe with URL:', url.toString());
    });
  },
  
  // Helper method: Send OTP via fetch API (alternative method)
  async sendOTPViaFetch(email: string): Promise<OTPResponse> {
    try {
      // Create URL with parameters
      const url = new URL(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.append('action', 'sendEmailOTP');
      url.searchParams.append('email', email);
      
      console.log('Sending OTP via fetch to URL:', url.toString());
      
      // Create a promise that rejects after a timeout
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch request timed out')), 10000);
      });
      
      // Race the fetch against the timeout
      const response = await Promise.race([
        fetch(url.toString(), {
          method: 'GET',
          mode: 'cors', // Try with cors first
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        timeoutPromise
      ]);
      
      // Try to parse the response if possible
      try {
        // Check if we can read the response
        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Fetch response data:', data);
            return { 
              success: data.success || true, 
              message: data.message || 'Verification code sent to your email' 
            };
          } catch (jsonError) {
            console.log('Could not parse JSON response, but request succeeded');
            return { success: true, message: 'Verification code sent to your email' };
          }
        } else {
          console.log('Fetch response not OK:', response.status);
          // Fall back to no-cors mode if cors fails
          const noCorsResponse = await fetch(url.toString(), {
            method: 'GET',
            mode: 'no-cors'
          });
          
          // With no-cors we can't read the response, so just assume success
          console.log('No-cors fetch completed');
          return { success: true, message: 'Verification code sent to your email' };
        }
      } catch (responseError) {
        console.error('Error handling fetch response:', responseError);
        // If we can't read the response but the request didn't throw, assume success
        return { success: true, message: 'Verification code sent to your email' };
      }
    } catch (error) {
      console.error('Fetch method failed:', error);
      return { success: false, message: 'Failed to send verification code via fetch' };
    }
  },

  async sendSMSOTP(phone: string): Promise<OTPResponse> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendSMSOTP',
          phone
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Failed to send SMS OTP' };
    }
  },

  async verifyOTP(email: string, emailOTP: string): Promise<{success: boolean; message: string}> {
    try {
      console.log('Verifying email OTP for:', email);
      
      // Try multiple verification methods for reliability
      try {
        // Method 1: XMLHttpRequest (most reliable for CORS issues)
        const xhrResult = await this.verifyOTPViaXHR(email, emailOTP);
        
        if (xhrResult.success) {
          console.log('OTP verified successfully via XHR');
          return xhrResult;
        } else {
          console.log('XHR verification failed, trying fetch method');
          // If XHR method fails, try fetch method
          const fetchResult = await this.verifyOTPViaFetch(email, emailOTP);
          
          if (fetchResult.success) {
            console.log('OTP verified successfully via fetch');
            return fetchResult;
          } else {
            // Both methods failed
            console.error('Failed to verify OTP. Please try again.');
            return { success: false, message: fetchResult.message || 'Failed to verify code. Please try again.' };
          }
        }
      } catch (innerError) {
        console.error('All OTP verification methods failed:', innerError);
        return { success: false, message: 'Failed to verify code. Please try again.' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Error verifying code: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
  },
  
  // Helper method: Verify OTP via XMLHttpRequest
  async verifyOTPViaXHR(email: string, emailOTP: string): Promise<{success: boolean; message: string}> {
    return new Promise((resolve) => {
      // Create URL with parameters
      const url = new URL(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.append('action', 'verifyOTP');
      url.searchParams.append('email', email);
      url.searchParams.append('emailOTP', emailOTP);
      
      console.log('Verifying OTP via XHR:', url.toString());
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url.toString(), true);
      
      // Set a timeout for the request
      const timeoutId = setTimeout(() => {
        console.log('OTP verification XHR request timed out');
        resolve({ success: false, message: 'Request timed out' });
      }, 15000);
      
      xhr.onload = function() {
        clearTimeout(timeoutId);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('OTP verification response:', response);
            resolve({
              success: response.success,
              message: response.message || (response.success ? 'Verification successful!' : 'Invalid verification code')
            });
          } catch (e) {
            console.error('Error parsing OTP verification response:', e);
            resolve({ success: false, message: 'Error processing response' });
          }
        } else {
          console.error('OTP verification failed with status:', xhr.status);
          resolve({ success: false, message: `Server error: ${xhr.status}` });
        }
      };
      
      xhr.onerror = function() {
        clearTimeout(timeoutId);
        console.error('Network error during OTP verification');
        resolve({ success: false, message: 'Network error' });
      };
      
      xhr.send();
    });
  },
  
  // Helper method: Verify OTP via fetch API
  async verifyOTPViaFetch(email: string, emailOTP: string): Promise<{success: boolean; message: string}> {
    try {
      // Create URL with parameters
      const url = new URL(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.append('action', 'verifyOTP');
      url.searchParams.append('email', email);
      url.searchParams.append('emailOTP', emailOTP);
      
      console.log('Verifying OTP via fetch:', url.toString());
      
      // Use regular fetch (not no-cors) since we need to read the response
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return { success: false, message: `Server error: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('OTP verification fetch response:', data);
      
      return {
        success: data.success,
        message: data.message || (data.success ? 'Verification successful!' : 'Invalid verification code')
      };
    } catch (error) {
      console.error('Fetch request failed:', error);
      return { success: false, message: 'Network error' };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  },

  async register(name: string, email: string, password: string, phone: string, planType: string): Promise<AuthResponse> {
    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          email,
          password,
          phone,
          planType
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMIN;
  }
};
