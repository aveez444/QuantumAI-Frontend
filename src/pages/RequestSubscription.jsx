// src/pages/RequestSubscription.jsx
import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiCheck, FiSend, FiUser, FiMail, FiPhone, 
   FiTrendingUp, FiShield, FiDatabase, FiZap,
  FiStar, FiUsers, FiCpu, FiGlobe
} from 'react-icons/fi';
import {  FaBuilding } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Footer from '../components/Footer';

const RequestSubscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [particleElements, setParticleElements] = useState([]);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$800',
      period: '/month',
      description: 'Perfect for small businesses starting their digital transformation',
      features: [
        'Core ERP modules',
        'Basic financial analytics',
        'Up to 10 users',
        'Email support',
        'Standard security',
        'Monthly reports'
      ],
      icon: FiTrendingUp,
      color: 'from-blue-500 to-purple-600',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$1,500',
      period: '/month',
      description: 'Advanced features for growing businesses with complex needs',
      features: [
        'All Basic features',
        'Advanced AI analytics',
        'Up to 50 users',
        'Priority support',
        'Enhanced security',
        'Real-time dashboards',
        'Custom integrations',
        'Weekly insights'
      ],
      icon: FiCpu,
      color: 'from-purple-500 to-pink-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Fully customizable solution for large organizations',
      features: [
        'All Professional features',
        'Unlimited users',
        'Dedicated account manager',
        'Advanced security & compliance',
        'Custom AI models',
        '24/7 premium support',
        'White-label options',
        'API access & webhooks'
      ],
      icon: FiGlobe,
      color: 'from-green-500 to-blue-600',
      popular: false
    }
  ];

  // Create floating particles for background
  useEffect(() => {
    const particles = [];
    const particleCount = theme === 'dark' ? 25 : 12;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 8
      });
    }
    
    setParticleElements(particles);
  }, [theme]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);
      
      const templateParams = {
        to_name: 'Quantum Finance AI Team',
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        company: formData.companyName,
        selected_plan: `${selectedPlanDetails.name} - ${selectedPlanDetails.price}${selectedPlanDetails.period}`,
        message: formData.message || 'No additional message provided',
        reply_to: formData.email,
      };

      // Replace with your EmailJS service ID, template ID, and public key
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        message: ''
      });
    } catch (err) {
      console.error('Email sending error:', err);
      setError('Failed to send request. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--accent-purple)]/10 via-[var(--bg-primary)] to-[var(--accent-blue)]/10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-12 rounded-2xl shadow-2xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck className="text-3xl text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Request Sent Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Thank you for your interest! Our team will review your request and get back to you within 24 hours.
          </p>
          <button
            onClick={handleBack}
            className="w-full py-3 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--accent-purple)]/10 via-[var(--bg-primary)] to-[var(--accent-blue)]/10 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particleElements.map(particle => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${theme === 'dark' ? 'bg-gray-400/20' : 'bg-[var(--accent-purple)]/20'}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <motion.div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--accent-purple)] opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--accent-blue)] opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 7
        }}
      />

      <div className="relative z-10 py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <button
            onClick={handleBack}
            className="flex items-center text-[var(--accent-purple)] dark:text-[var(--accent-blue)] hover:opacity-80 transition-opacity mb-6"
          >
            <FiArrowLeft className="mr-2" /> Back to Login
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your <span className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent">Perfect Plan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform your business with AI-powered financial insights. Select the plan that fits your needs and let's get started.
            </p>
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto mb-16"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-8 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedPlan === plan.id
                      ? 'bg-white dark:bg-gray-800 shadow-2xl ring-2 ring-purple-500'
                      : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 shadow-xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                        <FiStar className="mr-1" /> Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-300 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className={`w-5 h-5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                          <FiCheck className="text-white text-sm" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedPlan === plan.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <FiCheck className="text-white text-sm" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Get Started Today</h2>
              <p className="text-gray-600 dark:text-gray-300">Fill out this quick form and we'll get back to you within 24 hours</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <FiUser className="inline mr-2" />Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="John Doe"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <FiMail className="inline mr-2" />Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="john@company.com"
                  />
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <FiPhone className="inline mr-2" />Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <FaBuilding className="inline mr-2" />Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Your Company Inc."
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 resize-none"
                  placeholder="Tell us about your specific needs or ask any questions..."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Request...
                    </div>
                  ) : (
                    <>
                      <FiSend className="mr-2" /> 
                      Send Request for {plans.find(p => p.id === selectedPlan)?.name} Plan
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            >
              <p>By submitting this form, you agree to be contacted by our team regarding your subscription request.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default RequestSubscription;