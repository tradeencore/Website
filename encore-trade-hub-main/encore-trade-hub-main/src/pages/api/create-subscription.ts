import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define proper types for request and response
type RequestBody = {
  plan: string;
  interval: 'monthly' | 'yearly';
  amount: string;
};

export default async function handler(req: { method: string; body: RequestBody }, res: { status: (code: number) => { json: (data: any) => any } }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { plan, interval, amount } = req.body;

    // Create a subscription plan if it doesn't exist
    const plan_id = await createOrGetPlan(plan, interval, amount);

    // Create a subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count: interval === 'monthly' ? 12 : 1, // 12 charges for monthly, 1 for yearly
      notes: {
        plan_name: plan,
        interval: interval
      }
    });

    return res.status(200).json(subscription);
  } catch (error) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({ message: 'Error creating subscription' });
  }
}

async function createOrGetPlan(planName: string, interval: 'monthly' | 'yearly', amount: string) {
  // This should be stored and retrieved from your database
  // Here's a simple implementation
  try {
    // Interval is already typed as 'monthly' | 'yearly'
    
    const plan = await razorpay.plans.create({
      period: interval,
      interval: 1,
      item: {
        name: planName,
        amount: parseInt(amount) * 100, // Convert to paise
        currency: 'INR'
      },
      notes: {
        plan_name: planName
      }
    });

    return plan.id;
  } catch (error) {
    console.error('Plan creation error:', error);
    throw error;
  }
}
