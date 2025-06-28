import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[var(--tv-background-secondary)] border-t border-[var(--tv-border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/trade-encore-logo.gif" 
                alt="Trade Encore Logo" 
                className="h-10 w-auto bg-white rounded-lg p-1"
              />
              <span className="font-bold text-lg">Trade Encore</span>
            </div>
            <p className="text-white/90 text-sm">
              SEBI Registered Research Analyst providing professional stock market 
              research and investment advisory services.
            </p>
            <div className="text-sm">
              <p className="font-semibold">SEBI Reg. No: INH000009269</p>
              <a 
                href="https://tradeencore.com/certifications/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:underline inline-flex items-center mt-1"
              >
                View Certification <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Client Login
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-[var(--tv-text-secondary)] hover:text-[var(--tv-text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Daily Market Outlook</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Long Term Recommendations</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Positional Recommendations</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Derivative Recommendations</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Portfolio Management</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Mutual Fund Advisory</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Research Reports</li>
              <li className="text-sm text-[var(--tv-text-secondary)]/80">Market Education</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--tv-text-secondary)]/80">
                  <p>C/O Aster Coworking, 301,</p>
                  <p>Trimurti Honey Gold, Ashok Nagar,</p>
                  <p>Range Hill Rd, above Axis Bank,</p>
                  <p>Shivajinagar, Pune, Maharashtra 411007</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-sm text-[var(--tv-text-secondary)]/80">contactus@tradeencore.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-sm text-[var(--tv-text-secondary)]/80">+919699187139</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--tv-border-color)]/10 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="text-sm text-[var(--tv-text-secondary)]/90">
                © 2025 Trade Encore. All rights reserved.
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex space-x-4 text-sm text-[var(--tv-text-secondary)]/90">
                  <Link to="/disclaimer" className="hover:text-[var(--tv-text-primary)]">
                    Risk Disclaimer
                  </Link>
                  <Link to="/contact" className="hover:text-[var(--tv-text-primary)]">
                    Contact
                  </Link>
                  <Link to="/admin/login" className="hover:text-blue-600">
                    Admin
                  </Link>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-6 text-xs text-white/90 space-y-4">
              <p>
                Trade Encore is a SEBI Registered Research Analyst with registration number INH000009269. To check SEBI registration details & certification, click here. Trade Encore does NOT provide Demat handling services or Portfolio Management services of any kind. Any guidance/recommendation provided by us is to be executed at their own risk by clients only.
              </p>
              <p>
                Registration granted by SEBI, membership of a SEBI recognized supervisory body (if any) and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.
              </p>
              <p>
                Investment/Trading in the securities market is subject to market risk, past performance is not a guarantee of future performance. The risk of loss in trading and investment in Securities markets including Equities, Derivatives, commodities, and Currency can be substantial. These are leveraged products that carry a substantial risk of loss up to your invested capital and may not be suitable for everyone. You should therefore carefully consider whether such trading is suitable for you in light of your financial condition. Please ensure that you understand fully the risks involved and do invest money according to your risk-bearing capacity. Trade Encore does not guarantee any returns in any of its products or services. Investment in markets is subject to market risk. Hence, Trade Encore is not liable for any losses in any case.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
