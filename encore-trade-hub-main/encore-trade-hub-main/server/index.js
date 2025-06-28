const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { planId, interval, customerId } = req.body;

    // Get the plan details (you should store these in a database)
    const plans = {
      'fin-silver': {
        monthly: { amount: 9900, currency: 'INR' }, // Amount in paise
        yearly: { amount: 99000, currency: 'INR' },
      },
      'fin-gold': {
        monthly: { amount: 29900, currency: 'INR' },
        yearly: { amount: 299000, currency: 'INR' },
      },
      'fin-platinum': {
        monthly: { amount: 49900, currency: 'INR' },
        yearly: { amount: 499000, currency: 'INR' },
      },
      't-fin-silver': {
        monthly: { amount: 22500, currency: 'INR' },
        yearly: { amount: 225000, currency: 'INR' },
      },
      't-fin-gold': {
        monthly: { amount: 42500, currency: 'INR' },
        yearly: { amount: 425000, currency: 'INR' },
      },
      't-fin-platinum': {
        monthly: { amount: 62500, currency: 'INR' },
        yearly: { amount: 625000, currency: 'INR' },
      },
    };

    const plan = plans[planId][interval];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan or interval' });
    }

    // Create a Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: interval === 'monthly' ? 12 : 1, // 12 months or 1 year
      notes: {
        customerId,
        planId,
        interval,
      },
    });

    res.json(subscription);
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Verify payment
app.post('/api/subscriptions/verify', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    // Verify the payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      // Here you should update your database to mark the subscription as active
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get active subscription
app.get('/api/subscriptions/active', async (req, res) => {
  try {
    const customerId = req.headers['x-customer-id'];
    if (!customerId) {
      return res.status(401).json({ error: 'Customer ID required' });
    }

    // Here you should query your database for the customer's active subscription
    // For now, we'll query Razorpay directly
    const subscriptions = await razorpay.subscriptions.all({
      from: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
    });

    const activeSubscription = subscriptions.items.find(
      (sub) => sub.notes.customerId === customerId && sub.status === 'active'
    );

    if (activeSubscription) {
      res.json(activeSubscription);
    } else {
      res.status(404).json({ error: 'No active subscription found' });
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
