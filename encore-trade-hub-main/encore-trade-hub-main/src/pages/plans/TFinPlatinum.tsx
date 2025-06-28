import PlanDetail from '@/components/PlanDetail';

const TFinPlatinum = () => {
  const planDetails = {
    title: "T-Fin Platinum Plan",
    description: "Elite investment strategies with comprehensive tax planning for professional traders",
    monthlyPrice: "625",
    yearlyPrice: "6,250",
    features: [
      "📰 Insightful Trade Blog",
      "🔓 Seamless Demat A/c Opening",
      "🚀 15 Curated Recommendations/Month",
      "📑 Hassle-Free IT Return Filing",
      "🌐 Expert Risk Management",
      "📱 Direct Query Support",
      "💸 10% Off on Courses",
      "📊 Advanced F&O Strategies",
      "📈 Mastering Index Options Trading"
    ],
    benefits: [
      {
        title: "Elite Recommendations",
        description: "15 premium investment recommendations with detailed analysis",
        icon: "🚀"
      },
      {
        title: "Advanced Trading",
        description: "Expert guidance on F&O and Index Options trading",
        icon: "📊"
      },
      {
        title: "Tax Excellence",
        description: "Premium tax planning and filing services",
        icon: "📑"
      },
      {
        title: "Direct Support",
        description: "Direct access to senior analysts for personalized guidance",
        icon: "📱"
      },
      {
        title: "Risk Mastery",
        description: "Advanced risk management strategies for complex portfolios",
        icon: "🌐"
      }
    ]
  };

  return <PlanDetail {...planDetails} />;
};

export default TFinPlatinum;
