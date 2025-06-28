
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, FileText, PieChart, BarChart, Shield, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Daily Market Outlook",
      description: "Comprehensive daily analysis of market trends, sector performance, and trading opportunities."
    },
    {
      icon: FileText,
      title: "Long Term Recommendations",
      description: "Strategic investment recommendations for wealth creation with detailed fundamental analysis."
    },
    {
      icon: BarChart,
      title: "Positional Trading",
      description: "Short to medium-term trading strategies with technical analysis and risk management."
    },
    {
      icon: PieChart,
      title: "Derivative Strategies",
      description: "Options and futures strategies for hedging and income generation with calculated risks."
    },
    {
      icon: Shield,
      title: "Mutual Fund Advisory",
      description: "Curated mutual fund recommendations aligned with your investment goals and risk profile."
    },
    {
      icon: Users,
      title: "Expert Research Team",
      description: "SEBI registered analysts with years of market experience and proven track record."
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Research Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access professional-grade research and analysis across all market segments 
            with our SEBI registered expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-primary/5 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">SEBI Compliance & Transparency</h3>
            <p className="text-muted-foreground mb-4">
              All our research and recommendations are backed by SEBI registered analysts, 
              ensuring compliance with regulatory standards and ethical practices.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Registration No: INH000009269</p>
              <a href="/disclaimer" className="text-primary hover:underline">
                View complete disclaimer and risk disclosures
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
