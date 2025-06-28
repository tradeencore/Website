// Store the logo as a blob in script properties
function storeLogoInProperties() {
  const logoBlob = DriveApp.getFileById('19yplHAXm8LhSFg2V8gpXhh9IPgVcCkl0').getBlob();
  const base64Logo = Utilities.base64Encode(logoBlob.getBytes());
  PropertiesService.getScriptProperties().setProperty('logoImage', base64Logo);
}

function getLogoImage() {
  try {
    // Return cached logo if available
    if (cachedLogo) {
      Logger.log('Returning cached logo');
      return cachedLogo;
    }

    Logger.log('Getting logo image from Drive');
    const logoBlob = DriveApp.getFileById('19yplHAXm8LhSFg2V8gpXhh9IPgVcCkl0').getBlob();
    const base64Logo = Utilities.base64Encode(logoBlob.getBytes());
    Logger.log('Logo retrieved and encoded successfully');
    
    // Cache the logo
    cachedLogo = base64Logo;
    return base64Logo;
  } catch (error) {
    Logger.log('Error getting logo: ' + error.toString());
    return ''; // Return empty string instead of throwing error
  }
}

// Cache the logo in script properties for better performance
let cachedLogo = null;

function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  template.getLogoImage = getLogoImage;
  return template.evaluate()
    .setTitle('Trade Encore - Client Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setHeight(800);
}

function validateLogin(username, password) {
  try {
    // Ensure inputs are strings and trim them
    username = (username || '').toString().trim();
    password = (password || '').toString().trim();
    
    Logger.log('Validating login for username: ' + username);
    
    // Get all sheets in the spreadsheet
    var spreadsheet = SpreadsheetApp.openById('1uOzYOgbP23GcgiOhZDnzIOrVRX5iL2tkN4M_lOt3n-k');
    var sheets = spreadsheet.getSheets();
    Logger.log('Total sheets found: ' + sheets.length);
    
    // Try to find the Login sheet
    var sheet = spreadsheet.getSheetByName('Login');
    if (!sheet) {
      // If Login sheet not found, try the first sheet
      sheet = sheets[0];
      Logger.log('Login sheet not found, using first sheet: ' + sheet.getName());
    } else {
      Logger.log('Found Login sheet');
    }
    
    // Get the data from the sheet
    var data = sheet.getDataRange().getValues();
    Logger.log('Data rows found: ' + data.length);
    
    if (data.length > 0) {
      Logger.log('Headers: ' + JSON.stringify(data[0]));
    }
    
    // Check each row for matching credentials
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row.length < 3) continue; // Skip invalid rows
      
      var currentUsername = (row[1] || '').toString().trim();
      var currentPassword = (row[2] || '').toString().trim();
      var currentClient = (row[0] || '').toString().trim();
      
      Logger.log('Checking row ' + i + ':\n' +
                'Stored username: "' + currentUsername + '"\n' +
                'Input username: "' + username + '"\n' +
                'Stored password length: ' + currentPassword.length + '\n' +
                'Input password length: ' + password.length);
      
      if (currentUsername === username && currentPassword === password) {
        Logger.log('Credentials matched for client: ' + currentClient);
        return {
          success: true,
          clientName: currentClient,
          message: 'Login successful'
        };
      }
    }
    
    Logger.log('No matching credentials found');
    return {
      success: false,
      message: 'Invalid username or password'
    };
    
  } catch (error) {
    Logger.log('Error in validateLogin: ' + error.toString());
    return {
      success: false,
      message: 'System error: ' + error.toString()
    };
  }
}

