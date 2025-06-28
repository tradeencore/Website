
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, ExternalLink, ArrowLeft } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">TE</span>
              </div>
              <span className="text-primary-foreground font-bold text-lg">Trade Encore</span>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Risk Disclaimer & Disclosures
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Important information about investment risks, SEBI regulations, and our research methodology
            </p>
          </div>

          {/* SEBI Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                SEBI Registration Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Registration Number</h4>
                  <p className="text-muted-foreground">INH000009269</p>
                </div>
                <div>
                  <h4 className="font-semibold">Registration Date</h4>
                  <p className="text-muted-foreground">Valid & Active</p>
                </div>
              </div>
              <div className="mt-4">
                <a 
                  href="https://tradeencore.com/certifications/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Verify SEBI Registration <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Investment Risk Warning */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Investment Risk Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-800">
              <p className="font-semibold mb-2">
                Investment in securities market are subject to market risks. Read all the related documents carefully before investing.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Past performance is not indicative of future results</li>
                <li>• All investments carry the risk of capital loss</li>
                <li>• Market volatility can significantly impact investment values</li>
                <li>• Derivative instruments carry additional risks</li>
              </ul>
            </CardContent>
          </Card>

          {/* General Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>General Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Research Reports and Recommendations</h4>
                <p className="text-muted-foreground">
                  All research reports, analysis, and recommendations provided by Trade Encore are based on publicly available information 
                  and our professional analysis. These should not be construed as personalized investment advice and are meant for 
                  educational and informational purposes only.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">No Guarantee of Returns</h4>
                <p className="text-muted-foreground">
                  Trade Encore does not guarantee any returns on investments. All recommendations are subject to market risks, 
                  and investors should conduct their own research and consult with qualified financial advisors before making 
                  investment decisions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Conflicts of Interest</h4>
                <p className="text-muted-foreground">
                  Trade Encore and its analysts may hold positions in the securities mentioned in research reports. 
                  Any such positions will be disclosed in the research reports where applicable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-muted-foreground">
                  Trade Encore shall not be liable for any losses, damages, or expenses arising from the use of our research 
                  reports or recommendations. Investors are solely responsible for their investment decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEBI Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>SEBI Guidelines Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Research Analyst Regulations</h4>
                <p className="text-muted-foreground">
                  Trade Encore operates in full compliance with SEBI (Research Analysts) Regulations, 2014. 
                  Our research process follows established methodologies and maintains the highest standards of integrity.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Code of Conduct</h4>
                <p className="text-muted-foreground">
                  All research analysts at Trade Encore adhere to SEBI's code of conduct, which includes provisions for 
                  avoiding conflicts of interest, maintaining confidentiality, and ensuring fair dealing.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Client Grievance</h4>
                <p className="text-muted-foreground">
                  For any grievances or complaints, clients can contact us at support@tradeencore.com or through our 
                  official contact channels. We are committed to resolving all client concerns promptly and fairly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Registered Office</h4>
                <p className="text-muted-foreground">
                  <a 
                    href="https://maps.app.goo.gl/UiitouMd1FjtJ7d7A" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#2962ff] transition-colors"
                  >
                    C/O Aster Coworking, 301, Trimurti Honey Gold, Ashok Nagar,<br />
                    Range Hill Rd, above Axis Bank, Shivajinagar, Pune, Maharashtra 411007
                  </a>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-muted-foreground">contactus@tradeencore.com</p>
                </div>
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-muted-foreground">+919699187139</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                Registration granted by SEBI, membership of BASL and certification from NISM in no way guarantee 
                performance of the intermediary or provide any assurance of returns to investors. The securities quoted 
                are exemplary and are not recommendatory. Please read the Risk Disclosure Documents carefully before 
                investing. Investments in securities market are subject to market risks, read all the related documents 
                carefully before investing.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Disclaimer;
