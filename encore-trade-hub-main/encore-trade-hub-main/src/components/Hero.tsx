
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fadeIn, staggerChildren, buttonHover } from '@/utils/animations';
import { Shield, TrendingUp, Users } from 'lucide-react';

const MotionButton = motion(Button);

const Hero = () => {
  const navigate = useNavigate();

  return (
    <motion.section 
      className="relative min-h-screen flex items-center bg-[var(--tv-background)] overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0))]" />
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Trade Encore Logo */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <img 
              src="/trade-encore-logo.gif" 
              alt="Trade Encore Logo" 
              className="h-32 w-auto mx-auto bg-white rounded-lg p-3"
            />
          </motion.div>

          {/* SEBI Registration Badge */}
          <motion.div 
            className="inline-flex items-center bg-[var(--tv-background-secondary)] rounded-full px-4 py-2 mb-8 border border-[var(--tv-border-color)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Shield className="w-4 h-4 text-[var(--tv-blue-500)] mr-2" />
            <span className="text-[var(--tv-text-primary)] text-sm font-medium">
              SEBI Registered Research Analyst - INH000009269
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <span className="text-white">Professional Stock Market</span>
            <span className="text-green-400/80 block">Research & Analysis</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            className="text-xl md:text-2xl text-[var(--tv-text-secondary)] mb-8 max-w-3xl mx-auto font-normal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Get expert insights, comprehensive research reports, and strategic investment recommendations 
            from SEBI registered professionals.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <motion.div 
              className="flex items-center text-white text-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="w-6 h-6 text-white mr-3" />
              <span>Daily Market Outlook</span>
            </motion.div>
            <motion.div 
              className="flex items-center text-white text-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-6 h-6 text-white mr-3" />
              <span>Expert Analysis</span>
            </motion.div>
            <motion.div 
              className="flex items-center text-[var(--tv-text-secondary)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-5 h-5 text-[var(--tv-blue-500)] mr-2" />
              <span>SEBI Compliant</span>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            <MotionButton
              onClick={() => navigate('/pricing')}
              className="flex-1 w-full sm:w-auto bg-[#0A2647] text-white hover:bg-[#144272] px-8 py-4 rounded-lg font-medium text-xl tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out border border-[#2C74B3]"
              whileHover={buttonHover}
            >
              Become a Member
            </MotionButton>
            <MotionButton
              onClick={() => navigate('/blog')}
              className="flex-1 w-full sm:w-auto bg-transparent text-white hover:bg-[#144272] border border-[#2C74B3] px-8 py-4 rounded-lg font-medium text-xl tracking-wide shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
              whileHover={buttonHover}
            >
              Daily Market Analysis
            </MotionButton>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.2 }}
          >
            <p className="text-[#e0e0e0] mb-4">Trusted by investors across India</p>
            <div className="text-[#e0e0e0] text-sm">
              <a 
                href="https://maps.app.goo.gl/UiitouMd1FjtJ7d7A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#2962ff] transition-colors"
              >
                <p>Registered Office: C/O Aster Coworking, 301, Trimurti Honey Gold, Ashok Nagar,</p>
                <p>Range Hill Rd, above Axis Bank, Shivajinagar, Pune, Maharashtra 411007</p>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
