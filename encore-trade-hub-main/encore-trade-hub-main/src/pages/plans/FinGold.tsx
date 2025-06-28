import PlanDetail from '@/components/PlanDetail';

const FinGold = () => {
  const planDetails = {
    title: "Fin Gold Plan",
    description: "Our most popular plan for serious investors seeking comprehensive market insights and expert guidance",
    monthlyPrice: "299",
    yearlyPrice: "2,990",
    popular: true,
    features: [
      "📰 Free Trade Blog",
      "📈 Updated Analysis",
      "🔓 Demat A/c Opening Support",
      "🚀 10 Recommendations/Month",
      "🌐 Tax-saving Investments",
      "🛡️ Risk Management",
      "📱 Query Support",
      "💸 10% Off on Courses"
    ],
    benefits: [
      {
        title: "Enhanced Recommendations",
        description: "Get 10 premium investment recommendations monthly, carefully selected by our experts",
        icon: "🚀"
      },
      {
        title: "Risk Management",
        description: "Professional risk assessment and management strategies for your portfolio",
        icon: "🛡️"
      },
      {
        title: "Priority Support",
        description: "Direct access to our support team for all your investment queries",
        icon: "📱"
      },
      {
        title: "Tax Benefits",
        description: "Expert guidance on tax-saving investment opportunities",
        icon: "🌐"
      },
      {
        title: "Course Discounts",
        description: "Exclusive 10% discount on all Trade Encore educational courses",
        icon: "💸"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default FinGold;
