import PlanDetail from '@/components/PlanDetail';

const FinSilver = () => {
  const planDetails = {
    title: "Fin Silver Plan",
    description: "Start your investment journey with essential market insights and expert recommendations",
    monthlyPrice: "99",
    yearlyPrice: "990",
    features: [
      "📰 Free Trade Blog",
      "📈 Updated Analysis",
      "🔓 Demat A/c Opening Support",
      "🚀 2 Recommendations/Month"
    ],
    benefits: [
      {
        title: "Market Analysis",
        description: "Get regular updates on market trends and analysis to make informed investment decisions",
        icon: "📈"
      },
      {
        title: "Trade Blog Access",
        description: "Access our comprehensive trade blog with insights from industry experts",
        icon: "📰"
      },
      {
        title: "Account Support",
        description: "Hassle-free Demat account opening with our dedicated support team",
        icon: "🔓"
      },
      {
        title: "Expert Recommendations",
        description: "Receive 2 carefully curated investment recommendations every month",
        icon: "🚀"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default FinSilver;
