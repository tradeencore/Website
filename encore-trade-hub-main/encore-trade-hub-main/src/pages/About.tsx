import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Mail, Phone } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* About Header */}
      <div className="bg-[#1a237e] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About Trade Encore</h1>
          <p className="text-lg text-white/90 max-w-3xl">
            Your trusted partner in professional stock market research and investment advisory services.
          </p>
        </div>
      </div>

      {/* About Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1a237e] mb-6">About Trade Encore</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Trade Encore is a SEBI Registered Research Analyst providing professional stock market 
              research and investment advisory services. Our mission is to empower investors with 
              accurate, timely, and actionable research to help them make informed investment decisions.
            </p>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[#1a237e] mb-4">Why Choose Trade Encore?</h2>
                <ul className="space-y-3 text-gray-600">
                  <li>• SEBI Registered Research Analyst (INH000009269)</li>
                  <li>• Expert team with years of market experience</li>
                  <li>• Comprehensive research across multiple market segments</li>
                  <li>• Timely and actionable recommendations</li>
                  <li>• Professional and transparent approach</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1a237e]">Contact Info</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-[#1a237e]" />
                  <p className="text-sm text-gray-600">
                    C/O Aster Coworking, 301,<br />
                    Trimurti Honey Gold, Ashok Nagar,<br />
                    Range Hill Rd, above Axis Bank,<br />
                    Shivajinagar, Pune, Maharashtra 411007
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 flex-shrink-0 text-[#1a237e]" />
                  <a href="mailto:info@tradeencore.com" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    info@tradeencore.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-[#1a237e]" />
                  <a href="tel:+911234567890" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    +91 12345 67890
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1a237e]">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-[#1a237e]">
                    Client Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1a237e]">Services</h2>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">Daily Market Outlook</li>
                <li className="text-sm text-gray-600">Long Term Recommendations</li>
                <li className="text-sm text-gray-600">Positional Trading</li>
                <li className="text-sm text-gray-600">Derivative Strategies</li>
                <li className="text-sm text-gray-600">Mutual Fund Advisory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
