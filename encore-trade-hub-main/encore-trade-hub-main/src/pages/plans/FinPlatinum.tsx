import PlanDetail from '@/components/PlanDetail';

const FinPlatinum = () => {
  const planDetails = {
    title: "Fin Platinum Plan",
    description: "Advanced trading strategies and premium support for professional traders",
    monthlyPrice: "499",
    yearlyPrice: "4,990",
    features: [
      "📰 Free Trade Blog",
      "🔓 Demat A/c Opening Support",
      "🚀 15 Recommendations per Month",
      "🌐 Risk Management",
      "📱 Query Support",
      "💸 10% Off on Courses",
      "📊 F&O Strategies",
      "📈 Trading Index Options"
    ],
    benefits: [
      {
        title: "Premium Recommendations",
        description: "Receive 15 high-quality investment recommendations monthly",
        icon: "🚀"
      },
      {
        title: "F&O Trading",
        description: "Advanced Futures & Options trading strategies and guidance",
        icon: "📊"
      },
      {
        title: "Index Options",
        description: "Expert insights on index options trading opportunities",
        icon: "📈"
      },
      {
        title: "Elite Support",
        description: "Priority access to our expert team for personalized guidance",
        icon: "📱"
      },
      {
        title: "Risk Analysis",
        description: "Comprehensive risk management strategies for advanced trading",
        icon: "🌐"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default FinPlatinum;
