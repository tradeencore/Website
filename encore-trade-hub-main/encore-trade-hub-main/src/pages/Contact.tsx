import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone, Youtube, Twitter, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/tradeencore/',
      color: 'bg-[#1877F2] hover:bg-[#1877F2]/90'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/tradeencore/',
      color: 'bg-[#E4405F] hover:bg-[#E4405F]/90'
    },

    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com/tradeencore',
      color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90'
    },

    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com/@tradeencore',
      color: 'bg-[#FF0000] hover:bg-[#FF0000]/90'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/company/tradeencore/',
      color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90'
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1a237e]">Contact Us</h1>
          <p className="mt-2 text-lg text-gray-600">Get in touch with our team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <Card className="p-6">
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#1a237e] mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Office Address</h3>
                  <p className="text-gray-600">
                    C/O Aster Coworking, 301,<br />
                    Trimurti Honey Gold, Ashok Nagar,<br />
                    Range Hill Rd, above Axis Bank,<br />
                    Shivajinagar, Pune, Maharashtra 411007
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#1a237e]" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:contactus@tradeencore.com" className="text-gray-600 hover:text-[#1a237e]">
                    contactus@tradeencore.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#1a237e]" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href="tel:+911234567890" className="text-gray-600 hover:text-[#1a237e]">
                    +919699187139
                  </a>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full text-white ${social.color} transition-colors`}
                      title={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Map */}
          <Card className="overflow-hidden h-screen w-full mt-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.7094788818345!2d73.83765439999999!3d18.5420262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf3a82d1ef7d%3A0xe76fc7ef3c61344b!2sTrade%20Encore%20-%20Your%20Financial%20Doctor!5e0!3m2!1sen!2sin!4v1749807950907!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
