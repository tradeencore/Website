
# Trade Encore - SEBI Registered Research Analyst Platform

A modern, professional website for Trade Encore, a SEBI Registered Research Analyst (Reg. No. INH000009269), built with React, TypeScript, and Tailwind CSS, integrated with Google Apps Script backend and Razorpay payment gateway.

## 🚀 Features

### Core Features
- **Professional Design**: Modern, responsive UI with Trade Encore branding
- **SEBI Compliance**: Full regulatory compliance with proper disclaimers
- **Client Dashboard**: Comprehensive research reports and market analysis
- **Payment Integration**: Razorpay subscription-based payment system
- **Google Apps Script Backend**: Serverless backend for data and authentication

### Research Services
- Daily Market Outlook
- Long Term Investment Recommendations
- Positional Trading Strategies
- Derivative Recommendations
- Mutual Fund Advisory
- Professional PDF Report Generation

### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Secure Authentication**: Google Apps Script powered login system
- **Payment Processing**: Razorpay integration for subscription management
- **PDF Generation**: Automated research report creation
- **Admin Panel**: Secure credential management interface

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Google Apps Script
- **Payment**: Razorpay Payment Gateway
- **Data Storage**: Google Sheets
- **Hosting**: Ready for GlobeHost deployment

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Footer.tsx
│   └── SEBIBadge.tsx
├── pages/              # Application pages
│   ├── Index.tsx       # Homepage
│   ├── Login.tsx       # Client login
│   ├── Dashboard.tsx   # Client dashboard
│   ├── Disclaimer.tsx  # SEBI disclaimers
│   └── AdminPanel.tsx  # Admin interface
├── utils/              # Utility functions
│   ├── googleAppsScript.ts
│   └── razorpayService.ts
└── hooks/              # Custom React hooks
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Apps Script project
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trade-encore
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## 🔧 Configuration

### Google Apps Script Setup

1. Create a new Google Apps Script project
2. Set up the following functions in your script:

```javascript
// Main functions required
function doGet() { /* Serve the dashboard */ }
function validateLogin(username, password) { /* Authenticate users */ }
function downloadReport(type) { /* Generate PDF reports */ }
function getLogoImage() { /* Retrieve company logo */ }
function verifyPayment(paymentId, subscriptionId) { /* Verify Razorpay payments */ }
function storeLogoInProperties() { /* Cache logo */ }
function generateResearchReport(type) { /* Create research PDFs */ }
function getResearchReports(type) { /* Get report metadata */ }
```

3. Deploy as a web app with public access
4. Update the Google Sheet ID in the script (currently: `1uOzYOgbP23GcgiOhZDnzIOrVRX5iL2tkN4M_lOt3n-k`)

### Razorpay Configuration

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API Key ID and Secret from the dashboard
3. Access the admin panel at `/admin` (password: `tradeencore_admin_2024`)
4. Enter your Razorpay credentials securely

### Environment Variables

The application uses Google Apps Script's PropertiesService for secure credential storage:
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

## 💳 Payment Integration

The platform supports subscription-based payments with three tiers:

- **Basic Plan**: ₹2,999/month
- **Premium Plan**: ₹4,999/month (Most Popular)
- **Professional Plan**: ₹7,999/month (Best Value)

### Payment Flow
1. User selects a subscription plan
2. Razorpay checkout modal opens
3. Payment processing via Razorpay
4. Backend verification through Google Apps Script
5. User access granted upon successful payment

## 📊 Data Structure

### Google Sheets Schema

**Login Sheet** (for user authentication):
```
| Username | Password | ClientName | SubscriptionStatus | PlanType | ExpiryDate |
```

### Report Types
- Long Term Recommendations
- Positional Trading
- Derivative Strategies
- Mutual Fund Advisory

## 🔒 Security Features

- SEBI compliant data handling
- Secure credential storage in Google Apps Script
- Payment verification through Razorpay webhooks
- Client authentication with session management
- Admin panel with secure access

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🚀 Deployment

### GlobeHost Deployment

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder contents to your GlobeHost `public_html` directory

3. Configure DNS settings:
   - Point your domain to GlobeHost servers
   - Set up subdomain if needed (e.g., `dashboard.tradeencore.com`)

### Google Apps Script Deployment

1. Deploy your Google Apps Script as a web app
2. Set execution permissions to "Anyone"
3. Update the script URL in your frontend configuration

## 🧪 Testing

### Demo Credentials
- **Client Login**: 
  - Username: `demo`
  - Password: `demo123`
- **Admin Panel**: 
  - Password: `tradeencore_admin_2024`

### Payment Testing
Use Razorpay's test mode with test card numbers provided in their documentation.

## 📋 SEBI Compliance

The platform includes all required SEBI compliance features:

- **Registration Display**: SEBI Reg. No. INH000009269 prominently displayed
- **Risk Disclaimers**: Comprehensive risk disclosures on all pages
- **Regulatory Links**: Direct links to SEBI registration verification
- **Data Protection**: Secure handling of client information
- **Professional Standards**: Adherence to research analyst regulations

## 🤝 Support

For technical support or questions:

- **Email**: support@tradeencore.com
- **Phone**: +91 12345 67890
- **Address**: C/O Aster Coworking, 301, Trimurti Honey Gold, Ashok Nagar, Range Hill Rd, above Axis Bank, Shivajinagar, Pune, Maharashtra 411007

## 📜 License

This project is proprietary software owned by Trade Encore. All rights reserved.

## 🔄 Version History

- **v1.0.0**: Initial release with full functionality
  - Complete website replication
  - Google Apps Script integration
  - Razorpay payment gateway
  - Admin panel
  - SEBI compliance features

## 🛠 Maintenance

### Regular Updates Required
- Update SEBI disclaimers as per regulatory changes
- Refresh research reports and market data
- Monitor payment gateway integration
- Update security certificates
- Backup Google Sheets data regularly

### Performance Monitoring
- Monitor Google Apps Script execution limits
- Track payment success rates
- Monitor website performance and uptime
- Regular security audits

---

**Trade Encore** - Professional Stock Market Research & Analysis  
SEBI Registered Research Analyst - Reg. No. INH000009269
