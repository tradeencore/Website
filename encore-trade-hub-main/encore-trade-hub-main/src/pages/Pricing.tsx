import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PricingCardProps {
  title: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  popular?: boolean;
  link: string;
  onGetStarted: (link: string) => void;
};

const PricingCard = ({ title, monthlyPrice, yearlyPrice, features, link, popular = false, onGetStarted }: PricingCardProps) => (
  <Card className={`p-6 border-2 ${popular ? 'border-[#2962ff]' : 'border-[var(--tv-border-color)]'} transition-all duration-200 hover:shadow-lg relative bg-[var(--tv-background)]`}>
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-[#2962ff] text-white px-4 py-1 rounded-full text-sm font-semibold">
          MOST POPULAR
        </span>
      </div>
    )}
    <h3 className="text-xl font-bold text-[var(--tv-text-primary)] mb-4">{title}</h3>
    <div className="space-y-4 mb-6">
      <div>
        <p className="text-sm text-[var(--tv-text-secondary)]">Monthly</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-[var(--tv-text-primary)]">₹{monthlyPrice}</span>
          <span className="text-[var(--tv-text-secondary)] ml-1">/month</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--tv-text-secondary)]">Yearly</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-[var(--tv-text-primary)]">₹{yearlyPrice}</span>
          <span className="text-[var(--tv-text-secondary)] ml-1">/year</span>
        </div>
      </div>
    </div>
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-[var(--tv-text-primary)] leading-snug">
          <span className="mr-2 text-xl leading-none mt-1">{feature.split(' ')[0]}</span>
          <span>{feature.split(' ').slice(1).join(' ')}</span>
        </li>
      ))}
    </ul>
    <Button 
      className={`w-full ${popular ? 'bg-[#2962ff]' : 'bg-[var(--tv-button-secondary)]'} text-white hover:bg-opacity-90 transition-all duration-200`}
      onClick={() => onGetStarted(link)}
    >
      Get Started
    </Button>
  </Card>
);

const Pricing = () => {
  const navigate = useNavigate();
  const plans = [
    {
      title: "Test Plan ₹7",
      monthlyPrice: "7",
      yearlyPrice: "70",
      features: [
        "🧪 Test Subscription",
        "📊 Full Dashboard Access",
        "🔍 Complete Testing Flow",
        "⏱️ Quick Trial Experience"
      ],
      link: "/plans/test-plan"
    },
    {
      title: "Fin Silver",
      monthlyPrice: "99",
      yearlyPrice: "990",
      features: [
        "📰 Free Trade Blog",
        "📈 Updated Analysis",
        "🔓 Demat A/c Opening Support",
        "🚀 2 Recommendations/Month"
      ],
      link: "/plans/fin-silver"
    },
    {
      title: "Fin Gold",
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
      link: "/plans/fin-gold"
    },
    {
      title: "Fin Platinum",
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
      link: "/plans/fin-platinum"
    },
    {
      title: "T-Fin Silver",
      monthlyPrice: "225",
      yearlyPrice: "2,250",
      features: [
        "📰 Insightful Trade Blog",
        "📈 Timely Market Analysis",
        "🔓 Hassle-Free Demat Account Opening",
        "🚀 2 Curated Investment Recommendations",
        "📑 Seamless Income Tax Filing"
      ],
      link: "/plans/t-fin-silver"
    },
    {
      title: "T-Fin Gold",
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
      link: "/plans/t-fin-gold"
    },
    {
      title: "T-Fin Platinum",
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
      link: "/plans/t-fin-platinum"
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2962ff] mb-4 font-heading">Become a Member</h1>
        <p className="text-xl text-[var(--tv-text-secondary)]">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingCard key={plan.title} {...plan} onGetStarted={navigate} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-[#2962ff] mb-4 font-heading">Need Help Choosing?</h2>
        <p className="text-[var(--tv-text-secondary)] mb-6">Contact us for personalized recommendations</p>
        <Button 
          className="w-full bg-[#2962ff] text-white hover:bg-[#2962ff]/90"
          onClick={() => navigate('/contact')}
          variant="default"
        >
          Contact Us
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
