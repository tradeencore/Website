/**
 * Trade Encore - OTP Diagnostic Tool
 * 
 * This script helps diagnose issues with OTP sending and storage in the Google Apps Script backend.
 * Copy and paste this function into your Google Apps Script editor and run it to diagnose issues.
 */

// Diagnostic function to test OTP functionality
function diagnoseOtpIssues() {
  const results = {
    timestamp: new Date().toISOString(),
    spreadsheet: {},
    sheets: {},
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
      
      // 3. Check all required sheets
      // Users sheet
      let usersSheet = ss.getSheetByName(USERS_SHEET);
      results.sheets.users = {
        exists: !!usersSheet
      };
      
      if (usersSheet) {
        const usersData = usersSheet.getDataRange().getValues();
        results.sheets.users.rowCount = usersData.length;
        results.sheets.users.headers = usersData[0];
        results.sheets.users.sampleData = usersData.length > 1 ? usersData[1] : null;
      }
      
      // OTPs sheet
      let otpSheet = ss.getSheetByName(OTPS_SHEET);
      results.sheets.otps = {
        exists: !!otpSheet
      };
      
      if (!otpSheet) {
        // Create OTPs sheet if it doesn't exist
        try {
          otpSheet = ss.insertSheet(OTPS_SHEET);
          otpSheet.appendRow(['Email', 'Phone', 'EmailOTP', 'PhoneOTP', 'Expiry']);
          results.sheets.otps.created = true;
        } catch (createError) {
          results.sheets.otps.createError = createError.toString();
        }
      } else {
        const otpsData = otpSheet.getDataRange().getValues();
        results.sheets.otps.rowCount = otpsData.length;
        results.sheets.otps.headers = otpsData[0];
        // Don't include actual OTPs in the results for security
        results.sheets.otps.hasData = otpsData.length > 1;
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
        if (otpSheet) {
          // First try to remove any existing OTPs for this email
          const otpsData = otpSheet.getDataRange().getValues();
          let existingRowIndex = -1;
          
          for (let i = 1; i < otpsData.length; i++) {
            if (otpsData[i][0] && String(otpsData[i][0]).trim().toLowerCase() === testEmail.toLowerCase()) {
              existingRowIndex = i;
              break;
            }
          }
          
          if (existingRowIndex > 0) {
            try {
              otpSheet.deleteRow(existingRowIndex + 1);
              results.otp.existingDeleted = true;
            } catch (deleteError) {
              results.otp.deleteError = deleteError.toString();
            }
          }
          
          // Now add the new OTP
          const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes
          try {
            otpSheet.appendRow([testEmail, '', otp, '', expiry.toISOString()]);
            results.otp.stored = true;
          } catch (appendError) {
            results.otp.appendError = appendError.toString();
            
            // Try alternative method
            try {
              const lastRow = otpSheet.getLastRow();
              otpSheet.getRange(lastRow + 1, 1, 1, 5).setValues([[testEmail, '', otp, '', expiry.toISOString()]]);
              results.otp.storedAlternative = true;
            } catch (alternativeError) {
              results.otp.alternativeError = alternativeError.toString();
            }
          }
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
    
    // 6. Check script properties
    try {
      const scriptProperties = PropertiesService.getScriptProperties().getProperties();
      results.properties = {
        exists: Object.keys(scriptProperties).length > 0,
        keys: Object.keys(scriptProperties)
      };
    } catch (propError) {
      results.properties = {
        error: propError.toString()
      };
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
