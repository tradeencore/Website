import PlanDetail from '@/components/PlanDetail';

const TFinGold = () => {
  const planDetails = {
    title: "T-Fin Gold Plan",
    description: "Comprehensive investment and tax planning solution for growing investors",
    monthlyPrice: "425",
    yearlyPrice: "4,250",
    popular: true,
    features: [
      "📰 Insightful Trade Blog",
      "📈 Timely Market Analysis",
      "📑 Hassle-Free IT Return Filing",
      "🔓 Demat A/c Opening Assistance",
      "🚀 10 Curated Recommendations/Month",
      "🌐 Strategic Tax-Saving Investments",
      "🛡 Expert Risk Management",
      "📱 Prompt Query Support",
      "💸 10% Off on Courses"
    ],
    benefits: [
      {
        title: "Tax Planning",
        description: "Comprehensive tax planning and return filing assistance",
        icon: "📑"
      },
      {
        title: "Premium Recommendations",
        description: "10 carefully curated investment recommendations monthly",
        icon: "🚀"
      },
      {
        title: "Tax-Saving Strategy",
        description: "Strategic guidance on tax-saving investment opportunities",
        icon: "🌐"
      },
      {
        title: "Risk Management",
        description: "Expert risk assessment and portfolio management",
        icon: "🛡"
      },
      {
        title: "Priority Support",
        description: "Quick response to all your investment and tax queries",
        icon: "📱"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default TFinGold;
