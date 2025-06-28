/**
 * WhatsApp Notification Service
 * 
 * This service uses the Meta WhatsApp Business API to send notifications to users
 * and verify WhatsApp numbers through verification codes
 * For more information: https://developers.facebook.com/docs/whatsapp/cloud-api/
 */

interface WhatsAppNotificationData {
  name: string;
  mobile: string;
  planType: string;
  subscriptionType: string;
  amount: number;
  expiryOn: string;
}

interface WhatsAppVerificationResponse {
  success: boolean;
  message: string;
  testCode?: string; // For testing purposes only
}

/**
 * Send a subscription confirmation notification via WhatsApp
 * @param data User and subscription data
 * @returns Promise resolving to success status and message
 */
export const sendWhatsAppNotification = async (data: WhatsAppNotificationData): Promise<{ success: boolean; message: string }> => {
  try {
    // Format the mobile number to international format (assuming Indian numbers)
    // Remove any non-digit characters and ensure it starts with country code
    let formattedMobile = data.mobile.replace(/\D/g, '');
    if (formattedMobile.length === 10) {
      formattedMobile = `91${formattedMobile}`; // Add India country code
    } else if (formattedMobile.startsWith('0')) {
      formattedMobile = `91${formattedMobile.substring(1)}`; // Replace leading 0 with country code
    }

    // Get WhatsApp API credentials from environment variables
    const token = import.meta.env.VITE_META_WHATSAPP_TOKEN;
    const phoneId = import.meta.env.VITE_META_WHATSAPP_PHONE_ID;
    
    if (!token || !phoneId) {
      console.error('WhatsApp API credentials not configured');
      return { 
        success: false, 
        message: 'WhatsApp API credentials not configured' 
      };
    }

    // Format the subscription period for better readability
    const subscriptionPeriod = data.subscriptionType === 'monthly' ? 'month' : 'year';
    
    // Format the amount with commas for thousands
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(data.amount);

    // Format the expiry date
    const expiryDate = new Date(data.expiryOn);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Prepare the message content
    const messageContent = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedMobile,
      type: "template",
      template: {
        name: "subscription_confirmation",
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: data.name
              },
              {
                type: "text",
                text: data.planType
              },
              {
                type: "text",
                text: subscriptionPeriod
              },
              {
                type: "text",
                text: formattedAmount
              },
              {
                type: "text",
                text: formattedExpiryDate
              }
            ]
          }
        ]
      }
    };

    // Make the API call to Meta WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageContent)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('WhatsApp notification sent successfully:', responseData);
      return {
        success: true,
        message: 'WhatsApp notification sent successfully'
      };
    } else {
      console.error('Failed to send WhatsApp notification:', responseData);
      return {
        success: false,
        message: `Failed to send WhatsApp notification: ${responseData.error?.message || 'Unknown error'}`
      };
    }
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return {
      success: false,
      message: `Error sending WhatsApp notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Request a WhatsApp verification code
 * @param mobile The mobile number to send the verification code to
 * @returns Promise resolving to success status, message, and test code (if available)
 */
export const requestWhatsAppVerification = async (mobile: string): Promise<WhatsAppVerificationResponse> => {
  try {
    // Format the mobile number to ensure it's valid
    let formattedMobile = mobile.replace(/\D/g, '');
    if (formattedMobile.length !== 10) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      };
    }

    // Get Google Apps Script URL from environment variables
    const apiUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!apiUrl) {
      console.error('API URL not configured');
      return {
        success: false,
        message: 'API configuration error'
      };
    }

    // Make the API call to request a verification code
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'sendWhatsAppVerificationCode',
        mobile: formattedMobile
      })
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      return {
        success: true,
        message: 'Verification code sent successfully',
        testCode: responseData.testCode // For testing purposes only
      };
    } else {
      console.error('Failed to send verification code:', responseData);
      return {
        success: false,
        message: responseData.message || 'Failed to send verification code'
      };
    }
  } catch (error) {
    console.error('Error requesting WhatsApp verification:', error);
    return {
      success: false,
      message: `Error requesting verification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Verify a WhatsApp verification code
 * @param mobile The mobile number to verify
 * @param code The verification code to check
 * @returns Promise resolving to success status and message
 */
export const verifyWhatsAppCode = async (mobile: string, code: string): Promise<WhatsAppVerificationResponse> => {
  try {
    // Format the mobile number to ensure it's valid
    let formattedMobile = mobile.replace(/\D/g, '');
    if (formattedMobile.length !== 10) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      };
    }

    // Validate the verification code format
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: 'Please provide a valid 6-digit verification code'
      };
    }

    // Get Google Apps Script URL from environment variables
    const apiUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!apiUrl) {
      console.error('API URL not configured');
      return {
        success: false,
        message: 'API configuration error'
      };
    }

    // Make the API call to verify the code
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'verifyWhatsAppCode',
        mobile: formattedMobile,
        code: code
      })
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      return {
        success: true,
        message: 'WhatsApp number verified successfully'
      };
    } else {
      console.error('Failed to verify WhatsApp code:', responseData);
      return {
        success: false,
        message: responseData.message || 'Invalid verification code'
      };
    }
  } catch (error) {
    console.error('Error verifying WhatsApp code:', error);
    return {
      success: false,
      message: `Error verifying code: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Send a trial expiry reminder via WhatsApp
 * @param data User and subscription data
 * @returns Promise resolving to success status and message
 */
export const sendTrialExpiryReminder = async (data: WhatsAppNotificationData): Promise<{ success: boolean; message: string }> => {
  try {
    // Format the mobile number to international format (assuming Indian numbers)
    let formattedMobile = data.mobile.replace(/\D/g, '');
    if (formattedMobile.length === 10) {
      formattedMobile = `91${formattedMobile}`;
    } else if (formattedMobile.startsWith('0')) {
      formattedMobile = `91${formattedMobile.substring(1)}`;
    }

    // Get WhatsApp API credentials
    const token = import.meta.env.VITE_META_WHATSAPP_TOKEN;
    const phoneId = import.meta.env.VITE_META_WHATSAPP_PHONE_ID;
    
    if (!token || !phoneId) {
      console.error('WhatsApp API credentials not configured');
      return { 
        success: false, 
        message: 'WhatsApp API credentials not configured' 
      };
    }

    // Format the expiry date
    const expiryDate = new Date(data.expiryOn);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Prepare the message content for trial expiry
    const messageContent = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedMobile,
      type: "template",
      template: {
        name: "trial_expiry_reminder",
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: data.name
              },
              {
                type: "text",
                text: formattedExpiryDate
              }
            ]
          }
        ]
      }
    };

    // Make the API call
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageContent)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('Trial expiry reminder sent successfully:', responseData);
      return {
        success: true,
        message: 'Trial expiry reminder sent successfully'
      };
    } else {
      console.error('Failed to send trial expiry reminder:', responseData);
      return {
        success: false,
        message: `Failed to send trial expiry reminder: ${responseData.error?.message || 'Unknown error'}`
      };
    }
  } catch (error) {
    console.error('Error sending trial expiry reminder:', error);
    return {
      success: false,
      message: `Error sending trial expiry reminder: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
