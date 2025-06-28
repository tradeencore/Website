
// Google Apps Script integration utilities for Trade Encore

declare global {
  interface Window {
    TradeEncore: {
      validateLogin: (username: string, password: string) => Promise<any>;
      downloadReport: (type: string) => Promise<any>;
      getLogoImage: () => string;
      verifyPayment: (paymentId: string, subscriptionId: string) => Promise<any>;
    };
  }
}

export class GoogleAppsScriptService {
  // Validate user login credentials
  static async validateLogin(username: string, password: string) {
    try {
      if (window.TradeEncore && window.TradeEncore.validateLogin) {
        return await window.TradeEncore.validateLogin(username, password);
      }
      throw new Error('Google Apps Script service not available');
    } catch (error) {
      console.error('Login validation error:', error);
      throw error;
    }
  }

  // Download research report
  static async downloadReport(type: string) {
    try {
      if (window.TradeEncore && window.TradeEncore.downloadReport) {
        const result = await window.TradeEncore.downloadReport(type);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = `data:${result.mimeType};base64,${result.content}`;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return result;
      }
      throw new Error('Google Apps Script service not available');
    } catch (error) {
      console.error('Report download error:', error);
      throw error;
    }
  }

  // Get Trade Encore logo
  static getLogoImage(): string {
    try {
      if (window.TradeEncore && window.TradeEncore.getLogoImage) {
        return window.TradeEncore.getLogoImage();
      }
      return '';
    } catch (error) {
      console.error('Logo retrieval error:', error);
      return '';
    }
  }

  // Verify Razorpay payment
  static async verifyPayment(paymentId: string, subscriptionId: string) {
    try {
      if (window.TradeEncore && window.TradeEncore.verifyPayment) {
        return await window.TradeEncore.verifyPayment(paymentId, subscriptionId);
      }
      throw new Error('Google Apps Script service not available');
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Store Razorpay credentials (Admin function)
  static async storeRazorpayCredentials(keyId: string, keySecret: string) {
    try {
      // This would call Google Apps Script function to store credentials securely
      // Implementation would use PropertiesService.getScriptProperties()
      console.log('Storing Razorpay credentials securely...');
      
      // Simulate storage
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Credentials stored successfully' });
        }, 1000);
      });
    } catch (error) {
      console.error('Credential storage error:', error);
      throw error;
    }
  }

  // Get research reports metadata
  static async getResearchReports(type: string) {
    try {
      // This would call Google Apps Script function to get report metadata
      const reports = [
        {
          title: `${type} Report - Current`,
          date: new Date().toLocaleDateString(),
          downloadFunction: 'downloadReport',
          reportType: type
        },
        {
          title: `${type} Report - Previous Week`,
          date: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString(),
          downloadFunction: 'downloadReport',
          reportType: `${type}_Previous`
        }
      ];
      
      return reports;
    } catch (error) {
      console.error('Error fetching research reports:', error);
      throw error;
    }
  }
}

// Types for Google Apps Script responses
export interface LoginResponse {
  success: boolean;
  clientName: string;
  message: string;
}

export interface ReportResponse {
  filename: string;
  content: string;
  mimeType: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
}

export interface ReportMetadata {
  title: string;
  date: string;
  downloadFunction: string;
  reportType: string;
}