function generateResearchReport(type) {
  try {
    Logger.log('Starting PDF generation for type: ' + type);
    
    // Create PDF content
    const doc = DocumentApp.create('Trade Encore - Research Report');
    const body = doc.getBody();
    
    // Clear default margins
    body.setMarginTop(36).setMarginBottom(36).setMarginLeft(36).setMarginRight(36);
    
    // Add header with logo
    Logger.log('Adding logo to PDF');
    const logoBlob = DriveApp.getFileById('19yplHAXm8LhSFg2V8gpXhh9IPgVcCkl0').getBlob();
    const header = body.insertImage(0, logoBlob);
    header.setWidth(100).setHeight(50);
  
  // Add title and address
  body.appendParagraph('Trade Encore: SEBI Registered Research Analyst (Reg. No. INH000009269)')
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph('C/O Aster Coworking, 301, Trimurti Honey Gold, Ashok Nagar, Range Hill Rd,\nabove Axis Bank, Shivajinagar, Pune, Maharashtra 411007')
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  // Add report details
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  body.appendParagraph('\nResearch Report - ' + currentDate)
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Trade Encore – Research Report');
  body.appendParagraph('Type: ' + type + ' Investment View');
  body.appendParagraph('Basis: Technical Analysis');
  body.appendParagraph('Timeframe Considered: Weekly\n');
  
  // Add Buy Recommendations section
  body.appendParagraph('Buy Recommendations:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  const buyTable = body.appendTable([['Stock', 'Price', 'Rationale Summary']]);
  buyTable.getRow(0).editAsText().setBold(true);
  
  // Add sample buy recommendation
  const buyRow = buyTable.appendTableRow();
  buyRow.appendTableCell('ONGC').editAsText().setBold(true);
  buyRow.appendTableCell('₹166.75');
  buyRow.appendTableCell('EMA crossover and RSI > 60. Momentum shift visible. Volume accumulation on dips. Long-term entry favoured.');
  
  // Add Sell Recommendations section
  body.appendParagraph('\nSell Recommendations:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  const sellTable = body.appendTable([['Stock', 'Price', 'Rationale Summary']]);
  sellTable.getRow(0).editAsText().setBold(true);
  
  // Add disclosures
  body.appendParagraph('\nDisclosures:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph('• Conflict of Interest: None.');
  body.appendParagraph('• Compensation: No compensation received from companies mentioned.');
  body.appendParagraph('• Holdings: No positions held in these stocks by the analyst or their relatives.');
  body.appendParagraph('• Past Recommendations: No similar recommendations in the last 30 days.');
  body.appendParagraph('• Limitations: Market conditions and unforeseen developments may affect the performance of the recommendations.');
  
  // Add Risk Factors & Disclaimers
  body.appendParagraph('\nRisk Factors & Disclaimers:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph('• Investments in securities markets are subject to market risks.');
  body.appendParagraph('• These are risk-optimized recommendations and not tailored to individual clients.');
  body.appendParagraph('• Past performance is not indicative of future returns.');
  body.appendParagraph('• Trade Encore does not offer guaranteed returns, PMS, or demat services.');
  
  // Add signature and registration details
  body.appendParagraph('\n\nRA Shaunak Mainkar');
  body.appendParagraph('SEBI Reg. No.: INH000009269');
  
  // Add full disclaimer
  body.appendParagraph('\nDISCLAIMER:')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph('Trade Encore is a SEBI Registered Research Analyst with registration number INH000009269. Trade Encore does NOT provide Demat handling services or Portfolio Management services of any kind.\n\n' +
    'Registration granted by SEBI, membership of a SEBI-recognized supervisory body, and certification from NISM in no way guarantee performance or provide any assurance of returns. Any guidance/recommendation provided by us is to be executed at their own risk by client only.\n\n' +
    'Investment in securities markets are subject to market risks. Read all the related documents carefully before investing.\n\n' +
    'Past performance is not a guarantee of future performance.\n\n' +
    'The risk of loss in trading and investment in Securities markets including Equities, Derivatives, commodities, and Currency can be substantial.\n\n' +
    'These are leveraged products that carry a substantial risk of loss up to your invested capital and may not be suitable for everyone.\n\n' +
    'You should therefore carefully consider whether such trading is suitable for you in light of your financial condition.\n\n' +
    'Please ensure that you understand fully the risks involved and do invest money according to your risk-bearing capacity.\n\n' +
    'Trade Encore does not guarantee any returns in any of its products or services. Investment in markets is subject to market risk. Hence, Trade Encore is not liable for any losses in any case.');
  
  // Convert to PDF
  Logger.log('Converting to PDF');
  const pdfContent = doc.getAs('application/pdf');
  
  // Delete the temporary Doc
  Logger.log('Cleaning up temporary document');
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  
  Logger.log('PDF generation completed successfully');
  return pdfContent.getBytes();
  } catch (error) {
    Logger.log('Error in generateResearchReport: ' + error.toString());
    throw new Error('Failed to generate PDF report: ' + error.message);
  }
}

function downloadReport(type) {
  try {
    Logger.log('Starting report download for type: ' + type);
    const pdfBytes = generateResearchReport(type);
    const filename = `Trade_Encore_${type}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    Logger.log('Generated filename: ' + filename);
    
    // Convert binary data to base64
    const base64Data = Utilities.base64Encode(pdfBytes);
    Logger.log('PDF data encoded successfully');
    
    return {
      filename: filename,
      content: base64Data,
      mimeType: 'application/pdf'
    };
  } catch (error) {
    Logger.log('Error in downloadReport: ' + error.toString());
    throw new Error('Failed to download report: ' + error.message);
  }
}

function getResearchReports(type) {
  const currentDate = new Date();
  return [
    { 
      title: `Latest ${type} Research Report`, 
      date: currentDate.toLocaleDateString('en-IN'),
      downloadFunction: 'downloadReport',
      reportType: type
    },
    { 
      title: `${type} Research Report - Previous Week`, 
      date: new Date(currentDate.setDate(currentDate.getDate() - 7)).toLocaleDateString('en-IN'),
      downloadFunction: 'downloadReport',
      reportType: type
    }
  ];
}