// src/pages/Login.jsx
import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLogIn, FiAlertCircle, FiArrowRight, FiShield, FiDatabase, FiTrendingUp } from 'react-icons/fi';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particleElements, setParticleElements] = useState([]);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Create floating particles for background
  useEffect(() => {
    const particles = [];
    const particleCount = theme === 'dark' ? 30 : 15;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
      });
    }
    
    setParticleElements(particles);
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { username, password };
      
      // Use the JWT token endpoint
      const response = await api.post('api/token/', payload);
      
      if (response.data.access && response.data.refresh) {
        // Store tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubscription = () => {
    navigate('/request-subscription');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--accent-purple)]/10 via-[var(--bg-primary)] to-[var(--accent-blue)]/10 overflow-hidden relative px-4">
     <Navbar />
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
              y: [0, -20, 0],
              x: [0, 5, 0],
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
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[var(--accent-purple)] opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[var(--accent-blue)] opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Left side - Branding and info */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-white"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Quantum Finance AI</h1>
            <p className="text-lg opacity-90">ERP Service Lite</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6 mb-10"
          >
            <div className="flex items-center">
            <div className="bg-gray-700 p-2 rounded-lg mr-4">
                <FiTrendingUp className="text-xl" />
              </div>
              <p>AI-powered financial insights</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <FiDatabase className="text-xl" />
              </div>
              <p>Enterprise-grade security</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                <FiShield className="text-xl" />
              </div>
              <p>Real-time analytics dashboard</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm opacity-80"
          >
            <p>© {new Date().getFullYear()} Quantum Finance AI. All rights reserved.</p>
          </motion.div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full md:w-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-8 md:p-12"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-[var(--accent-purple)] dark:text-[var(--accent-blue)]">
              Welcome Back
            </h2>
    
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">Sign in to your Quantum Finance AI account</p>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center"
            >
              <FiAlertCircle className="mr-2" /> {error}
            </motion.div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Enter your username"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Enter your password"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subdomain (Optional)</label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="company.quantumfinance.ai"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  <><FiLogIn className="mr-2" /> Login to Dashboard</>
                )}
              </button>
            </motion.div>
          </form>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">Don't have an account yet?</p>
            <button
              onClick={handleRequestSubscription}
              className="w-full py-3 border-2 border-[var(--accent-blue)] text-[var(--accent-blue)] dark:border-[var(--accent-blue)] dark:text-[var(--accent-blue)] font-semibold rounded-lg hover:bg-[var(--accent-blue)]/10 transition-all duration-300 flex items-center justify-center"
            >
              Request Subscription <FiArrowRight className="ml-2" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;