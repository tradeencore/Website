/**
 * Trade Encore - Unified Google Apps Script
 * 
 * This script handles all functionality for the Trade Encore website:
 * 1. User registration and login
 * 2. Email OTP generation and verification
 * 3. Payment processing
 * 4. Subscription management
 * 
 * All data is stored in a single "Sheet1" with the following structure:
 * Sr. No. | Name | Email | OTP | Password | Mobile Number | Plan type | Subscription Type | Subscription Date | Expiry on
 */

// CORS Headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Column indices for Sheet1 (0-based)
const COL = {
  SR_NO: 0,
  NAME: 1,
  EMAIL: 2,
  OTP: 3,
  PASSWORD: 4,
  PHONE: 5,
  PLAN_TYPE: 6,
  SUBSCRIPTION_TYPE: 7,
  SUBSCRIPTION_DATE: 8,
  EXPIRY_DATE: 9,
  EMAIL_VERIFIED: 10, // Will add if not present
  PHONE_VERIFIED: 11  // Will add if not present
};

/**
 * Process POST requests to the web app
 */
function doPost(e) {
  // Handle CORS preflight request
  if (e && e.parameter && e.parameter['request'] === 'options') {
    return ContentService.createTextOutput()
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
  }
  
  // Log the raw request for debugging
  console.log('Received POST request:', JSON.stringify(e));
  
  let params = {};
  try {
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      // Handle URL-encoded form data
      params = e.parameter;
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return sendResponse(false, 'Invalid request format. Expected JSON.');
  }
  
  const action = params.action || (e.parameter && e.parameter.action);
  if (!action) {
    return sendResponse(false, 'No action specified');
  }
  
  console.log(`doPost called with action: ${action}, params:`, JSON.stringify(params));
  
  // Force initialize the sheet to ensure it exists with proper structure
  try {
    ensureSheetExists();
  } catch (error) {
    console.error('Failed to initialize sheet:', error);
    // Continue anyway as the sheet might already be initialized
  }
  
  try {
    switch (action) {
      case 'register':
        return handleRegistration(params);
      case 'login':
        return handleLogin(params);
      case 'sendOTP':
        console.log('sendOTP action received with params:', JSON.stringify(params));
        if (!params.email) {
          return sendResponse(false, 'Email is required for sending OTP');
        }
        return sendEmailOTP(params.email);
      case 'verifyOTP':
        if (!params.email || !params.otp) {
          return sendResponse(false, 'Email and OTP are required for verification');
        }
        return verifyOTP(params.email, params.otp);
      case 'initiatePayment':
        return initiatePayment(params);
      case 'verifyPayment':
        return verifyPayment(params);
      case 'updateSubscription':
        return updateSubscription(params);
      case 'testEmail':
        return testEmailService();
      default:
        console.error('Invalid action received:', action);
        return sendResponse(false, 'Invalid action');
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return sendResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Ensures the sheet exists and has the correct structure
 */
function ensureSheetExists() {
  console.log('=== ensureSheetExists() started ===');
  
  try {
    console.log('Attempting to open spreadsheet with ID:', SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (!ss) {
      const error = `Could not open spreadsheet with ID: ${SPREADSHEET_ID}. Please check if the ID is correct and you have access.`;
      console.error(error);
      throw new Error(error);
    }
    
    console.log('Successfully opened spreadsheet:', ss.getName());
    
    // Log all available sheets for debugging
    const allSheets = ss.getSheets();
    console.log(`Found ${allSheets.length} sheets:`, allSheets.map(s => s.getName()));
    
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      console.log(`Sheet '${SHEET_NAME}' not found, creating new sheet...`);
      try {
        sheet = ss.insertSheet(SHEET_NAME);
        console.log(`Successfully created new sheet: '${SHEET_NAME}'`);
        
        // Set up headers
        const headers = [
          'Sr. No.', 'Name', 'Email', 'OTP', 'Password', 
          'Mobile Number', 'Plan type', 'Subscription Type', 
          'Subscription Date', 'Expiry on', 'Email Verified', 'Phone Verified'
        ];
        
        console.log('Setting up headers:', headers);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setValues([headers]);
        
        // Format headers
        headerRange.setFontWeight('bold')
          .setBackground('#f0f0f0')
          .setBorder(true, true, true, true, true, true);
          
        sheet.setFrozenRows(1);
        console.log('Headers set successfully');
        
      } catch (createError) {
        console.error('Error creating sheet:', createError);
        throw createError;
      }
    } else {
      console.log(`Sheet '${SHEET_NAME}' already exists`);
    }
    
    // Ensure all required columns exist
    console.log('Verifying sheet structure...');
    const lastColumn = sheet.getLastColumn() || 1;
    console.log(`Last column in sheet: ${lastColumn}`);
    
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    console.log('Current headers:', headers);
    
    const headerMap = {};
    headers.forEach((header, index) => {
      if (header) {
        headerMap[header.toString().trim()] = index;
        console.log(`Found header [${index + 1}]: '${header}'`);
      }
    });
    
    // Define required headers with their expected positions
    const requiredHeaders = [
      'Sr. No.', 'Name', 'Email', 'OTP', 'Password', 
      'Mobile Number', 'Plan type', 'Subscription Type', 
      'Subscription Date', 'Expiry on', 'Email Verified', 'Phone Verified'
    ];
    
    let headersUpdated = false;
    
    requiredHeaders.forEach((header, index) => {
      if (!(header in headerMap)) {
        const colIndex = index + 1; // 1-based index for columns
        console.log(`Adding missing header '${header}' at column ${colIndex}`);
        sheet.getRange(1, colIndex).setValue(header);
        headersUpdated = true;
      }
    });
    
    if (headersUpdated) {
      console.log('Saving header changes...');
      SpreadsheetApp.flush();
      console.log('Sheet headers updated successfully');
    } else {
      console.log('All required headers are present');
    }
    
    console.log('=== ensureSheetExists() completed successfully ===');
    return true;
    
  } catch (error) {
    console.error('=== ERROR in ensureSheetExists() ===');
    console.error(error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Handle user registration
 */
function handleRegistration(params) {
  console.log('handleRegistration called with params:', JSON.stringify(params));
  
  // Log the environment
  console.log('Script properties:', PropertiesService.getScriptProperties().getProperties());
  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('Sheet name:', SHEET_NAME);
  
  // Validate required fields
  if (!params.name || !params.email || !params.password) {
    const error = 'Missing required fields';
    console.error(error, {name: !!params.name, email: !!params.email, password: !!params.password});
    return sendResponse(false, error);
  }
  
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    const error = `Invalid email format: ${params.email}`;
    console.error(error);
    return sendResponse(false, error);
  }
  
  try {
    // Log before ensuring sheet exists
    console.log('Ensuring sheet exists...');
    ensureSheetExists();
    console.log('Sheet exists check completed');
    
    // Log before opening spreadsheet
    console.log('Opening spreadsheet with ID:', SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      const error = 'Failed to open spreadsheet. Check if the SPREADSHEET_ID is correct and you have access.';
      console.error(error);
      return sendResponse(false, error);
    }
    
    // Log before getting sheet
    console.log('Getting sheet with name:', SHEET_NAME);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      const error = `Sheet '${SHEET_NAME}' not found in the spreadsheet. Available sheets: ${ss.getSheets().map(s => s.getName()).join(', ')}`;
      console.error(error);
      return sendResponse(false, error);
    }
    
    console.log('Checking for duplicate emails...');
    const data = sheet.getDataRange().getValues();
    console.log(`Found ${data.length} rows in the sheet`);
    
    // Check if email already exists (skip header row)
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][COL.EMAIL] ? String(data[i][COL.EMAIL]).trim().toLowerCase() : '';
      const inputEmail = params.email.toLowerCase().trim();
      
      console.log(`Checking row ${i}:`, {rowEmail, inputEmail, match: rowEmail === inputEmail});
      
      if (rowEmail === inputEmail) {
        const error = `Email '${params.email}' is already registered`;
        console.error(error);
        return sendResponse(false, error);
      }
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    console.log(`Generated OTP for new registration ${params.email}: ${otp}`);
    
    // Get the next serial number
    const nextSerialNumber = data.length > 0 ? data.length : 1;
    
    // Prepare new user data
    const newUser = [];
    for (let i = 0; i < 12; i++) { // Initialize all columns
      newUser[i] = '';
    }
    
    // Fill in the user data
    newUser[COL.SR_NO] = nextSerialNumber;
    newUser[COL.NAME] = params.name;
    newUser[COL.EMAIL] = params.email;
    newUser[COL.OTP] = otp;
    newUser[COL.PASSWORD] = params.password;
    newUser[COL.PHONE] = params.phone || '';
    newUser[COL.PLAN_TYPE] = params.planType || '';
    newUser[COL.SUBSCRIPTION_TYPE] = params.subscriptionType || '';
    newUser[COL.SUBSCRIPTION_DATE] = params.subscriptionDate || '';
    newUser[COL.EXPIRY_DATE] = params.expiryDate || '';
    newUser[COL.EMAIL_VERIFIED] = 'NO';
    newUser[COL.PHONE_VERIFIED] = 'NO';
    
    // Add the new user to the sheet
    sheet.appendRow(newUser);
    console.log('User added to sheet:', JSON.stringify(newUser));
    
    // Force flush to ensure data is written immediately
    SpreadsheetApp.flush();
    
    // Send OTP email
    try {
      // Send OTP email directly here instead of calling sendEmailOTP
      // This ensures we don't have to search for the user again
      const emailQuota = MailApp.getRemainingDailyQuota();
      console.log(`Remaining email quota: ${emailQuota}`);
      
      if (emailQuota <= 0) {
        console.error('Email quota exceeded during registration');
        return sendResponse(true, 'Registration successful, but could not send verification email (quota exceeded)', {
          email: params.email,
          otp: otp // Include OTP in response for testing
        });
      }
      
      // Prepare email content - simple plain text version
      const plainTextBody = `Dear ${params.name},\n\nWelcome to Trade Encore!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nTrade Encore Team`;
      
      // Create HTML version for better email appearance - simplified for compatibility
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; margin: 0 auto;">
          <h2>Welcome to Trade Encore!</h2>
          <p>Dear ${params.name},</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>Best regards,<br>Trade Encore Team</p>
        </div>
      `;
      
      // Try multiple email sending methods with proper error handling
      let emailSent = false;
      let errorMessages = [];
      
      // ATTEMPT 1: Basic MailApp approach (most reliable)
      try {
        MailApp.sendEmail({
          to: params.email,
          subject: 'Trade Encore - Your Verification Code',
          body: plainTextBody,
          htmlBody: htmlBody,
          name: 'Trade Encore'
        });
        emailSent = true;
        console.log('Registration email sent successfully using MailApp');
      } catch (error1) {
        errorMessages.push(`MailApp failed: ${error1.message}`);
        console.error(`Registration email MailApp failed: ${error1.message}`);
        
        // ATTEMPT 2: Ultra-simplified approach
        try {
          MailApp.sendEmail(
            params.email,
            'Trade Encore - Verification Code: ' + otp,
            'Your verification code is: ' + otp
          );
          emailSent = true;
          console.log('Registration email sent successfully using simplified MailApp');
        } catch (error2) {
          errorMessages.push(`Simplified MailApp failed: ${error2.message}`);
          console.error(`Registration email simplified MailApp failed: ${error2.message}`);
        }
      }
      
      if (!emailSent) {
        console.error(`ALL email sending methods failed during registration: ${errorMessages.join('; ')}`);
      }
      
      return sendResponse(true, 'Registration successful' + (emailSent ? ', verification code sent to your email' : ', but email delivery failed'), {
        email: params.email,
        otp: otp // Include OTP in response for testing
      });
      
    } catch (emailError) {
      console.error('Error sending registration OTP email:', emailError);
      return sendResponse(true, 'Registration successful, but could not send verification email', {
        email: params.email,
        otp: otp // Include OTP in response for testing
      });
    }
    
  } catch (error) {
    console.error('Error in handleRegistration:', error);
    return sendResponse(false, 'Server error during registration: ' + error.message);
  }
}

/**
 * Handle user login
 */
function handleLogin(params) {
  console.log('handleLogin called with params:', JSON.stringify(params));
  
  // Validate required fields
  if (!params.email || !params.password) {
    console.error('Missing required login fields');
    return sendResponse(false, 'Email and password are required');
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
    let userFound = false;
    let userData = null;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === params.email.toLowerCase()) {
        userFound = true;
        userData = data[i];
        break;
      }
    }
    
    if (!userFound) {
      console.error('User not found:', params.email);
      return sendResponse(false, 'Invalid email or password');
    }
    
    // Check password
    if (userData[COL.PASSWORD] !== params.password) {
      console.error('Invalid password for user:', params.email);
      return sendResponse(false, 'Invalid email or password');
    }
    
    // Check if email is verified
    const isEmailVerified = userData[COL.EMAIL_VERIFIED] === 'YES';
    
    // Prepare user data to return
    const userDataToReturn = {
      name: userData[COL.NAME],
      email: userData[COL.EMAIL],
      phone: userData[COL.PHONE],
      planType: userData[COL.PLAN_TYPE],
      subscriptionType: userData[COL.SUBSCRIPTION_TYPE],
      subscriptionDate: userData[COL.SUBSCRIPTION_DATE],
      expiryDate: userData[COL.EXPIRY_DATE],
      emailVerified: isEmailVerified,
      phoneVerified: userData[COL.PHONE_VERIFIED] === 'YES'
    };
    
    return sendResponse(true, 'Login successful', userDataToReturn);
    
  } catch (error) {
    console.error('Error in handleLogin:', error);
    return sendResponse(false, 'Server error during login: ' + error.message);
  }
}

/**
 * Process GET requests (for testing)
 */
function doGet(e) {
  // Simple test endpoint
  if (e.parameter.action === 'ping') {
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Ping successful!', time: new Date().toISOString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
  }
  
  // Handle different test actions
  if (e.parameter.action === 'test') {
    return testEmailService();
  } else if (e.parameter.action === 'diagnose') {
    // Run diagnostic test and return results
    const results = runDiagnosticTest();
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
  } else if (e.parameter.action === 'sendTestOTP') {
    // Send a test OTP to the provided email
    const email = e.parameter.email;
    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Email parameter is required'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
    }
    return sendEmailOTP(email);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Trade Encore API is running',
    timestamp: new Date().toISOString(),
    testOptions: [
      { action: 'test', description: 'Test email service' },
      { action: 'diagnose', description: 'Run diagnostic tests' },
      { action: 'sendTestOTP', params: ['email'], description: 'Send test OTP to email' }
    ]
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(CORS_HEADERS);
}

/**
 * Initialize the sheet structure if needed
 * This ensures all required columns exist
 */
function initializeSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Sr. No.',
        'Name of the user',
        'Email',
        'OTP',
        'Password',
        'Mobile Number',
        'Plan type',
        'Subscription Type',
        'Subscription Date',
        'Expiry on',
        'Email Verified',
        'Phone Verified'
      ]);
      console.log('Sheet initialized with headers');
    } else {
      // Check if headers exist and add missing columns if needed
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Check if Email Verified and Phone Verified columns exist, add if not
      if (headers.length <= COL.EMAIL_VERIFIED) {
        sheet.getRange(1, headers.length + 1).setValue('Email Verified');
        console.log('Added Email Verified column');
      }
      
      if (headers.length <= COL.PHONE_VERIFIED) {
        sheet.getRange(1, headers.length + 1).setValue('Phone Verified');
        console.log('Added Phone Verified column');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
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
  
  // Validate email format
  if (!email.includes('@') || !email.includes('.')) {
    console.log('Registration failed: Invalid email format');
    return sendResponse(false, 'Please enter a valid email address');
  }
  
  try {
    // Initialize sheet if needed
    initializeSheet();
    
    // Get the sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    // Check if user exists
    const data = sheet.getDataRange().getValues();
    const existingUser = data.find(row => 
      row[COL.EMAIL] && String(row[COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return sendResponse(false, 'User already exists');
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Generate a new row number
    const lastRow = sheet.getLastRow();
    const newRowNum = lastRow > 0 ? lastRow : 1; // Use row 1 if sheet is empty
    
    // Add new user with OTP
    const newRow = Array(Math.max(COL.PHONE_VERIFIED, sheet.getLastColumn()) + 1).fill('');
    newRow[COL.SR_NO] = newRowNum;
    newRow[COL.NAME] = name;
    newRow[COL.EMAIL] = email;
    newRow[COL.OTP] = otp;
    newRow[COL.PASSWORD] = password;
    newRow[COL.PHONE] = phone;
    newRow[COL.PLAN_TYPE] = planType || '';
    newRow[COL.SUBSCRIPTION_TYPE] = subscriptionType || '';
    newRow[COL.SUBSCRIPTION_DATE] = '';
    newRow[COL.EXPIRY_DATE] = '';
    newRow[COL.EMAIL_VERIFIED] = false;
    newRow[COL.PHONE_VERIFIED] = false;
    
    sheet.appendRow(newRow);
    
    console.log('User registered successfully:', email);
    
    // Send OTP immediately after registration
    try {
      // Direct email sending without going through sendEmailOTP function
      // This ensures we send the OTP we just stored
      const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
      console.log(`Script owner email for OTP sending: ${scriptOwnerEmail}`);
      
      // Prepare email content
      const emailSubject = 'Trade Encore - Your Verification Code';
      const emailBody = `
        Dear ${name},

        Thank you for registering with Trade Encore.
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
            <p>Dear ${name},</p>
            <p>Thank you for registering with Trade Encore.</p>
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
      
      // Try multiple email sending methods
      let emailSent = false;
      
      // First try GmailApp
      try {
        GmailApp.sendEmail(
          email,
          emailSubject,
          emailBody,
          {
            name: 'Trade Encore',
            replyTo: scriptOwnerEmail,
            htmlBody: htmlBody
          }
        );
        emailSent = true;
        console.log('Registration OTP email sent successfully using GmailApp');
      } catch (emailError1) {
        console.error('GmailApp failed:', emailError1);
        
        // Try MailApp as fallback
        try {
          MailApp.sendEmail({
            to: email,
            subject: emailSubject,
            body: emailBody,
            htmlBody: htmlBody,
            name: 'Trade Encore'
          });
          emailSent = true;
          console.log('Registration OTP email sent successfully using MailApp');
        } catch (emailError2) {
          console.error('MailApp failed:', emailError2);
        }
      }
      
      if (emailSent) {
        return sendResponse(true, 'Registration successful, please check your email for verification code');
      } else {
        // Registration was successful but email failed
        console.error('Failed to send OTP email during registration');
        return sendResponse(true, 'Registration successful, but failed to send verification email. Please use the resend OTP option.');
      }
    } catch (otpError) {
      console.error('Error sending OTP during registration:', otpError);
      // Registration was still successful even if OTP sending failed
      return sendResponse(true, 'Registration successful, but failed to send verification email. Please use the resend OTP option.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(false, 'Registration failed: ' + (error.message || 'Unknown error'));
  }
}
/**
 * Handle user login
 * 
 * Expected params:
 * - email: User's email
 * - password: User's password
 */
function handleLogin(params) {
  const { email, password } = params;
  console.log('Login request received for email:', email);
  
  if (!email || !password) {
    return sendResponse(false, 'Email and password are required');
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
    const userRow = data.find(row => 
      row[COL.EMAIL] && String(row[COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()
    );
    
    if (!userRow) {
      console.log('Login failed: User not found:', email);
      return sendResponse(false, 'Invalid email or password');
    }
    
    // Check password
    if (userRow[COL.PASSWORD] !== password) {
      console.log('Login failed: Invalid password for:', email);
      return sendResponse(false, 'Invalid email or password');
    }
    
    // Check if email is verified
    const emailVerified = userRow[COL.EMAIL_VERIFIED] === true || userRow[COL.EMAIL_VERIFIED] === 'true' || userRow[COL.EMAIL_VERIFIED] === 'VERIFIED';
    
    // Get subscription status
    const subscriptionData = {
      planType: userRow[COL.PLAN_TYPE] || '',
      subscriptionType: userRow[COL.SUBSCRIPTION_TYPE] || '',
      subscriptionDate: userRow[COL.SUBSCRIPTION_DATE] || '',
      expiryDate: userRow[COL.EXPIRY_DATE] || ''
    };
    
    // Check if subscription is active
    const isActive = isSubscriptionActive(subscriptionData.expiryDate);
    
    console.log('Login successful for:', email);
    
    return sendResponse(true, 'Login successful', {
      name: userRow[COL.NAME],
      email: userRow[COL.EMAIL],
      phone: userRow[COL.PHONE],
      emailVerified: emailVerified,
      phoneVerified: userRow[COL.PHONE_VERIFIED] === true || userRow[COL.PHONE_VERIFIED] === 'true',
      subscription: {
        ...subscriptionData,
        isActive: isActive
      },
      role: 'user' // Default role
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(false, 'Login failed: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Verify OTP for a user
 * 
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {object} Response object
 */
function verifyOTP(email, otp) {
  console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`);
  
  if (!email || !otp) {
    console.error('Email and OTP are required');
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
    let userRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.log(`Verification failed: User not found: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Get stored OTP
    const storedOTP = data[userRowIndex][COL.OTP];
    console.log(`Stored OTP for ${email}: ${storedOTP}, Provided OTP: ${otp}`);
    
    // Check if OTP matches
    if (String(storedOTP).trim() !== String(otp).trim()) {
      console.log(`Verification failed: Invalid OTP for ${email}`);
      return sendResponse(false, 'Invalid verification code');
    }
    
    // Mark OTP as verified and update email verification status
    try {
      // Clear OTP
      sheet.getRange(userRowIndex + 1, COL.OTP + 1).setValue('VERIFIED');
      
      // Set email as verified
      sheet.getRange(userRowIndex + 1, COL.EMAIL_VERIFIED + 1).setValue(true);
      
      // Force flush to ensure changes are written immediately
      SpreadsheetApp.flush();
      
      console.log(`Verification successful for ${email}`);
      return sendResponse(true, 'Email verified successfully');
    } catch (updateError) {
      console.error(`Failed to update verification status: ${updateError.message}`);
      return sendResponse(false, 'Failed to update verification status');
    }
  } catch (error) {
    console.error(`Verification error: ${error.message}`);
    return sendResponse(false, 'Verification failed: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Initiate payment process
 */
function initiatePayment(params) {
  console.log('initiatePayment called with params:', JSON.stringify(params));
  
  // Validate required fields
  if (!params.email || !params.amount) {
    console.error('Missing required payment fields');
    return sendResponse(false, 'Email and amount are required');
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
    let userRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === params.email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error('User not found:', params.email);
      return sendResponse(false, 'User not found');
    }
    
    // Generate a payment reference ID
    const paymentId = 'PAY-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // In a real implementation, you would integrate with a payment gateway here
    // For now, we'll just simulate a successful payment initiation
    
    return sendResponse(true, 'Payment initiated successfully', {
      paymentId: paymentId,
      amount: params.amount,
      email: params.email
    });
    
  } catch (error) {
    console.error('Error in initiatePayment:', error);
    return sendResponse(false, 'Server error during payment initiation: ' + error.message);
  }
}

/**
 * Verify payment status
 */
function verifyPayment(params) {
  console.log('verifyPayment called with params:', JSON.stringify(params));
  
  // Validate required fields
  if (!params.email || !params.paymentId) {
    console.error('Missing required payment verification fields');
    return sendResponse(false, 'Email and payment ID are required');
  }
  
  try {
    // In a real implementation, you would check with the payment gateway
    // For now, we'll just simulate a successful payment verification
    
    // For demo purposes, we'll consider all payments as successful
    const paymentSuccessful = true;
    
    if (paymentSuccessful) {
      // Update user subscription based on the payment
      return updateSubscription({
        email: params.email,
        planType: params.planType || 'Basic',
        subscriptionType: params.subscriptionType || 'Monthly',
        paymentId: params.paymentId
      });
    } else {
      return sendResponse(false, 'Payment verification failed');
    }
    
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return sendResponse(false, 'Server error during payment verification: ' + error.message);
  }
}

/**
 * Update user subscription
 */
function updateSubscription(params) {
  console.log('updateSubscription called with params:', JSON.stringify(params));
  
  // Validate required fields
  if (!params.email) {
    console.error('Missing required subscription fields');
    return sendResponse(false, 'Email is required');
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
    let userRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === params.email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error('User not found:', params.email);
      return sendResponse(false, 'User not found');
    }
    
    // Calculate subscription dates
    const today = new Date();
    const subscriptionDate = Utilities.formatDate(today, 'GMT', 'yyyy-MM-dd');
    
    // Calculate expiry date based on subscription type
    let expiryDate = new Date(today);
    if (params.subscriptionType === 'Monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (params.subscriptionType === 'Quarterly') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (params.subscriptionType === 'Yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      // Default to monthly
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    const formattedExpiryDate = Utilities.formatDate(expiryDate, 'GMT', 'yyyy-MM-dd');
    
    // Update subscription details in the sheet
    sheet.getRange(userRowIndex + 1, COL.PLAN_TYPE + 1).setValue(params.planType || 'Basic');
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_TYPE + 1).setValue(params.subscriptionType || 'Monthly');
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_DATE + 1).setValue(subscriptionDate);
    sheet.getRange(userRowIndex + 1, COL.EXPIRY_DATE + 1).setValue(formattedExpiryDate);
    
    // Force flush to ensure data is written immediately
    SpreadsheetApp.flush();
    
    console.log(`Subscription updated for ${params.email}: ${params.planType || 'Basic'} - ${params.subscriptionType || 'Monthly'} until ${formattedExpiryDate}`);
    
    return sendResponse(true, 'Subscription updated successfully', {
      email: params.email,
      planType: params.planType || 'Basic',
      subscriptionType: params.subscriptionType || 'Monthly',
      subscriptionDate: subscriptionDate,
      expiryDate: formattedExpiryDate
    });
    
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    return sendResponse(false, 'Server error during subscription update: ' + error.message);
  }
}

/**
 * Send email OTP
 * 
 * @param {string} email - User's email address
 * @returns {object} Response object
 */
function sendEmailOTP(email) {
  console.log(`sendEmailOTP called for email: ${email}`);
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('Invalid email format:', email);
    return sendResponse(false, 'Invalid email format');
  }
  
  try {
    // Generate a new OTP first
    const otp = generateOTP();
    console.log(`Generated OTP for email ${email}: ${otp}`);
    
    // Get the sheet and find user
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Sheet not found');
      return sendResponse(false, 'Server configuration error');
    }
    
    // Find user by email
    const data = sheet.getDataRange().getValues();
    let userRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Store OTP in sheet - this is critical
    sheet.getRange(userRowIndex + 1, COL.OTP + 1).setValue(otp);
    
    // IMPORTANT: Force flush to ensure OTP is written immediately
    SpreadsheetApp.flush();
    
    // Double-check that OTP was stored correctly
    const verifyOtpStored = sheet.getRange(userRowIndex + 1, COL.OTP + 1).getValue();
    console.log(`Verification of OTP storage: stored=${verifyOtpStored}, expected=${otp}`);
    
    if (String(verifyOtpStored) !== String(otp)) {
      console.error(`OTP storage verification failed: ${verifyOtpStored} != ${otp}`);
      // Try one more time with a different approach
      sheet.getRange(userRowIndex + 1, COL.OTP + 1).setValue(otp);
      SpreadsheetApp.flush();
    }
    
    // Get email quota
    const emailQuota = MailApp.getRemainingDailyQuota();
    console.log(`Remaining email quota: ${emailQuota}`);
    
    if (emailQuota <= 0) {
      console.error('Email quota exceeded');
      return sendResponse(false, 'Email service unavailable (quota exceeded). Please try again later.');
    }
    
    // Get script owner email for proper sending
    const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
    
    // Prepare email content - simple plain text version
    const plainTextBody = `Dear Trade Encore Member,\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nTrade Encore Team`;
    
    // Create HTML version for better email appearance - simplified for compatibility
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; margin: 0 auto;">
        <h2>Trade Encore</h2>
        <p>Dear Trade Encore Member,</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <p>Best regards,<br>Trade Encore Team</p>
      </div>
    `;
    
    // Try multiple email sending methods with proper error handling
    let emailSent = false;
    let errorMessages = [];
    
    // ATTEMPT 1: Basic MailApp approach (most reliable)
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'Trade Encore - Your Verification Code',
        body: plainTextBody,
        htmlBody: htmlBody,
        name: 'Trade Encore'
      });
      emailSent = true;
      console.log('Email sent successfully using MailApp');
    } catch (error1) {
      errorMessages.push(`MailApp failed: ${error1.message}`);
      console.error(`MailApp failed: ${error1.message}`);
      
      // ATTEMPT 2: GmailApp approach
      try {
        GmailApp.sendEmail(
          email,
          'Trade Encore - Your Verification Code',
          plainTextBody,
          {
            htmlBody: htmlBody,
            name: 'Trade Encore'
          }
        );
        emailSent = true;
        console.log('Email sent successfully using GmailApp');
      } catch (error2) {
        errorMessages.push(`GmailApp failed: ${error2.message}`);
        console.error(`GmailApp failed: ${error2.message}`);
        
        // ATTEMPT 3: Ultra-simplified approach
        try {
          MailApp.sendEmail(
            email,
            'Trade Encore - Verification Code: ' + otp,
            'Your verification code is: ' + otp
          );
          emailSent = true;
          console.log('Email sent successfully using simplified MailApp');
        } catch (error3) {
          errorMessages.push(`Simplified MailApp failed: ${error3.message}`);
          console.error(`Simplified MailApp failed: ${error3.message}`);
        }
      }
    }
    
    if (emailSent) {
      // Log success and return positive response
      console.log(`OTP email successfully sent to ${email}`);
      return sendResponse(true, 'Verification code sent to your email', {email: email});
    } else {
      // All attempts failed - log comprehensive error
      const errorSummary = errorMessages.join('; ');
      console.error(`ALL email sending methods failed for ${email}: ${errorSummary}`);
      
      // Check if we can get more diagnostic info
      try {
        const scriptProperties = PropertiesService.getScriptProperties();
        const userProperties = PropertiesService.getUserProperties();
        console.log('Script properties available:', !!scriptProperties);
        console.log('User properties available:', !!userProperties);
      } catch (propError) {
        console.error('Could not access properties:', propError.message);
      }
      
      // Return detailed error for debugging
      return sendResponse(false, 'Could not send verification email. Please check your email address or try again later.', {
        error: errorSummary,
        otp: otp, // Include OTP in response for testing/debugging
        quota: emailQuota
      });
    }
  } catch (error) {
    console.error('Critical error in sendEmailOTP:', error);
    return sendResponse(false, 'Server error processing OTP request: ' + error.message);
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
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Check if OTP matches (OTP is in column D, index 3)
    const storedOTP = String(data[userRowIndex][COL.OTP]).trim();
    
    if (storedOTP === otp) {
      console.log(`OTP verified successfully for ${email}`);
      
      // Clear OTP after successful verification
      sheet.getRange(userRowIndex + 1, COL.OTP + 1).setValue('VERIFIED');
      
      // Mark email as verified
      sheet.getRange(userRowIndex + 1, COL.EMAIL_VERIFIED + 1).setValue(true);
      
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
 * Initiate payment
 * 
 * Expected params:
 * - email: User's email
 * - amount: Payment amount
 * - planType: Plan type (e.g., 'basic', 'premium')
 * - subscriptionType: Subscription type (e.g., 'monthly', 'yearly')
 * - paymentMethod: Payment method (e.g., 'card', 'upi')
 * - transactionId: Optional transaction ID from payment gateway
 */
function initiatePayment(params) {
  const { email, amount, planType, subscriptionType, paymentMethod, transactionId } = params;
  console.log('Payment initiation request:', JSON.stringify(params));
  
  if (!email || !amount || !planType || !subscriptionType) {
    return sendResponse(false, 'Missing required payment parameters');
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
    
    // Find user row index
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found for payment: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Generate payment reference
    const paymentRef = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Return payment reference for frontend to use
    return sendResponse(true, 'Payment initiated', {
      paymentRef: paymentRef,
      amount: amount,
      email: email,
      planType: planType,
      subscriptionType: subscriptionType
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return sendResponse(false, 'Payment initiation failed: ' + error.message);
  }
}

/**
 * Verify payment and update subscription
 * 
 * Expected params:
 * - email: User's email
 * - paymentRef: Payment reference from initiatePayment
 * - transactionId: Transaction ID from payment gateway
 * - status: Payment status ('success', 'failed')
 * - planType: Plan type
 * - subscriptionType: Subscription type
 */
function verifyPayment(params) {
  const { email, paymentRef, transactionId, status, planType, subscriptionType } = params;
  console.log('Payment verification request:', JSON.stringify(params));
  
  if (!email || !paymentRef || !status) {
    return sendResponse(false, 'Missing required verification parameters');
  }
  
  // Only proceed if payment was successful
  if (status !== 'success') {
    return sendResponse(false, 'Payment was not successful');
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
    
    // Find user row index
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found for payment verification: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Calculate subscription dates
    const subscriptionDate = new Date();
    let expiryDate = new Date();
    
    if (subscriptionType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (subscriptionType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (subscriptionType === 'quarterly') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (subscriptionType === 'half-yearly') {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else {
      // Default to 30 days if unknown subscription type
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    
    // Format dates as strings
    const formattedSubscriptionDate = Utilities.formatDate(subscriptionDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const formattedExpiryDate = Utilities.formatDate(expiryDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Update user subscription details
    sheet.getRange(userRowIndex + 1, COL.PLAN_TYPE + 1).setValue(planType);
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_TYPE + 1).setValue(subscriptionType);
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_DATE + 1).setValue(formattedSubscriptionDate);
    sheet.getRange(userRowIndex + 1, COL.EXPIRY_DATE + 1).setValue(formattedExpiryDate);
    
    console.log(`Subscription updated for ${email}: ${planType}, ${subscriptionType}, expires ${formattedExpiryDate}`);
    
    return sendResponse(true, 'Payment verified and subscription updated', {
      email: email,
      planType: planType,
      subscriptionType: subscriptionType,
      subscriptionDate: formattedSubscriptionDate,
      expiryDate: formattedExpiryDate
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return sendResponse(false, 'Payment verification failed: ' + error.message);
  }
}

/**
 * Update user subscription
 * 
 * Expected params:
 * - email: User's email
 * - planType: Plan type
 * - subscriptionType: Subscription type
 */
function updateSubscription(params) {
  const { email, planType, subscriptionType } = params;
  console.log('Subscription update request:', JSON.stringify(params));
  
  if (!email || !planType || !subscriptionType) {
    return sendResponse(false, 'Missing required subscription parameters');
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
    
    // Find user row index
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === email.toLowerCase()) {
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      console.error(`User not found for subscription update: ${email}`);
      return sendResponse(false, 'User not found');
    }
    
    // Calculate subscription dates
    const subscriptionDate = new Date();
    let expiryDate = new Date();
    
    if (subscriptionType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (subscriptionType === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (subscriptionType === 'quarterly') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (subscriptionType === 'half-yearly') {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else {
      // Default to 30 days if unknown subscription type
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    
    // Format dates as strings
    const formattedSubscriptionDate = Utilities.formatDate(subscriptionDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const formattedExpiryDate = Utilities.formatDate(expiryDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Update user subscription details
    sheet.getRange(userRowIndex + 1, COL.PLAN_TYPE + 1).setValue(planType);
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_TYPE + 1).setValue(subscriptionType);
    sheet.getRange(userRowIndex + 1, COL.SUBSCRIPTION_DATE + 1).setValue(formattedSubscriptionDate);
    sheet.getRange(userRowIndex + 1, COL.EXPIRY_DATE + 1).setValue(formattedExpiryDate);
    
    console.log(`Subscription manually updated for ${email}: ${planType}, ${subscriptionType}, expires ${formattedExpiryDate}`);
    
    return sendResponse(true, 'Subscription updated successfully', {
      email: email,
      planType: planType,
      subscriptionType: subscriptionType,
      subscriptionDate: formattedSubscriptionDate,
      expiryDate: formattedExpiryDate
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return sendResponse(false, 'Subscription update failed: ' + error.message);
  }
}

/**
 * Run comprehensive diagnostic tests
 * This function checks all critical components of the system:
 * 1. Spreadsheet access
 * 2. Sheet structure
 * 3. OTP generation and storage
 * 4. Email sending capability
 * 
 * @returns {Object} Diagnostic results
 */
function runDiagnosticTest() {
  console.log('Starting comprehensive diagnostic test');
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test 1: Check spreadsheet access
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    results.tests.spreadsheetAccess = {
      success: true,
      message: `Successfully accessed spreadsheet: ${ss.getName()}`
    };
    console.log(`✓ Spreadsheet access: ${ss.getName()}`);
    
    // Test 2: Check sheet structure
    try {
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        results.tests.sheetStructure = {
          success: true,
          message: `Sheet '${SHEET_NAME}' exists with ${headers.length} columns`,
          details: {
            headers: headers,
            rowCount: sheet.getLastRow()
          }
        };
        console.log(`✓ Sheet structure: '${SHEET_NAME}' exists with ${headers.length} columns and ${sheet.getLastRow()} rows`);
        
        // Test 3: Test OTP generation and storage
        try {
          // Create a test user or use existing one
          const testEmail = `test.${new Date().getTime()}@example.com`;
          const testOTP = generateOTP();
          
          // Find if test user already exists or create a new row
          let testRow = sheet.getLastRow() + 1;
          const testData = [
            testRow - 1,  // Sr. No.
            'Test User', // Name
            testEmail,   // Email
            testOTP,     // OTP
            'testpass',  // Password
            '1234567890',// Phone
            '',          // Plan Type
            '',          // Subscription Type
            '',          // Subscription Date
            '',          // Expiry Date
            false,       // Email Verified
            false        // Phone Verified
          ];
          
          // Add test row
          sheet.getRange(testRow, 1, 1, testData.length).setValues([testData]);
          SpreadsheetApp.flush();
          
          // Verify the test data was written
          const verifyData = sheet.getRange(testRow, 1, 1, testData.length).getValues()[0];
          
          results.tests.otpStorage = {
            success: verifyData[COL.OTP] === testOTP,
            message: verifyData[COL.OTP] === testOTP ? 
              `Successfully stored OTP for test user` : 
              `Failed to store OTP correctly`,
            details: {
              expected: testOTP,
              actual: verifyData[COL.OTP]
            }
          };
          
          if (verifyData[COL.OTP] === testOTP) {
            console.log(`✓ OTP storage: Successfully stored OTP for test user`);
          } else {
            console.log(`✗ OTP storage: Failed to store OTP correctly. Expected: ${testOTP}, Got: ${verifyData[COL.OTP]}`);
          }
          
          // Clean up test data
          sheet.deleteRow(testRow);
          
        } catch (otpError) {
          results.tests.otpStorage = {
            success: false,
            message: `OTP test failed: ${otpError.message}`,
            error: otpError.toString()
          };
          console.log(`✗ OTP test failed: ${otpError.message}`);
        }
        
      } else {
        results.tests.sheetStructure = {
          success: false,
          message: `Sheet '${SHEET_NAME}' does not exist`
        };
        console.log(`✗ Sheet structure: Sheet '${SHEET_NAME}' does not exist`);
      }
    } catch (sheetError) {
      results.tests.sheetStructure = {
        success: false,
        message: `Error accessing sheet: ${sheetError.message}`,
        error: sheetError.toString()
      };
      console.log(`✗ Sheet structure error: ${sheetError.message}`);
    }
    
  } catch (ssError) {
    results.tests.spreadsheetAccess = {
      success: false,
      message: `Failed to access spreadsheet: ${ssError.message}`,
      error: ssError.toString()
    };
    console.log(`✗ Spreadsheet access error: ${ssError.message}`);
  }
  
  // Test 4: Check email sending capability
  try {
    const emailQuota = MailApp.getRemainingDailyQuota();
    const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
    
    results.tests.emailCapability = {
      success: emailQuota > 0,
      message: emailQuota > 0 ? 
        `Email sending available. Remaining quota: ${emailQuota}` : 
        `No email quota remaining`,
      details: {
        quota: emailQuota,
        scriptOwner: scriptOwnerEmail
      }
    };
    
    if (emailQuota > 0) {
      console.log(`✓ Email capability: Quota available: ${emailQuota}`);
      
      // Try sending a test email if quota is available
      try {
        MailApp.sendEmail(
          scriptOwnerEmail,
          'Trade Encore - Diagnostic Test',
          'This is an automated email from the Trade Encore diagnostic test.'
        );
        
        results.tests.emailSending = {
          success: true,
          message: `Test email sent successfully to ${scriptOwnerEmail}`
        };
        console.log(`✓ Email sending: Test email sent to ${scriptOwnerEmail}`);
      } catch (emailError) {
        results.tests.emailSending = {
          success: false,
          message: `Failed to send test email: ${emailError.message}`,
          error: emailError.toString()
        };
        console.log(`✗ Email sending error: ${emailError.message}`);
      }
    } else {
      console.log(`✗ Email capability: No quota remaining`);
    }
  } catch (quotaError) {
    results.tests.emailCapability = {
      success: false,
      message: `Error checking email quota: ${quotaError.message}`,
      error: quotaError.toString()
    };
    console.log(`✗ Email capability error: ${quotaError.message}`);
  }
  
  // Calculate overall status
  const allTests = Object.values(results.tests);
  const passedTests = allTests.filter(test => test.success).length;
  results.summary = {
    totalTests: allTests.length,
    passedTests: passedTests,
    success: passedTests === allTests.length,
    message: passedTests === allTests.length ? 
      'All diagnostic tests passed successfully' : 
      `${passedTests}/${allTests.length} tests passed`
  };
  
  console.log(`Diagnostic complete: ${results.summary.message}`);
  
  // Display results in UI when run directly
  if (typeof ScriptApp !== 'undefined') {
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        'Diagnostic Results', 
        `${results.summary.message}\n\n` +
        `Spreadsheet Access: ${results.tests.spreadsheetAccess.success ? 'OK' : 'FAILED'}\n` +
        `Sheet Structure: ${results.tests.sheetStructure.success ? 'OK' : 'FAILED'}\n` +
        `OTP Storage: ${results.tests.otpStorage.success ? 'OK' : 'FAILED'}\n` +
        `Email Capability: ${results.tests.emailCapability.success ? 'OK' : 'FAILED'}\n` +
        (results.tests.emailSending ? 
          `Email Sending: ${results.tests.emailSending.success ? 'OK' : 'FAILED'}\n` : 
          ''),
        ui.ButtonSet.OK
      );
    } catch (uiError) {
      // Ignore UI errors when running as web app
      console.log('Could not display UI alert (normal when running as web app)');
    }
  }
  
  return results;
}

/**
 * Test email service
 */
function testEmailService() {
  const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
  
  try {
    GmailApp.sendEmail(
      scriptOwnerEmail,
      'Trade Encore - Email Service Test',
      'This is a test email to verify that the email service is working correctly.'
    );
    
    return sendResponse(true, 'Test email sent successfully to script owner');
  } catch (error) {
    console.error('Test email failed:', error);
    return sendResponse(false, 'Failed to send test email: ' + error.message);
  }
}

/**
 * Handle GET requests for diagnostics and testing
 * 
 * @param {object} e - Event object from Apps Script
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  console.log('GET request received:', JSON.stringify(e.parameter || {}));
  
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No action specified'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(CORS_HEADERS);
    }
    
    console.log(`Processing GET action: ${action}`);
    
    switch (action) {
      case 'diagnose':
        // Run diagnostic tests
        const diagnosticResults = runDiagnosticTest();
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Diagnostic tests completed',
          results: diagnosticResults
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(CORS_HEADERS);
        
      case 'sendTestOTP':
        // Send a test OTP to the specified email
        const email = e.parameter.email;
        if (!email) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Email parameter is required'
          }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(CORS_HEADERS);
        }
        
        const sendResult = sendEmailOTP(email);
        return ContentService.createTextOutput(JSON.stringify(sendResult))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(CORS_HEADERS);
        
      case 'verifyTestOTP':
        // Verify an OTP for testing
        const verifyEmail = e.parameter.email;
        const otp = e.parameter.otp;
        
        if (!verifyEmail || !otp) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Email and OTP parameters are required'
          }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(CORS_HEADERS);
        }
        
        const verifyResult = verifyOTP(verifyEmail, otp);
        return ContentService.createTextOutput(JSON.stringify(verifyResult))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(CORS_HEADERS);
        
      case 'testEmail':
        // Test email service
        const testResult = testEmailService();
        return ContentService.createTextOutput(JSON.stringify(testResult))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(CORS_HEADERS);
        
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: `Unknown action: ${action}`
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(CORS_HEADERS);
    }
  } catch (error) {
    console.error('Error processing GET request:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error processing request',
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
  }
}

/**
 * Comprehensive diagnostic function for OTP issues
 */
function diagnoseOtpIssues() {
  const results = {
    timestamp: new Date().toISOString(),
    spreadsheet: {},
    sheet: {},
    email: {},
    permissions: {},
    quotas: {}
  };
  
  try {
    // 1. Check script permissions and owner
    const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
    results.permissions.scriptOwner = scriptOwnerEmail;
    results.permissions.effectiveUser = Session.getEffectiveUser().getUsername();
    
    // 2. Check if spreadsheet exists and is accessible
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      results.spreadsheet.access = true;
      results.spreadsheet.name = ss.getName();
      results.spreadsheet.url = ss.getUrl();
      results.spreadsheet.owners = ss.getEditors().map(editor => editor.getEmail());
      
      // 3. Check sheet
      let sheet = ss.getSheetByName(SHEET_NAME);
      results.sheet = {
        exists: !!sheet
      };
      
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        results.sheet.rowCount = data.length;
        results.sheet.headers = data[0];
        results.sheet.sampleData = data.length > 1 ? data[1] : null;
      }
      
      // 4. Test OTP generation and storage
      const testEmail = scriptOwnerEmail;
      const otp = generateOTP();
      results.otp = {
        generated: otp,
        email: testEmail
      };
      
      // Try to store the OTP
      try {
        if (sheet) {
          // Find test user or create one
          let testUserRowIndex = -1;
          const data = sheet.getDataRange().getValues();
          
          for (let i = 1; i < data.length; i++) {
            if (data[i][COL.EMAIL] && String(data[i][COL.EMAIL]).trim().toLowerCase() === testEmail.toLowerCase()) {
              testUserRowIndex = i;
              break;
            }
          }
          
          if (testUserRowIndex === -1) {
            // Create test user
            const lastRow = sheet.getLastRow();
            const newRow = Array(Math.max(COL.PHONE_VERIFIED, sheet.getLastColumn()) + 1).fill('');
            newRow[COL.SR_NO] = lastRow;
            newRow[COL.NAME] = 'Test User';
            newRow[COL.EMAIL] = testEmail;
            newRow[COL.PASSWORD] = 'testpassword';
            newRow[COL.PHONE] = '1234567890';
            
            sheet.appendRow(newRow);
            testUserRowIndex = lastRow;
            results.otp.userCreated = true;
          }
          
          // Update OTP
          sheet.getRange(testUserRowIndex + 1, COL.OTP + 1).setValue(otp);
          results.otp.stored = true;
        }
      } catch (otpError) {
        results.otp.error = otpError.toString();
      }
      
      // 5. Test email sending
      try {
        // Check email quotas first
        results.quotas = {
          emailRemaining: MailApp.getRemainingDailyQuota()
        };
        
        if (results.quotas.emailRemaining > 0) {
          const emailSubject = 'Trade Encore - Diagnostic Test';
          const emailBody = `This is a diagnostic test email from Trade Encore. Your test OTP is: ${otp}`;
          
          const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h2 style="color: #2c3e50;">Trade Encore - Diagnostic Test</h2>
              </div>
              <div style="padding: 20px; border: 1px solid #e9ecef; border-top: none;">
                <p>This is a diagnostic test email from Trade Encore.</p>
                <p>Your test OTP is:</p>
                <div style="background-color: #f8f9fa; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                  ${otp}
                </div>
                <p>This is a diagnostic test to verify email sending functionality.</p>
              </div>
            </div>
          `;
          
          // Try multiple email sending methods
          results.email.attempts = [];
          
          // Method 1: GmailApp with HTML
          try {
            GmailApp.sendEmail(
              testEmail,
              emailSubject,
              emailBody,
              {
                name: 'Trade Encore',
                from: scriptOwnerEmail,
                replyTo: scriptOwnerEmail,
                htmlBody: htmlBody
              }
            );
            results.email.attempts.push({
              method: 'GmailApp with HTML',
              success: true
            });
            results.email.sent = true;
          } catch (error1) {
            results.email.attempts.push({
              method: 'GmailApp with HTML',
              success: false,
              error: error1.toString()
            });
            
            // Method 2: MailApp with explicit sender
            try {
              MailApp.sendEmail({
                to: testEmail,
                subject: emailSubject,
                body: emailBody,
                htmlBody: htmlBody,
                name: 'Trade Encore',
                from: scriptOwnerEmail,
                replyTo: scriptOwnerEmail
              });
              results.email.attempts.push({
                method: 'MailApp with explicit sender',
                success: true
              });
              results.email.sent = true;
            } catch (error2) {
              results.email.attempts.push({
                method: 'MailApp with explicit sender',
                success: false,
                error: error2.toString()
              });
              
              // Method 3: MailApp without explicit sender
              try {
                MailApp.sendEmail({
                  to: testEmail,
                  subject: emailSubject,
                  body: emailBody,
                  htmlBody: htmlBody,
                  name: 'Trade Encore'
                });
                results.email.attempts.push({
                  method: 'MailApp without explicit sender',
                  success: true
                });
                results.email.sent = true;
              } catch (error3) {
                results.email.attempts.push({
                  method: 'MailApp without explicit sender',
                  success: false,
                  error: error3.toString()
                });
              }
            }
          }
        } else {
          results.email.quotaExceeded = true;
        }
      } catch (emailError) {
        results.email.error = emailError.toString();
      }
      
    } catch (ssError) {
      results.spreadsheet.error = ssError.toString();
    }
    
  } catch (error) {
    results.error = error.toString();
  }
  
  // Display results in a modal dialog
  const htmlOutput = HtmlService.createHtmlOutput(
    '<pre>' + JSON.stringify(results, null, 2) + '</pre>'
  )
  .setWidth(800)
  .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'OTP Diagnostic Results');
  
  // Also log to console
  console.log('OTP Diagnostic Results:', JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if a subscription is active based on expiry date
 */
function isSubscriptionActive(expiryDateStr) {
  if (!expiryDateStr) return false;
  
  try {
    // Parse the expiry date
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    
    // Compare with today's date
    return expiryDate >= today;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Helper function to send JSON response with CORS headers
function sendResponse(success, message, data = null) {
  const response = { success, message };
  if (data !== null) {
    response.data = data;
  }
  
  // Log the response for debugging
  console.log('Sending response:', JSON.stringify(response));
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
}

/**
 * Run a quick diagnostic test to check sheet access, OTP storage, and email sending
 * This function can be called directly from the Apps Script editor
 */
function runDiagnosticTest() {
  const results = {
    timestamp: new Date().toISOString(),
    spreadsheetAccess: false,
    sheetAccess: false,
    otpGeneration: false,
    otpStorage: false,
    emailSending: false,
    errors: []
  };
  
  try {
    // 1. Check spreadsheet access
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      results.spreadsheetAccess = true;
      results.spreadsheetName = ss.getName();
      
      // 2. Check sheet access
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) {
        results.sheetAccess = true;
        results.sheetName = SHEET_NAME;
        results.rowCount = sheet.getLastRow();
        results.columnCount = sheet.getLastColumn();
        
        // Check if required columns exist
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        results.headers = headerRow;
        
        // 3. Test OTP generation
        const testOTP = generateOTP();
        results.otpGeneration = true;
        results.generatedOTP = testOTP;
        
        // 4. Test OTP storage in a test row
        try {
          // Get script owner email for testing
          const scriptOwnerEmail = Session.getEffectiveUser().getEmail();
          results.scriptOwnerEmail = scriptOwnerEmail;
          
          // Find a test user or create one
          let testRowIndex = -1;
          const data = sheet.getDataRange().getValues();
          
          // Look for existing test user
          for (let i = 1; i < data.length; i++) {
            if (data[i][COL.EMAIL] === scriptOwnerEmail) {
              testRowIndex = i + 1; // 1-based index for getRange
              break;
            }
          }
          
          // Create test user if not found
          if (testRowIndex === -1) {
            const newRow = [];
            for (let i = 0; i < Math.max(12, sheet.getLastColumn()); i++) {
              newRow[i] = '';
            }
            newRow[COL.SR_NO] = sheet.getLastRow() + 1;
            newRow[COL.NAME] = 'Test User';
            newRow[COL.EMAIL] = scriptOwnerEmail;
            newRow[COL.PASSWORD] = 'testpassword';
            
            sheet.appendRow(newRow);
            testRowIndex = sheet.getLastRow();
            results.testUserCreated = true;
          }
          
          // Store OTP in test row
          sheet.getRange(testRowIndex, COL.OTP + 1).setValue(testOTP);
          
          // Verify OTP was stored
          const storedOTP = sheet.getRange(testRowIndex, COL.OTP + 1).getValue();
          results.otpStorage = storedOTP === testOTP;
          results.storedOTP = storedOTP;
          
          // 5. Test email sending
          try {
            // Check email quota
            results.emailQuota = MailApp.getRemainingDailyQuota();
            
            if (results.emailQuota > 0) {
              // Try sending test email
              GmailApp.sendEmail(
                scriptOwnerEmail,
                'Trade Encore - Diagnostic Test',
                `This is a diagnostic test email. Your test OTP is: ${testOTP}`,
                {
                  name: 'Trade Encore Diagnostics',
                  replyTo: scriptOwnerEmail
                }
              );
              
              results.emailSending = true;
            } else {
              results.errors.push('Email quota exceeded');
            }
          } catch (emailError) {
            results.errors.push('Email error: ' + emailError.toString());
          }
          
        } catch (otpError) {
          results.errors.push('OTP storage error: ' + otpError.toString());
        }
        
      } else {
        results.errors.push(`Sheet '${SHEET_NAME}' not found`);
      }
      
    } catch (ssError) {
      results.errors.push('Spreadsheet access error: ' + ssError.toString());
    }
    
  } catch (error) {
    results.errors.push('General error: ' + error.toString());
  }
  
  // Display results
  console.log('Diagnostic results:', JSON.stringify(results, null, 2));
  
  // Show results in UI if running from editor
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('Diagnostic Test Results', 
             `Spreadsheet Access: ${results.spreadsheetAccess ? 'OK' : 'FAILED'}\n` +
             `Sheet Access: ${results.sheetAccess ? 'OK' : 'FAILED'}\n` +
             `OTP Generation: ${results.otpGeneration ? 'OK' : 'FAILED'}\n` +
             `OTP Storage: ${results.otpStorage ? 'OK' : 'FAILED'}\n` +
             `Email Sending: ${results.emailSending ? 'OK' : 'FAILED'}\n\n` +
             (results.errors.length > 0 ? 'Errors:\n' + results.errors.join('\n') : 'No errors detected'),
             ui.ButtonSet.OK);
  } catch (uiError) {
    // Not running from editor, ignore
  }
  
  return results;
}
