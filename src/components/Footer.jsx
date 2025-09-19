// components/Footer.jsx
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowUp, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    // Simulate API call
    try {
      // In a real application, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribed(true);
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinks = {
    product: [
      { name: 'Features', to: '/features' },
      { name: 'Solutions', to: '/solutions' },
      { name: 'Pricing', to: '/pricing' },
      { name: 'Demo', to: '/demo' },
    ],
    company: [
      { name: 'About Us', to: '/about' },
      { name: 'Careers', to: '/careers' },
      { name: 'Blog', to: '/blog' },
      { name: 'Press', to: '/press' },
    ],
    support: [
      { name: 'Documentation', to: '/docs' },
      { name: 'Help Center', to: '/help' },
      { name: 'Contact Us', to: '/contact' },
      { name: 'Status', to: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', to: '/privacy' },
      { name: 'Terms of Service', to: '/terms' },
      { name: 'Cookie Policy', to: '/cookies' },
      { name: 'Security', to: '/security' },
    ],
  };

  const socialLinks = [
    { icon: <FiGithub />, href: 'https://github.com', label: 'GitHub' },
    { icon: <FiTwitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FiLinkedin />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FiMail />, href: 'mailto:info@quantumfinance.ai', label: 'Email' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-b from-gray-900 to-black text-white border-t border-gray-800"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="text-2xl">⚡</div>
              <div className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Quantum Finance AI
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Advanced AI-powered financial solutions for enterprises. 
              Leveraging quantum computing principles to deliver unprecedented insights.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gradient-to-r from-purple-500 to-cyan-400 transition-colors duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {/* Newsletter subscription - simplified */}
        <div className="lg:col-span-2 mt-6 lg:mt-0">
            <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wider mb-3">Stay Updated</h3>
            
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-green-900/30 text-green-400 rounded text-center text-sm"
              >
                Thank you for subscribing!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-l focus:ring-1 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-500 text-sm transition-all duration-300"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 bg-gradient-to-r from-purple-900 to-purple-800 text-white rounded-r hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <FiSend className="text-sm" />
                    )}
                  </motion.button>
                </div>
              </form>
            )}
            
            <p className="text-gray-500 text-xs mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Quantum Finance AI. All rights reserved.
          </p>
          
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
            aria-label="Scroll to top"
          >
            Back to top
            <FiArrowUp className="ml-2" />
          </motion.button>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;