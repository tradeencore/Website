/**
 * Trade Encore - Simplified OTP System
 * 
 * This script handles user registration and OTP verification using a single Sheet1
 * with the exact structure specified by the client.
 */

// Spreadsheet ID - Replace with your actual spreadsheet ID
const SPREADSHEET_ID = '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY';
const SHEET_NAME = 'Sheet1';

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

/**
 * Process POST requests to the web app
 */
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  
  console.log(`doPost called with action: ${action}`);
  
  switch (action) {
    case 'register':
      return handleRegistration(params);
    case 'sendOTP':
      return sendEmailOTP(params.email);
    case 'verifyOTP':
      return verifyOTP(params.email, params.otp);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
  }
}

/**
 * Process GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API is working',
    params: e.parameter
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(CORS_HEADERS);
}

/**
 * Handle user registration
 * 
 * Expected params:
 * - name: User's name
 * - email: User's email
 * - password: User's password
 * - phone: User's phone number
 * - planType: Optional plan type
 * - subscriptionType: Optional subscription type
 */
function handleRegistration(params) {
  const { email, name, password, phone, planType, subscriptionType } = params;
  console.log('Registration request received:', JSON.stringify(params));
  
  // Validate required fields
  if (!email || !name || !password || !phone) {
    console.log('Registration failed: Missing required fields');
    return sendResponse(false, 'All fields are required');
  }
  
  try {
    // Get the sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    // Check if user exists
    const data = sheet.getDataRange().getValues();
    const existingUser = data.find(row => row[2] === email); // Email is in column C (index 2)
    
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return sendResponse(false, 'User already exists');
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Generate a new row number
    const lastRow = sheet.getLastRow();
    const newRowNum = lastRow; // Last row number
    
    // Add new user with OTP
    // Format: Sr. No. | Name | Email | OTP | Password | Mobile Number | Plan type | Subscription Type | Subscription Date | Expiry on
    sheet.appendRow([
      newRowNum, // Sr. No.
      name, // Name of the user
      email, // Email
      otp, // OTP
      password, // Password
      phone, // Mobile Number
      planType || '', // Plan type
      subscriptionType || '', // Subscription Type
      '', // Subscription Date
      '' // Expiry on
    ]);
    
    console.log('User registered successfully:', email);
    
    // Send OTP immediately after registration
    const otpResult = sendEmailOTP(email);
    console.log('OTP sent during registration:', otpResult);
    
    return sendResponse(true, 'Registration successful, please verify your email');
  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(false, 'Registration failed: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Send email OTP
 */
function sendEmailOTP(email) {
  console.log(`sendEmailOTP called for email: ${email}`);
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('Invalid email format:', email);
    return sendResponse(false, 'Invalid email format');
  }
  
  try {
    // Get the sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    // Find user by email
    const data = sheet.getDataRange().getValues();
    console.log(`Retrieved ${data.length} rows from sheet`);
    
    // Find user row index (email is in column C, index 2)
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][2] && String(data[i][2]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    console.log(`User search result for ${email}: row index ${userRowIndex}`);
    
    if (userRowIndex === -1) {
      console.error(`User not found: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    console.log(`Generated OTP for email ${email}: ${otp}`);
    
    // Update OTP in the sheet (OTP is in column D, index 3)
    sheet.getRange(userRowIndex + 1, 4).setValue(otp);
    console.log(`Updated OTP in sheet for ${email}: ${otp}`);
    
    // Prepare email content
    const emailSubject = 'Trade Encore - Your Verification Code';
    const emailBody = `
      Dear Trade Encore Member,

      Your verification code is: ${otp}

      This code will expire in 10 minutes.

      If you did not request this code, please ignore this email.

      Best regards,
      Trade Encore Team
    `;
    
    // Create HTML version for better email appearance
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h2 style="color: #2c3e50;">Trade Encore</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e9ecef; border-top: none;">
          <p>Dear Trade Encore Member,</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f8f9fa; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Best regards,<br>Trade Encore Team</p>
        </div>
      </div>
    `;
    
    // Send email with multiple attempts
    let emailSent = false;
    let errorMessage = '';
    
    // Get the script owner's email address for proper sender identification
    const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
    console.log(`Script owner email: ${scriptOwnerEmail}`);
    
    // First attempt: GmailApp with HTML
    try {
      console.log(`Sending email to: ${email} using GmailApp with HTML`);
      GmailApp.sendEmail(
        email,
        emailSubject,
        emailBody,
        {
          name: 'Trade Encore',
          from: scriptOwnerEmail,
          replyTo: scriptOwnerEmail,
          htmlBody: htmlBody
        }
      );
      emailSent = true;
      console.log('Email sent successfully using GmailApp with HTML');
    } catch (error1) {
      errorMessage = `GmailApp HTML failed: ${error1.message}`;
      console.error(errorMessage);
      
      // Second attempt: MailApp with explicit sender
      try {
        console.log(`Sending email to: ${email} using MailApp with explicit sender`);
        MailApp.sendEmail({
          to: email,
          subject: emailSubject,
          body: emailBody,
          htmlBody: htmlBody,
          name: 'Trade Encore',
          from: scriptOwnerEmail,
          replyTo: scriptOwnerEmail
        });
        emailSent = true;
        console.log('Email sent successfully using MailApp with explicit sender');
      } catch (error2) {
        errorMessage += `, MailApp with sender failed: ${error2.message}`;
        console.error(`MailApp with sender failed: ${error2.message}`);
        
        // Third attempt: MailApp without explicit sender
        try {
          console.log(`Sending email to: ${email} using MailApp without explicit sender`);
          MailApp.sendEmail({
            to: email,
            subject: emailSubject,
            body: emailBody,
            htmlBody: htmlBody,
            name: 'Trade Encore'
          });
          emailSent = true;
          console.log('Email sent successfully using MailApp without explicit sender');
        } catch (error3) {
          errorMessage += `, MailApp without sender failed: ${error3.message}`;
          console.error(`MailApp without sender failed: ${error3.message}`);
        }
      }
    }
    
    if (emailSent) {
      return sendResponse(true, 'Verification code sent to your email', {email: email});
    } else {
      console.error(`All email sending methods failed for ${email}: ${errorMessage}`);
      return sendResponse(false, 'Failed to send email OTP. Please try again or contact support.', {error: errorMessage});
    }
  } catch (error) {
    console.error('General error in sendEmailOTP:', error);
    return sendResponse(false, 'Server error processing OTP request');
  }
}

/**
 * Verify OTP
 */
function verifyOTP(email, otp) {
  console.log(`verifyOTP called for email: ${email}, OTP: ${otp}`);
  
  if (!email || !otp) {
    console.error('Missing email or OTP');
    return sendResponse(false, 'Email and OTP are required');
  }
  
  try {
    // Get the sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    // Find user by email
    const data = sheet.getDataRange().getValues();
    
    // Find user row index (email is in column C, index 2)
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][2] && String(data[i][2]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Check if OTP matches (OTP is in column D, index 3)
    const storedOTP = String(data[userRowIndex][3]).trim();
    
    if (storedOTP === otp) {
      console.log(`OTP verified successfully for ${email}`);
      
      // Clear OTP after successful verification
      sheet.getRange(userRowIndex + 1, 4).setValue('VERIFIED');
      
      // You can add additional columns for verification status if needed
      
      return sendResponse(true, 'Email verified successfully');
    } else {
      console.error(`OTP verification failed for ${email}: ${otp} != ${storedOTP}`);
      return sendResponse(false, 'Invalid verification code');
    }
  } catch (error) {
    console.error('General error in verifyOTP:', error);
    return sendResponse(false, 'Server error processing verification request');
  }
}

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Helper function to send JSON response
 */
function sendResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
}

/**
 * Test function to verify email service
 */
function testEmailService() {
  try {
    // Get the script owner's email
    const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
    const otp = generateOTP();
    
    // Send a test email
    GmailApp.sendEmail(
      scriptOwnerEmail,
      'Test Email from Trade Encore App',
      `This is a test email from the Trade Encore app. Your test OTP is: ${otp}`,
      {
        name: 'Trade Encore',
        replyTo: scriptOwnerEmail
      }
    );
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Test email sent to ${scriptOwnerEmail}`,
      scriptOwner: scriptOwnerEmail,
      testOTP: otp
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Failed to send test email',
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
  }
}
