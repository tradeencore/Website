/**
 * Trade Encore - Google Apps Script Backend
 * This script handles user data storage in Google Sheets and sends notifications
 */

// Spreadsheet ID from the URL
const SPREADSHEET_ID = '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY';
const SHEET_NAME = 'Sheet1';

/**
 * Process web app requests
 */
function doPost(e) {
  try {
    // Parse the request data
    const data = e.parameter;
    
    // Determine the action to take
    if (data.action === 'appendRow') {
      return appendUserData(data);
    } else if (data.action === 'verifyUser') {
      return verifyUserCredentials(data.email, data.password);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid action specified'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error processing request: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Append user data to the spreadsheet
 */
function appendUserData(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Get the last row to determine the next Sr. No.
    const lastRow = sheet.getLastRow();
    const srNo = lastRow > 1 ? lastRow : 1;
    
    // Current date in YYYY-MM-DD format
    const today = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd");
    
    // Calculate expiry date based on subscription type
    let expiryDate;
    if (data.subscriptionType === 'monthly') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (data.subscriptionType === 'yearly') {
      expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      // Default to 1 year if subscription type is not specified
      expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    const expiryOn = Utilities.formatDate(expiryDate, "GMT+5:30", "yyyy-MM-dd");
    
    // Prepare the row data
    // Sr. No., Name of the user, Email, Password, Mobile Number, Plan type, Subscription Type, Subscription Date, Expiry on
    const rowData = [
      srNo + 1, // Auto-increment Sr. No.
      data.name,
      data.email,
      data.password,
      data.mobile,
      data.planType,
      data.subscriptionType,
      data.subscriptionDate || today,
      data.expiryOn || expiryOn,
      data.paymentId || '',
      data.orderId || ''
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Send email notification if email is provided
    let emailSent = false;
    if (data.email) {
      emailSent = sendWelcomeEmail(data);
    }
    
    // Send WhatsApp notification if mobile is provided
    let whatsappSent = false;
    if (data.mobile) {
      whatsappSent = sendWhatsAppNotification(data);
    }
    
    // Generate PDF receipt
    const receiptUrl = generatePdfReceipt(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'User data added successfully',
      srNo: srNo + 1,
      notifications: {
        email: emailSent,
        whatsapp: whatsappSent,
        receipt: receiptUrl ? true : false
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error adding user data: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Verify user credentials against the spreadsheet
 */
function verifyUserCredentials(email, password) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Find the user by email and password
    // Assuming email is in column C (index 2) and password is in column D (index 3)
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === email && data[i][3] === password) {
        // User found, check if subscription is expired
        const expiryDate = new Date(data[i][8]); // Expiry date is in column I (index 8)
        const today = new Date();
        const isExpired = today > expiryDate;
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: isExpired ? 'Authentication successful but subscription expired' : 'Authentication successful',
          userData: {
            name: data[i][1], // Name is in column B (index 1)
            email: data[i][2], // Email is in column C (index 2)
            subscription: {
              planType: data[i][5], // Plan type is in column F (index 5)
              subscriptionType: data[i][6], // Subscription type is in column G (index 6)
              subscriptionDate: data[i][7], // Subscription date is in column H (index 7)
              expiryOn: data[i][8] // Expiry date is in column I (index 8)
            }
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // User not found
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid credentials'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error verifying credentials: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send welcome email with receipt
 */
function sendWelcomeEmail(data) {
  try {
    // Email subject
    const subject = 'Welcome to Trade Encore - Your Subscription is Active!';
    
    // Email content with HTML formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://tradeencore.com/assets/logo.png" alt="Trade Encore Logo" style="max-width: 150px;">
        </div>
        
        <h2 style="color: #2962ff; text-align: center;">Subscription Confirmation</h2>
        
        <p>Dear ${data.name},</p>
        
        <p>Thank you for subscribing to Trade Encore! Your account has been successfully activated.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Subscription Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.planType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Subscription Type:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.subscriptionType.charAt(0).toUpperCase() + data.subscriptionType.slice(1)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">₹${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.subscriptionDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Expiry Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.expiryOn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Payment ID:</strong></td>
              <td style="padding: 8px 0;">${data.paymentId}</td>
            </tr>
          </table>
        </div>
        
        <p>Your receipt is attached to this email. You can also view and download it from your dashboard.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@tradeencore.com" style="color: #2962ff;">support@tradeencore.com</a>.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #777;">
          <p>  Trade Encore. All rights reserved.</p>
          <p>
            <a href="https://tradeencore.com/terms" style="color: #2962ff; margin-right: 10px;">Terms of Service</a>
            <a href="https://tradeencore.com/privacy" style="color: #2962ff;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `;
    
    // Log the email details (for testing/development)
    console.log('Sending welcome email to:', data.email);
    console.log('Email subject:', subject);
    console.log('Email content:', htmlContent);
    
    // In a real implementation, you would use MailApp or GmailApp like this:
    /*
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlContent,
      attachments: [generatePdfReceipt(data)]
    });
    */
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send WhatsApp notification
 */
function sendWhatsAppNotification(data) {
  try {
    // Format the mobile number (ensure it has country code)
    let mobileNumber = data.mobile;
    if (!mobileNumber.startsWith('+')) {
      // Assuming Indian numbers, add +91 prefix if not present
      mobileNumber = mobileNumber.startsWith('91') ? '+' + mobileNumber : '+91' + mobileNumber;
    }
    
    // WhatsApp message template
    const message = `Hello ${data.name}! 

Thank you for subscribing to Trade Encore ${data.planType} plan.

Your subscription details:
• Plan: ${data.planType}
• Type: ${data.subscriptionType.charAt(0).toUpperCase() + data.subscriptionType.slice(1)}
• Valid until: ${data.expiryOn}

You can access your dashboard at: https://tradeencore.com/dashboard

For any assistance, please contact our support team.

Best regards,
Trade Encore Team`;
    
    // Log the WhatsApp details (for testing/development)
    console.log('Sending WhatsApp notification to:', mobileNumber);
    console.log('WhatsApp message:', message);
    
    // In a real implementation, you would use WhatsApp Business API like this:
    /*
    const whatsappApiUrl = 'https://graph.facebook.com/v17.0/' + WHATSAPP_PHONE_NUMBER_ID + '/messages';
    const payload = {
      messaging_product: 'whatsapp',
      to: mobileNumber,
      type: 'text',
      text: { body: message }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + WHATSAPP_API_TOKEN
      },
      payload: JSON.stringify(payload)
    };
    
    UrlFetchApp.fetch(whatsappApiUrl, options);
    */
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Generate PDF receipt
 */
function generatePdfReceipt(data) {
  try {
    // HTML content for the receipt
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Trade Encore - Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2962ff;
            padding-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 15px;
          }
          .receipt-title {
            font-size: 24px;
            color: #2962ff;
            margin: 0;
          }
          .receipt-id {
            font-size: 14px;
            color: #777;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table td {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .amount-row td {
            padding-top: 15px;
            font-weight: bold;
            border-top: 2px solid #eee;
            border-bottom: none;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="https://tradeencore.com/assets/logo.png" alt="Trade Encore Logo" class="logo">
            <h1 class="receipt-title">Payment Receipt</h1>
            <p class="receipt-id">Receipt ID: ${data.paymentId}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Customer Information</h2>
            <table>
              <tr>
                <td width="30%">Name:</td>
                <td>${data.name}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>${data.email}</td>
              </tr>
              ${data.mobile ? `<tr><td>Mobile:</td><td>${data.mobile}</td></tr>` : ''}
              <tr>
                <td>Date:</td>
                <td>${data.subscriptionDate}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Subscription Details</h2>
            <table>
              <tr>
                <td width="30%">Plan:</td>
                <td>${data.planType}</td>
              </tr>
              <tr>
                <td>Subscription Type:</td>
                <td>${data.subscriptionType.charAt(0).toUpperCase() + data.subscriptionType.slice(1)}</td>
              </tr>
              <tr>
                <td>Start Date:</td>
                <td>${data.subscriptionDate}</td>
              </tr>
              <tr>
                <td>Expiry Date:</td>
                <td>${data.expiryOn}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Payment Information</h2>
            <table>
              <tr>
                <td width="30%">Payment ID:</td>
                <td>${data.paymentId}</td>
              </tr>
              <tr>
                <td>Payment Method:</td>
                <td>Razorpay</td>
              </tr>
              <tr>
                <td>Payment Date:</td>
                <td>${data.subscriptionDate}</td>
              </tr>
              <tr class="amount-row">
                <td>Total Amount:</td>
                <td>₹${data.amount}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>  Trade Encore. All rights reserved.</p>
            <p>For any questions, please contact support@tradeencore.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Log the receipt generation (for testing/development)
    console.log('Generating PDF receipt for:', data.name);
    console.log('Receipt HTML content created');
    
    // In a real implementation, you would convert HTML to PDF and save it:
    /*
    const blob = Utilities.newBlob(receiptHtml, 'text/html', 'receipt.html');
    const pdf = blob.getAs('application/pdf');
    const fileId = DriveApp.createFile(pdf).getId();
    const receiptUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
    return receiptUrl;
    */
    
    // For now, return a dummy URL
    return 'https://tradeencore.com/receipts/' + data.paymentId + '.pdf';
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    return null;
  }
}

/**
 * Handle GET requests - serves the HTML interface for testing
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Trade Encore API')
    .setFaviconUrl('https://tradeencore.com/favicon.ico');
}
