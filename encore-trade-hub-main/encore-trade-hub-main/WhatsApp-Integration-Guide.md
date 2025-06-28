# WhatsApp Integration Guide for Trade Encore

This guide explains how the WhatsApp number verification and notification system works in the Trade Encore application.

## Overview

The WhatsApp integration consists of two main components:

1. **WhatsApp Number Verification**: Ensures users provide a valid WhatsApp number before completing signup or payment.
2. **WhatsApp Notifications**: Sends personalized messages to users for subscription confirmations and other updates.

## WhatsApp Number Verification Flow

The verification process works as follows:

1. User enters their WhatsApp number during signup (regular or Google OAuth)
2. System validates the number format (10 digits for Indian numbers)
3. System sends a 6-digit verification code to the user's WhatsApp
4. User enters the verification code in the application
5. System verifies the code and marks the number as verified
6. User can proceed with signup or payment only after verification

## Implementation Details

### Backend (Google Apps Script)

The backend handles verification code generation, storage, and verification:

1. **Sending Verification Codes**:
   - Function: `sendWhatsAppVerificationCode(mobile)`
   - Generates a random 6-digit code
   - Stores the code in cache with a 10-minute expiration
   - Sends the code to the user's WhatsApp via Meta WhatsApp Business API

2. **Verifying Codes**:
   - Function: `verifyWhatsAppCode(mobile, code)`
   - Retrieves the stored code from cache
   - Compares with the user-provided code
   - Returns success/failure response

### Frontend (React/TypeScript)

The frontend provides the user interface for number input and verification:

1. **WhatsApp Service**:
   - `requestWhatsAppVerification(mobile)`: Requests a verification code
   - `verifyWhatsAppCode(mobile, code)`: Verifies the entered code

2. **Signup Component**:
   - Includes WhatsApp number input field
   - Validation for 10-digit numbers
   - UI for verification code input
   - Status indicators for verification process

3. **AuthContext**:
   - Stores WhatsApp number in user data
   - Ensures WhatsApp number is included in Google OAuth flow
   - Updates Google Sheets with verified WhatsApp numbers

## WhatsApp Notification Templates

The system uses WhatsApp Business API templates for sending notifications:

1. **Verification Code Template**:
   - Name: `verification_code`
   - Parameters: Code, Expiration time (minutes)

2. **Subscription Confirmation Template**:
   - Name: `subscription_confirmation`
   - Parameters: User name, Plan type, Subscription period, Amount, Expiry date

3. **Trial Expiry Reminder Template**:
   - Name: `trial_expiry`
   - Parameters: User name, Days remaining

## Environment Variables

The following environment variables are required:

### Frontend (.env)
```
VITE_API_URL=<Google Apps Script Web App URL>
VITE_META_WHATSAPP_TOKEN=<WhatsApp API Token>
VITE_META_WHATSAPP_PHONE_ID=<WhatsApp Phone ID>
VITE_META_WHATSAPP_BUSINESS_ACCOUNT_ID=<WhatsApp Business Account ID>
```

### Backend (Google Apps Script Properties)
```
WHATSAPP_TOKEN=<WhatsApp API Token>
WHATSAPP_PHONE_ID=<WhatsApp Phone ID>
```

## Testing the Integration

For testing purposes, the backend currently returns the verification code in the response (via the `testCode` field). This allows you to test the flow without actually receiving WhatsApp messages. In production, this should be removed.

## WhatsApp Business API Setup

To set up the WhatsApp Business API:

1. Create a Meta Developer account at https://developers.facebook.com/
2. Set up a WhatsApp Business account
3. Create a WhatsApp Business API app
4. Configure message templates for verification and notifications
5. Generate an API token and note your Phone ID
6. Add these credentials to your environment variables

## Troubleshooting

Common issues and solutions:

1. **Verification code not being sent**:
   - Check WhatsApp API credentials
   - Ensure the mobile number is in the correct format
   - Verify the WhatsApp template is approved

2. **Verification always failing**:
   - Check if the code is being properly stored in cache
   - Ensure the code comparison is case-sensitive
   - Verify the mobile number format is consistent

3. **WhatsApp number not saving**:
   - Check Google Sheets integration
   - Verify the column mapping in the Google Apps Script
