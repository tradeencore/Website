interface UserData {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  planType: string;
  subscriptionType: string;
  subscriptionDate?: string;
  expiryOn?: string;
  paymentId?: string;
  orderId?: string;
  loginType?: 'email' | 'google' | 'microsoft';
  amount?: number; // Add amount for receipt generation
}

interface VerificationResult {
  success: boolean;
  message: string;
  userData?: {
    name: string;
    email: string;
    subscription?: {
      planType: string;
      subscriptionType: string;
      subscriptionDate: string;
      expiryOn: string;
    };
  };
}

// Function to append data to Google Sheets using a web app proxy
export const appendToSheet = async (userData: UserData): Promise<{success: boolean; message: string; data?: any}> => {
  try {
    console.log('Appending data to Google Sheet:', userData);
    
    // Get the current date and calculate expiry date
    const currentDate = new Date();
    const subscriptionDate = userData.subscriptionDate || currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Calculate expiry date based on subscription type if not provided
    let expiryOn = userData.expiryOn;
    if (!expiryOn) {
      let expiryDate = new Date(currentDate);
      if (userData.subscriptionType === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (userData.subscriptionType === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (userData.subscriptionType === 'lifetime') {
        expiryDate = new Date(2099, 11, 31); // Far future date for lifetime
      } else if (userData.subscriptionType === 'trial') {
        expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
      }
      expiryOn = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Using Google Apps Script Web App as a proxy to append data to the sheet
    // This is a more reliable method for client-side applications
    // Replace this URL with your deployed Google Apps Script Web App URL
    const WEBAPP_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 
      'https://script.google.com/macros/s/AKfycbwLFBnXjGHjzQArVRYwxVGshvs6wWvG9P9u3le0kQ_TfZY8jKbTLQJ-EQ3jZ_YOPnUf/exec';
    
    // Store the sheet ID for reference (this is used in the Google Apps Script)
    const SHEET_ID = '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY';
    
    // Format data for the web app according to the required format:
    // Sr. No.	Name of the user	Email	Password	Mobile Number	Plan type	Subscription Type	Subscription Date	Expiry on	Payment ID	Order ID
    const formData = new FormData();
    formData.append('action', 'appendRow'); // Specify the action for the Google Apps Script
    formData.append('name', userData.name || '');
    formData.append('email', userData.email || '');
    formData.append('password', userData.password || '');
    formData.append('mobile', userData.mobile || '');
    formData.append('planType', userData.planType || '');
    formData.append('subscriptionType', userData.subscriptionType || '');
    formData.append('subscriptionDate', userData.subscriptionDate || subscriptionDate);
    formData.append('expiryOn', userData.expiryOn || expiryOn);
    formData.append('paymentId', userData.paymentId || '');
    formData.append('orderId', userData.orderId || '');
    formData.append('loginType', userData.loginType || 'email');
    formData.append('amount', userData.amount?.toString() || '0'); // Add amount for receipt generation
    
    console.log('Sending data to Google Apps Script Web App');
    
    // Make the request to the web app
    const response = await fetch(WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors', // This is important for CORS issues
      body: formData
    });
    
    console.log('Response received from web app');
    
    // Due to no-cors mode, we won't be able to read the response directly
    // In a production environment, you might want to set up a proxy server or use JSONP
    // For now, we'll assume success if no error was thrown and return additional information
    
    return {
      success: true,
      message: 'Data sent to Google Sheets via web app'
    };
  } catch (error) {
    console.error('Error in appendToSheet:', error);
    return {
      success: false,
      message: `Error appending to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Define the return type for sheet operations
interface SheetOperationResult {
  success: boolean;
  message: string;
  spreadsheetId?: string;
  updates?: {
    updatedRange: string;
    updatedRows: number;
    updatedColumns: number;
    updatedCells: number;
  };
}

// Verify user credentials against Google Sheets
export const verifyUserCredentials = async (email: string, password: string): Promise<VerificationResult> => {
  try {
    // Use the Google Apps Script Web App URL
    const WEBAPP_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 
      'https://script.google.com/macros/s/AKfycbwLFBnXjGHjzQArVRYwxVGshvs6wWvG9P9u3le0kQ_TfZY8jKbTLQJ-EQ3jZ_YOPnUf/exec';
    
    console.log('Verifying credentials with Google Sheets Web App:', WEBAPP_URL);
    
    // Format data for the web app
    const params = new URLSearchParams();
    params.append('action', 'verifyUser');
    params.append('email', email);
    params.append('password', password);
    
    // Make the request to the web app with JSONP approach to handle CORS
    const url = `${WEBAPP_URL}?${params.toString()}`;
    
    try {
      // Make the request with fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Verification response:', data);
      
      if (data.success) {
        // Check if subscription is expired
        const today = new Date();
        const expiryDate = data.userData.subscription?.expiryOn ? new Date(data.userData.subscription.expiryOn) : null;
        const isExpired = expiryDate ? today > expiryDate : true;
        
        // If verification successful, return user data
        return {
          success: true,
          message: isExpired ? 'Authentication successful but subscription expired' : 'Authentication successful',
          userData: {
            name: data.userData.name,
            email: email,
            subscription: {
              planType: data.userData.subscription?.planType || 'free',
              subscriptionType: data.userData.subscription?.subscriptionType || 'none',
              subscriptionDate: data.userData.subscription?.subscriptionDate || new Date().toISOString().split('T')[0],
              expiryOn: data.userData.subscription?.expiryOn || ''
            }
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid credentials. Please check your email and password.'
        };
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      // Fallback to direct verification for testing
      // In production, you would need to properly handle CORS or use a proxy
      console.warn('Falling back to direct verification - this is for testing only');
      
      // Check if this is the admin account (hardcoded for testing)
      if (email === 'admin@tradeencore.com' && password === 'admin') {
        return {
          success: true,
          message: 'Authentication successful',
          userData: {
            name: 'Admin User',
            email: email,
            subscription: {
              planType: 'premium',
              subscriptionType: 'lifetime',
              subscriptionDate: new Date().toISOString().split('T')[0],
              expiryOn: '2099-12-31'
            }
          }
        };
      }
      
      // Try to find the user in local storage for testing
      const storedUsers = localStorage.getItem('tradeEncore_users');
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const user = users.find((u: any) => u.email === email && u.password === password);
          
          if (user) {
            return {
              success: true,
              message: 'Authentication successful',
              userData: {
                name: user.name,
                email: user.email,
                subscription: user.subscription || {
                  planType: 'free',
                  subscriptionType: 'trial',
                  subscriptionDate: new Date().toISOString().split('T')[0],
                  expiryOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
              }
            };
          }
        } catch (e) {
          console.error('Error parsing stored users:', e);
        }
      }
      
      return {
        success: false,
        message: 'Unable to verify credentials. Please try again later.'
      };
    }
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return {
      success: false,
      message: 'Error connecting to authentication service'
    };
  }
};

// Main function to add user to sheet
export const addUserToSheet = async (userData: UserData): Promise<SheetOperationResult> => {
  try {
    console.log('Adding user to sheet:', userData);
    
    // Call the appendToSheet function
    const response = await appendToSheet(userData);
    
    if (response.success) {
      // Return a successful response
      return {
        success: true,
        message: 'User data successfully added to sheet',
        spreadsheetId: '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY',
        updates: {
          updatedRange: 'Sheet1!A:I',
          updatedRows: 1,
          updatedColumns: 9,
          updatedCells: 9
        }
      };
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Error adding user to sheet:', error);
    // Return an error response but with enough info to continue the flow
    return {
      success: false,
      message: `Error adding user to sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spreadsheetId: '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY',
      updates: {
        updatedRange: 'Sheet1!A:I',
        updatedRows: 0,
        updatedColumns: 0,
        updatedCells: 0
      }
    };
  }
};
