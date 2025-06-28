/**
 * Trade Encore - Google Apps Script for Membership Management
 * 
 * This script serves as a backend proxy for the Trade Encore website to:
 * 1. Manage user accounts and verification
 * 2. Handle OTP verification via email and SMS
 * 3. Process payments and subscriptions (₹7 recharge)
 * 4. Store data in Google Sheets
 */

// Sheet Configuration
const SPREADSHEET_ID = '1joPmYGdtaz3aWTv13ACF_cJs3uP8LMKj_O1MeEPtfQY';
const USERS_SHEET = 'Users';
const OTPS_SHEET = 'OTPs';
const PAYMENTS_SHEET = 'Payments';

// Initialize sheets if they don't exist
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create Users sheet
  let usersSheet = ss.getSheetByName(USERS_SHEET);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(USERS_SHEET);
    usersSheet.getRange('A1:L1').setValues([[
      'Sr.No.',
      'Name',
      'Email',
      'Password',
      'Phone',
      'Plan Type',
      'Subscription Type',
      'Subscription Date',
      'Expiry Date',
      'Role',
      'Email Verified',
      'Phone Verified'
    ]]);
  }
  
  // Create OTPs sheet
  let otpsSheet = ss.getSheetByName(OTPS_SHEET);
  if (!otpsSheet) {
    otpsSheet = ss.insertSheet(OTPS_SHEET);
    otpsSheet.getRange('A1:E1').setValues([[
      'Email',
      'Phone',
      'Email OTP',
      'SMS OTP',
      'Expiry'
    ]]);
  }
  
  // Create Payments sheet
  let paymentsSheet = ss.getSheetByName(PAYMENTS_SHEET);
  if (!paymentsSheet) {
    paymentsSheet = ss.insertSheet(PAYMENTS_SHEET);
    paymentsSheet.getRange('A1:I1').setValues([[
      'Email',
      'Amount',
      'Status',
      'Transaction ID',
      'Created At',
      'Updated At',
      'Order ID',
      'Plan Type',
      'Payment ID'
    ]]);
  }
}

/**
 * Process GET requests to the web app
 */
