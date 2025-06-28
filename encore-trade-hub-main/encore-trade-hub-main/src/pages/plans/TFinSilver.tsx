import PlanDetail from '@/components/PlanDetail';

const TFinSilver = () => {
  const planDetails = {
    title: "T-Fin Silver Plan",
    description: "Essential investment guidance with integrated tax planning support",
    monthlyPrice: "225",
    yearlyPrice: "2,250",
    features: [
      "📰 Insightful Trade Blog",
      "📈 Timely Market Analysis",
      "🔓 Hassle-Free Demat Account Opening",
      "🚀 2 Curated Investment Recommendations",
      "📑 Seamless Income Tax Filing"
    ],
    benefits: [
      {
        title: "Tax Filing Support",
        description: "Professional assistance with income tax return filing",
        icon: "📑"
      },
      {
        title: "Market Insights",
        description: "Regular market analysis and investment opportunities",
        icon: "📈"
      },
      {
        title: "Account Setup",
        description: "Complete assistance in setting up your Demat account",
        icon: "🔓"
      },
      {
        title: "Curated Recommendations",
        description: "2 expert-picked investment recommendations monthly",
        icon: "🚀"
      },
      {
        title: "Premium Content",
        description: "Access to our comprehensive trade blog and analysis",
        icon: "📰"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default TFinSilver;