function doGet(e) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Allow testing the script via web browser
  if (e.parameter && e.parameter.test === 'email') {
    return testEmailService();
  }
  
  // Handle action parameter for different operations
  if (e.parameter && e.parameter.action) {
    const action = e.parameter.action;
    
    // Handle email OTP sending
    if (action === 'sendEmailOTP' && e.parameter.email) {
      const email = e.parameter.email;
      console.log(`doGet: Received sendEmailOTP request for email: ${email}`);
      
      // Call the dedicated sendEmailOTP function
      try {
        const result = sendEmailOTP(email);
        console.log(`doGet: sendEmailOTP result:`, result);
        return result;
      } catch (error) {
        console.error(`doGet: Error in sendEmailOTP:`, error);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Failed to send email OTP: ' + (error.message || 'Unknown error')
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
      }
    }
    
    // Handle OTP verification
    if (action === 'verifyOTP' && e.parameter.email && e.parameter.emailOTP) {
      const email = e.parameter.email;
      const emailOTP = e.parameter.emailOTP;
      
      try {
        const result = verifyOTP(email, emailOTP);
        return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(headers);
      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Error verifying OTP: ' + (error.message || 'Unknown error')
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Trade Encore API is running'
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(headers);
}

// Test function to verify email service
function testEmailService(e) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  try {
    // Use the email parameter if provided, otherwise use the script owner's email
    let testEmail;
    
    // Check if email is provided in the request
    if (e && e.parameter && e.parameter.email) {
      testEmail = e.parameter.email;
      console.log('Using provided email for test:', testEmail);
    } else {
      // Try to get effective user's email (the script owner)
      try {
        testEmail = Session.getEffectiveUser().getEmail();
        console.log('Using effective user email for test:', testEmail);
        
        if (!testEmail || testEmail === '') {
          testEmail = Session.getActiveUser().getEmail();
          console.log('Using active user email for test:', testEmail);
          
          if (!testEmail || testEmail === '') {
            // Last resort fallback
            testEmail = 'test@example.com';
            console.log('Using fallback email for test:', testEmail);
          }
        }
      } catch (sessionError) {
        console.error('Error getting user email:', sessionError);
        testEmail = 'test@example.com'; // Fallback to fixed email
      }
    }
    
    // Log the test email being used
    console.log('Sending test email to:', testEmail);
    
    // Generate a test OTP for verification
    const testOTP = generateOTP();
    
    // Try to send email using GmailApp first (better deliverability)
    try {
      GmailApp.sendEmail(
        testEmail,
        'Trade Encore Email Service Test',
        `This is a test email from the Trade Encore system. Your test verification code is: ${testOTP}\n\nIf you received this, the email service is working correctly.`,
        {
          name: 'Trade Encore',
          replyTo: Session.getEffectiveUser().getEmail()
        }
      );
      console.log('Test email sent via GmailApp');
    } catch (gmailError) {
      console.log('GmailApp failed, falling back to MailApp:', gmailError);
      
      // Fall back to MailApp if GmailApp fails
      MailApp.sendEmail({
        to: testEmail,
        subject: 'Trade Encore Email Service Test',
        body: `This is a test email from the Trade Encore system. Your test verification code is: ${testOTP}\n\nIf you received this, the email service is working correctly.`,
        name: 'Trade Encore'
      });
      console.log('Test email sent via MailApp');
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Test email sent to ${testEmail}. Please check your inbox and spam folder.`,
      testOTP: testOTP,
      email: testEmail
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  } catch (error) {
    console.error('Error sending test email:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Failed to send test email: ' + (error.message || 'Unknown error'),
      error: JSON.stringify(error)
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

/**
 * Process POST requests to the web app
 */
function doPost(e) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight OPTIONS request
  if (e.method === 'OPTIONS') {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  try {
    // Parse the request
    let request;
    let action;
    
    // Handle both form data and JSON requests
    if (e.postData && e.postData.contents) {
      try {
        request = JSON.parse(e.postData.contents);
        action = request.action;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Try to get action from parameter
        action = e.parameter && e.parameter.action;
        request = e.parameter || {};
      }
    } else if (e.parameter) {
      // Handle URL parameters
      action = e.parameter.action;
      request = e.parameter;
    }
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Missing action parameter'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Route to the appropriate handler based on action
    let response;
    switch (action) {
      case 'register':
        response = handleRegistration(request);
        break;
      case 'login':
        response = handleLogin(request);
        break;
      case 'sendEmailOTP':
        response = sendEmailOTP(request.email || (request.email === undefined && e.parameter ? e.parameter.email : null));
        break;
      case 'sendSMSOTP':
        response = sendSMSOTP(request.phone || (request.phone === undefined && e.parameter ? e.parameter.phone : null));
        break;
      case 'verifyOTP':
        response = verifyOTP(request.email, request.emailOTP);
        break;
      case 'initiatePayment':
        response = initiatePayment(request);
        break;
      case 'verifyPayment':
        response = verifyPayment(request);
        break;
      case 'updateSubscription':
        response = updateSubscription(request);
        break;
      default:
        response = ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Invalid action: ' + action
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ensure response has headers
    if (response && typeof response.setHeaders === 'function') {
      return response.setHeaders(headers);
    }
    return response;
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error: ' + (error.message || 'Unknown error'),
      error: JSON.stringify(error)
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Handle user registration
function handleRegistration(request) {
  const { email, name, password, phone, planType, subscriptionType } = request;
  console.log('Registration request received:', JSON.stringify(request));
  
  // Validate required fields
  if (!email || !name || !password || !phone) {
    console.log('Registration failed: Missing required fields');
    return sendResponse(false, 'All fields are required');
  }
  
  try {
    // Check if user exists
    const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
    if (!userSheet) {
      console.error('Users sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    const users = userSheet.getDataRange().getValues();
    const existingUser = users.find(row => row[1] === email); // Email is in column B (index 1)
    
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return sendResponse(false, 'User already exists');
    }
    
    // Generate a new row number
    const lastRow = userSheet.getLastRow();
    const newRowNum = lastRow + 1;
    
    // Add new user - initially with email_verified = false
    // Format: Sr.No. | Name | Email | Password | Mobile Number | Plan type | Subscription Type | Subscription Date | Expiry on
    userSheet.appendRow([
      newRowNum, // Sr. No.
      name,
      email,
      password, // In production, this should be hashed
      phone,
      planType || '', // Plan type
      subscriptionType || '', // Subscription Type
      '', // Subscription Date
      '', // Expiry on
      'user', // Role
      false, // Email verified (will be set to true after OTP verification)
      false  // Phone verified (will be set to true after OTP verification)
    ]);
    
    console.log('User registered successfully:', email);
    
    // Generate and send OTP immediately after registration
    const otpResult = sendEmailOTP(email);
    console.log('OTP sent during registration:', otpResult);
    
    return sendResponse(true, 'Registration successful, please verify your email');
  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(false, 'Registration failed: ' + (error.message || 'Unknown error'));
  }
}

// Handle user login
function handleLogin(request) {
  const { email, password } = request;
  
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
  const users = userSheet.getDataRange().getValues();
  const user = users.find(row => row[0] === email && row[2] === password);
  
  if (!user) {
    return sendResponse(false, 'Invalid credentials');
  }
  
  return sendResponse(true, 'Login successful', {
    email: user[0],
    name: user[1],
    phone: user[3],
    role: user[4],
    emailVerified: user[5],
    phoneVerified: user[6],
    subscriptionType: user[7],
    subscriptionDate: user[8],
    expiryDate: user[9]
  });
}

// Send email OTP
function sendEmailOTP(email) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  console.log(`sendEmailOTP called for email: ${email}`);
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('Invalid email format:', email);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid email format'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
  
  try {
    // Check if email exists in users sheet
    const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
    if (!usersSheet) {
      console.error('Users sheet not found');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Server configuration error'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Get all users data
    const usersData = usersSheet.getDataRange().getValues();
    console.log(`Retrieved ${usersData.length} rows from Users sheet`);
    
    // Debug the first few rows to understand structure
    if (usersData.length > 0) {
      console.log('First row (headers):', JSON.stringify(usersData[0]));
      if (usersData.length > 1) {
        console.log('Second row (first user):', JSON.stringify(usersData[1]));
      }
    }
    
    // Find user by email (email is in column C, index 2)
    const userRowIndex = usersData.findIndex(row => {
      if (!row || row.length < 3) return false;
      return String(row[2]).trim().toLowerCase() === email.toLowerCase();
    });
    
    console.log(`User search result for ${email}: row index ${userRowIndex}`);
    
    // Generate a new 6-digit OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes
    
    console.log(`Generated OTP for email ${email}: ${otp}, expires at ${expiry.toISOString()}`);
    
    // Get or create OTP sheet
    try {
      let otpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(OTPS_SHEET);
      if (!otpSheet) {
        console.log('OTP sheet not found, creating it');
        otpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(OTPS_SHEET);
        otpSheet.appendRow(['Email', 'Phone', 'EmailOTP', 'PhoneOTP', 'Expiry']);
        console.log('OTP sheet created successfully');
      }
      
      // Get all OTPs
      const otps = otpSheet.getDataRange().getValues();
      console.log(`Retrieved ${otps.length} rows from OTPs sheet`);
      
      // Remove existing OTPs for this email
      let existingRowIndex = -1;
      for (let i = 1; i < otps.length; i++) { // Skip header row
        if (otps[i][0] && String(otps[i][0]).trim().toLowerCase() === email.toLowerCase()) {
          existingRowIndex = i;
          break;
        }
      }
      
      if (existingRowIndex > 0) { // Skip header row
        console.log(`Removing existing OTP for email: ${email} at row: ${existingRowIndex + 1}`);
        try {
          otpSheet.deleteRow(existingRowIndex + 1);
          console.log(`Successfully deleted existing OTP row`);
        } catch (deleteError) {
          console.error(`Error deleting existing OTP: ${deleteError.message}`);
          // Continue execution
        }
      }
      
      // Store new OTP with timestamp
      console.log(`Storing new OTP for email: ${email}`);
      try {
        otpSheet.appendRow([email, '', otp, '', expiry.toISOString()]);
        console.log(`Successfully added new OTP row`);
      } catch (appendError) {
        console.error(`Error appending OTP row: ${appendError.message}`);
        // Try an alternative approach
        try {
          const lastRow = otpSheet.getLastRow();
          otpSheet.getRange(lastRow + 1, 1, 1, 5).setValues([[email, '', otp, '', expiry.toISOString()]]);
          console.log(`Successfully added new OTP row using alternative method`);
        } catch (alternativeError) {
          console.error(`Alternative method also failed: ${alternativeError.message}`);
          // Continue execution, we'll still try to send the email
        }
      }
      
      // If we found the user, update their row with the OTP for reference
      if (userRowIndex > 0) { // Skip header row
        try {
          // Email verification column is K (index 10)
          const emailVerifiedColumnIndex = 10;
          // Store OTP in a temporary column for reference (column M, index 12)
          const tempOtpColumnIndex = 12;
          
          // Make sure the row has enough columns
          if (usersData[userRowIndex].length <= tempOtpColumnIndex) {
            console.log(`Extending user row to accommodate OTP column`);
            // Fill with empty values up to the column we need
            const emptyValues = Array(tempOtpColumnIndex - usersData[userRowIndex].length + 1).fill('');
            usersSheet.getRange(userRowIndex + 1, usersData[userRowIndex].length + 1, 1, emptyValues.length).setValues([emptyValues]);
          }
          
          usersSheet.getRange(userRowIndex + 1, tempOtpColumnIndex + 1).setValue(otp);
          console.log(`Updated user row ${userRowIndex + 1} with OTP ${otp}`);
        } catch (updateError) {
          console.error(`Failed to update user row with OTP: ${updateError.message}`);
          // Continue execution, this is not critical
        }
      }
    } catch (sheetError) {
      console.error(`Error handling OTP sheet: ${sheetError.message}`);
      // Continue execution, we'll still try to send the email
    }
    
    // Prepare email content with better formatting
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
    
    // First attempt: GmailApp with HTML (most reliable for proper sender identification)
    try {
      console.log(`Sending email to: ${email} using GmailApp with HTML`);
      GmailApp.sendEmail(
        email,
        emailSubject,
        emailBody, // Plain text fallback
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
        
        // Third attempt: MailApp without explicit sender (fallback)
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
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Verification code sent to your email',
        email: email,
        expiresAt: expiry.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    } else {
      // Email sending failed, but OTP is still stored in sheet
      console.error(`All email sending methods failed for ${email}: ${errorMessage}`);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Failed to send email OTP. Please try again or contact support.',
        error: errorMessage
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
  } catch (error) {
    console.error('General error in sendEmailOTP:', error);
    console.error('Error details:', JSON.stringify(error));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error processing OTP request'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Send SMS OTP
function sendSMSOTP(phone) {
  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes
  
  const otpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(OTPS_SHEET);
  const otps = otpSheet.getDataRange().getValues();
  
  // Remove existing OTPs for this phone
  const existingRow = otps.findIndex(row => row[1] === phone);
  if (existingRow > 0) { // Skip header row
    otpSheet.deleteRow(existingRow + 1);
  }
  
  // Store new OTP
  otpSheet.appendRow(['', phone, '', otp, expiry.toISOString()]);
  
  // Note: Implement actual SMS sending here
  // For now, we'll just return the OTP for testing
  return sendResponse(true, 'OTP sent successfully (check console for testing)');
}

// Verify OTP
function verifyOTP(email, emailOTP) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  console.log(`verifyOTP called with email: ${email}, OTP: ${emailOTP}`);
  
  if (!email || !emailOTP) {
    console.error('Missing required parameters:', { email: !!email, emailOTP: !!emailOTP });
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Email and OTP are required'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
  
  try {
    // Get OTP sheet
    const otpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(OTPS_SHEET);
    if (!otpSheet) {
      console.error('OTP sheet not found');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Server configuration error'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Get all OTPs
    const otps = otpSheet.getDataRange().getValues();
    console.log(`Found ${otps.length - 1} OTP entries in the sheet`);
    
    // Find matching OTP row
    const otpRow = otps.findIndex(row => {
      if (!row[0] || !row[2]) return false;
      const rowEmail = String(row[0]).trim().toLowerCase();
      const rowOTP = String(row[2]).trim();
      const match = rowEmail === email.toLowerCase() && rowOTP === emailOTP;
      if (rowEmail === email.toLowerCase()) {
        console.log(`Found email match: ${rowEmail}, OTP match: ${match}, stored OTP: ${rowOTP}`);
      }
      return match;
    });
    
    console.log(`OTP row index: ${otpRow}`);
    
    if (otpRow === -1) {
      console.error(`No matching OTP found for email: ${email}`);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid verification code'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Check if OTP is expired
    const expiryDate = new Date(otps[otpRow][4]);
    const now = new Date();
    
    console.log(`OTP expiry: ${expiryDate}, Current time: ${now}`);
    
    if (expiryDate < now) {
      console.error(`OTP expired at ${expiryDate}, current time: ${now}`);
      
      // Delete expired OTP
      otpSheet.deleteRow(otpRow + 1);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // OTP is valid, update user verification status
    const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
    if (!usersSheet) {
      console.error('Users sheet not found');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Server configuration error'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    const users = usersSheet.getDataRange().getValues();
    // Email is in column C (index 2)
    const userRowIndex = users.findIndex(row => {
      if (!row[2]) return false;
      return String(row[2]).trim().toLowerCase() === email.toLowerCase();
    });
    
    console.log(`User row index: ${userRowIndex}`);
    
    if (userRowIndex > 0) { // Skip header row
      try {
        // Update email verification status (column K, index 10)
        usersSheet.getRange(userRowIndex + 1, 11).setValue(true); // Email verified
        // Update phone verification status (column L, index 11) - we're treating both as verified
        usersSheet.getRange(userRowIndex + 1, 12).setValue(true); // Phone verified
        // Add verification timestamp
        usersSheet.getRange(userRowIndex + 1, 13).setValue(new Date().toISOString()); // Verification date
        console.log(`Updated verification status for user: ${email} at row ${userRowIndex + 1}`);
      } catch (updateError) {
        console.error(`Error updating user verification status: ${updateError.message}`);
        // Continue execution, we'll still return success since OTP was valid
      }
    } else {
      console.log(`User not found in users sheet: ${email}, but OTP was valid`);
    }
    
    // Delete the used OTP
    try {
      otpSheet.deleteRow(otpRow + 1);
      console.log(`Deleted used OTP for email: ${email}`);
    } catch (deleteError) {
      console.error(`Error deleting used OTP: ${deleteError.message}`);
      // Continue execution, this is not critical
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Verification successful! You can now proceed with your account setup.',
      verified: true
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    console.error('Error details:', JSON.stringify(error));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error verifying OTP. Please try again.'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Initiate payment
function initiatePayment(request) {
  const email = request.email;
  const amount = request.amount || 7; // Default to ₹7 if not specified
  const planType = request.planType || 'test';
  
  if (!email) {
    return sendResponse(false, 'Email is required');
  }
  
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
  const users = userSheet.getDataRange().getValues();
  const user = users.find(row => row[0] === email);
  
  if (!user) {
    return sendResponse(false, 'User not found');
  }
  
  const transactionId = Utilities.getUuid();
  const orderId = 'order_' + Utilities.getUuid().replace(/-/g, '');
  const now = new Date().toISOString();
  
  // Record payment
  const paymentSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PAYMENTS_SHEET);
  paymentSheet.appendRow([
    email,
    amount,
    'pending',
    transactionId,
    now,
    now,
    orderId,
    planType
  ]);
  
  return sendResponse(true, 'Payment initiated', { 
    transactionId: transactionId,
    orderId: orderId,
    amount: amount * 100 // Convert to paise for Razorpay
  });
}

// Verify payment
function verifyPayment(request) {
  const { paymentId, orderId, signature } = request;
  
  if (!orderId) {
    return sendResponse(false, 'Order ID is required');
  }
  
  // Find payment by orderId
  const paymentSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PAYMENTS_SHEET);
  const payments = paymentSheet.getDataRange().getValues();
  const paymentRowIndex = payments.findIndex(row => row[6] === orderId); // orderId is in column 7 (index 6)
  
  if (paymentRowIndex <= 0) { // Skip header row
    return sendResponse(false, 'Payment not found');
  }
  
  // For testing, we'll mark the payment as successful
  // In production, implement actual payment verification logic with signature
  const now = new Date().toISOString();
  paymentSheet.getRange(paymentRowIndex + 1, 3).setValue('success'); // Update status
  paymentSheet.getRange(paymentRowIndex + 1, 6).setValue(now); // Update timestamp
  if (paymentId) {
    paymentSheet.getRange(paymentRowIndex + 1, 9).setValue(paymentId); // Store payment ID
  }
  
  // Update user subscription
  const email = payments[paymentRowIndex][0];
  const planType = payments[paymentRowIndex][7] || 'test'; // planType is in column 8 (index 7)
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
  const users = userSheet.getDataRange().getValues();
  const userRowIndex = users.findIndex(row => row[0] === email);
  
  if (userRowIndex > 0) { // Skip header row
    const subscriptionDate = new Date();
    let expiryDate = new Date();
    
    // Set expiry based on plan type
    if (planType === 'test') {
      expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
    } else if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1-month subscription
    } else if (planType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year subscription
    } else if (planType === 'lifetime') {
      expiryDate = new Date(2099, 11, 31); // Far future date for lifetime
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Default to 1 month
    }
    
    // Update subscription details
    userSheet.getRange(userRowIndex + 1, 8).setValue(planType); // Subscription type
    userSheet.getRange(userRowIndex + 1, 9).setValue(subscriptionDate.toISOString()); // Subscription date
    userSheet.getRange(userRowIndex + 1, 10).setValue(expiryDate.toISOString()); // Expiry date
    
    // Send confirmation email
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'Trade Encore Subscription Confirmation',
        body: `Thank you for subscribing to Trade Encore ${planType} plan!\n\nYour subscription is now active and will expire on ${expiryDate.toDateString()}.\n\nHappy trading!\n\nTrade Encore Team`
      });
    } catch (e) {
      console.error('Failed to send confirmation email:', e);
    }
  }
  
  return sendResponse(true, 'Payment successful', {
    email: email,
    planType: planType,
    expiryDate: expiryDate ? expiryDate.toISOString() : null
  });
}

// Helper function to generate 6-digit OTP
function generateOTP() {
  // Ensure exactly 6 digits with leading zeros if needed
  return String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
}

// Helper function to send JSON response
function sendResponse(success, message, data = null) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  return ContentService.createTextOutput(JSON.stringify({
    success,
    message,
    ...data && { data }
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(headers);
}

// Handle subscription update
function updateSubscription(formData) {
  try {
    // Open the spreadsheet by ID
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET);
    
    // Check if user already exists in the sheet
    const existingUser = findUserByEmail(formData.email);
    
    if (existingUser.found) {
      // User exists, update their row instead of creating a duplicate
      const rowIndex = existingUser.rowIndex;
      
      // Update user data
      if (formData.name) sheet.getRange(rowIndex, 2).setValue(formData.name); // Name (column B)
      if (formData.password) sheet.getRange(rowIndex, 4).setValue(formData.password); // Password (column D)
      if (formData.mobile) sheet.getRange(rowIndex, 5).setValue(formData.mobile); // Mobile (column E)
      if (formData.planType) sheet.getRange(rowIndex, 6).setValue(formData.planType); // Plan type (column F)
      if (formData.subscriptionType) sheet.getRange(rowIndex, 7).setValue(formData.subscriptionType); // Subscription Type (column G)
      
      // Always update subscription date and expiry on recharge
      const subscriptionDate = formData.subscriptionDate || new Date().toISOString().split('T')[0];
      
      // Calculate expiry date based on subscription type if not provided
      let expiryOn = formData.expiryOn;
      if (!expiryOn && formData.subscriptionType) {
        const currentDate = new Date();
        let expiryDate = new Date(currentDate);
        
        if (formData.subscriptionType === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else if (formData.subscriptionType === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else if (formData.subscriptionType === 'lifetime') {
          expiryDate = new Date(2099, 11, 31); // Far future date for lifetime
        } else if (formData.subscriptionType === 'trial') {
          expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
        } else {
          // Default to 1 month if subscription type is not recognized
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          console.log('Unrecognized subscription type: ' + formData.subscriptionType + ', defaulting to monthly');
        }
        
        expiryOn = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log('Calculated expiry date: ' + expiryOn + ' for subscription type: ' + formData.subscriptionType);
      }
      
      // Send email notification for subscription renewal
      if (formData.mobile && formData.action === 'recharge') {
        MailApp.sendEmail({
          to: formData.email,
          subject: 'Trade Encore Subscription Renewal',
          body: `Your subscription has been renewed successfully. Your new expiry date is: ${expiryOn}`
        });
      }
      
      return sendResponse(true, 'User data updated in sheet', {
        'srNo': existingUser.rowIndex - 1, // Convert to 0-based index for consistency
        'email': formData.email,
        'expiryOn': expiryOn
      });
    } else {
      // User doesn't exist, create a new row
      const lastRow = sheet.getLastRow();
      const srNo = lastRow > 0 ? lastRow : 1;
      
      // Prepare the data row according to the required format:
      // Sr. No.	Name of the user	Email	Password	Mobile Number	Plan type	Subscription Type	Subscription Date	Expiry on
      const dataRow = [
        srNo, // Sr. No.
        formData.name || '', // Name of the user
        formData.email || '', // Email
        formData.password || '', // Password
        formData.mobile || '', // Mobile Number
        formData.planType || '', // Plan type (e.g., Fin Silver, Gold, Platinum)
        formData.subscriptionType || '', // Subscription Type (monthly, yearly, lifetime)
        formData.subscriptionDate || new Date().toISOString().split('T')[0], // Subscription Date
        expiryOn || '' // Expiry on
      ];
      
      // Append the data to the sheet
      sheet.appendRow(dataRow);
      
      // Return success response
      return ContentService.createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'New user added to sheet',
        'data': {
          'srNo': srNo,
          'email': formData.email,
          'expiryOn': expiryOn
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return sendResponse(false, 'Failed to update subscription: ' + error.message);
  }
}

// Process GET requests to the web app (for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'active',
    'message': 'Trade Encore Membership API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Utility function to find a user by email
function findUserByEmail(email) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and search for the email
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === email) { // Email is in column C (index 2)
        return {
          found: true,
          rowIndex: i + 1, // +1 because array is 0-indexed but sheets are 1-indexed
          userData: {
            srNo: data[i][0],
            name: data[i][1],
            email: data[i][2],
            mobile: data[i][4],
            planType: data[i][5],
            subscriptionType: data[i][6],
            subscriptionDate: data[i][7],
            expiryOn: data[i][8]
          }
        };
      }
    }
    
    return { found: false };
  } catch (error) {
    console.error('Error finding user:', error);
    return { found: false, error: error.toString() };
  }
}

// Update a user's subscription details
function updateUserSubscription(email, subscriptionData) {
  try {
    const user = findUserByEmail(email);
    if (!user.found) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'User not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const rowIndex = user.rowIndex;
    
    // Update subscription details
    if (subscriptionData.planType) {
      // Plan type should be the name of the plan (e.g., Fin Silver, Gold, Platinum)
      sheet.getRange(rowIndex, 6).setValue(subscriptionData.planType); // Plan type (column F)
    }
    
    if (subscriptionData.subscriptionType) {
      // Subscription type should be 'monthly' or 'yearly'
      sheet.getRange(rowIndex, 7).setValue(subscriptionData.subscriptionType); // Subscription Type (column G)
    }
    
    // Update subscription date
    const subscriptionDate = subscriptionData.subscriptionDate || new Date().toISOString().split('T')[0];
    sheet.getRange(rowIndex, 8).setValue(subscriptionDate); // Subscription Date (column H)
    
    // Calculate and update expiry date
    let expiryOn = subscriptionData.expiryOn;
    if (!expiryOn && subscriptionData.subscriptionType) {
      const currentDate = new Date();
      let expiryDate = new Date(currentDate);
      
      if (subscriptionData.subscriptionType === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subscriptionData.subscriptionType === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (subscriptionData.subscriptionType === 'lifetime') {
        expiryDate = new Date(2099, 11, 31); // Far future date for lifetime
      } else if (subscriptionData.subscriptionType === 'trial') {
        expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
      }
      
      expiryOn = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    if (expiryOn) {
      sheet.getRange(rowIndex, 9).setValue(expiryOn); // Expiry on (column I)
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        email: email,
        planType: subscriptionData.planType,
        subscriptionType: subscriptionData.subscriptionType,
        subscriptionDate: subscriptionDate,
        expiryOn: expiryOn
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error updating subscription:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Verify user credentials against the sheet data
function verifyUser(email, password) {
  try {
    // Find the user by email
    const user = findUserByEmail(email);
    
    if (!user.found) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'User not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet data
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Get the row index (subtract 1 because array is 0-indexed but rowIndex is 1-indexed)
    const rowIndex = user.rowIndex - 1;
    
    // Check if password matches (password is in column D, index 3)
    const storedPassword = data[rowIndex][3];
    
    // For OAuth users, the password might be 'oauth-login'
    const isOAuthUser = storedPassword === 'oauth-login';
    
    // If it's an OAuth user or the password matches
    if (isOAuthUser || storedPassword === password) {
      // Check if subscription is expired
      const today = new Date();
      const expiryOn = data[rowIndex][8]; // Expiry date is in column I, index 8
      const expiryDate = expiryOn ? new Date(expiryOn) : null;
      const isExpired = expiryDate ? today > expiryDate : true;
      
      // Get user data
      const userData = {
        name: data[rowIndex][1], // Name is in column B, index 1
        email: email,
        mobile: data[rowIndex][4], // Mobile is in column E, index 4
        subscription: {
          planType: data[rowIndex][5], // Plan type is in column F, index 5
          subscriptionType: data[rowIndex][6], // Subscription type is in column G, index 6
          subscriptionDate: data[rowIndex][7], // Subscription date is in column H, index 7
          expiryOn: expiryOn
        }
      };
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        userData: userData
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error verifying user: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
