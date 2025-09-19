import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { 
  FiBarChart2, FiPieChart, FiTrendingUp, FiBell, 
  FiArrowRight, FiBriefcase, FiStar, FiMaximize2, 
  FiX, FiCheck 
} from 'react-icons/fi';
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import { TypeAnimation } from 'react-type-animation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import necessary Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Import your assets - assuming these exist in your project
import BackgroundVideo from "../assets/Backgroundvideo.mp4";
import OptimizeFinancial from "../assets/optimize-financial.jpg";
import EnhanceOperations from "../assets/enhance-operations.jpg";
import RevolutionizeCustomer from "../assets/revolutionize-customer.jpg";
import PredictiveMaintenance from "../assets/predictive-maintenance.jpg";
import AccelerateInnovation from "../assets/accelerate-innovation.jpg";
import StrengthenCybersecurity from "../assets/strengthen-cybersecurity.jpg";

// New imports for client interface screenshots
import AiPoweredSalesPrediction from "../assets/ai-powered-sales-prediction.jpg";
import BusinessCommandCenter from "../assets/business-command-center.jpg";
import QuantumFinanceDashboard from "../assets/quantum-finance-dashboard.jpg";
import MarketInsightsDashboard from "../assets/market-insights-dashboard.jpg";
import FinanceSageDashboard from "../assets/finance-sage-dashboard.jpg";
import InventoryShipmentDashboard from "../assets/inventory-shipment-dashboard.jpg";
import Finance from "../assets/financeai.jpg";


// Icons (you'll need to install react-icons: npm install react-icons)
import { FaRocket, FaChartLine, FaShieldAlt, FaRobot, FaUserTie, FaRegLightbulb } from "react-icons/fa";
import { RiRobotLine } from "react-icons/ri"; // Example alternative
import { MdOutlineAutoGraph, MdSecurity, MdAnalytics } from "react-icons/md";
import { IoSpeedometer } from "react-icons/io5";


const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const sections = useRef([]);
  const [featureModal, setFeatureModal] = useState({ isOpen: false, feature: null });
  const carouselRef = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-100, 100], [15, -15]);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", goals: "" });
  const [isVideoVisible, setIsVideoVisible] = useState(false); // State to control video animation
  const [selectedInterface, setSelectedInterface] = useState(null);
  
  // Function to handle viewing details
  const handleViewDetails = (item) => {
    setSelectedInterface(item);
  };
 

  // Features data with icons
  const features = [
    { 
      icon: <MdOutlineAutoGraph className="text-5xl text-blue-400 group-hover:text-white transition-colors duration-300" />,
      title: "Vendor Performance Scorecard", 
      desc: "AI-driven vendor analysis for cost optimization and quality control. Identify the best suppliers based on historical data and performance benchmarks." 
    },
    { 
      icon: <FaRocket className="text-5xl text-purple-500 group-hover:text-white transition-colors duration-300" />,
      title: "AI Business Growth Assistant", 
      desc: "Strategic AI insights to drive business expansion. Gain real-time recommendations on market opportunities and revenue optimization." 
    },
    { 
      icon: <FaChartLine className="text-5xl text-cyan-400 group-hover:text-white transition-colors duration-300" />,
      title: "AI-Powered Business Intelligence", 
      desc: "Transform raw data into actionable insights with AI-powered dashboards. Detect patterns for better forecasting." 
    },
    { 
      icon: <IoSpeedometer className="text-5xl text-green-400 group-hover:text-white transition-colors duration-300" />,
      title: "Predictive Maintenance", 
      desc: "Reduce downtime and optimize performance with AI-driven insights. Monitor equipment health to detect potential failures before they occur." 
    },
    { 
      icon: <MdAnalytics className="text-5xl text-pink-400 group-hover:text-white transition-colors duration-300" />,
      title: "Market & Competitor Analysis", 
      desc: "Stay ahead with real-time market data and competitor tracking. Make data-backed decisions to gain a competitive edge." 
    },
    { 
      icon: <RiRobotLine className="text-5xl text-amber-400 group-hover:text-white transition-colors duration-300" />,
      title: "AI-Driven Inventory Management", 
      desc: "Predict demand and maintain optimal stock levels efficiently. Prevent overstocking or stockouts with AI-powered forecasting." 
    },
  ];

  const workflowSteps = [
    { title: "Step 1: Data Collection", description: "Gather and preprocess data for AI models." },
    { title: "Step 2: AI Training", description: "Train AI models with high-performance algorithms." },
    { title: "Step 3: Deployment", description: "Deploy AI solutions for real-world applications." },
    { title: "Step 4: Continuous Learning", description: "Monitor and improve AI performance over time." }
  ];


  // Advantages data
  const advantages = [
    {
      title: "Cutting-Edge AI Technology",
      desc: "Leverage the latest advancements in artificial intelligence for unparalleled business insights and growth.",
      gradient: "from-blue-600 via-indigo-600 to-purple-700",
      icon: <FaRobot className="text-6xl mb-6" />
    },
    {
      title: "Scalable Solutions",
      desc: "Our enterprise solutions evolve and grow with your business, ensuring long-term success and adaptability.",
      gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      icon: <FaChartLine className="text-6xl mb-6" />
    },
    {
      title: "Expert Support",
      desc: "Our dedicated team of AI specialists guides you through implementation, training, and optimization.",
      gradient: "from-amber-500 via-orange-600 to-red-700",
      icon: <FaUserTie className="text-6xl mb-6" />
    },
    {
      title: "Data-Driven Decisions",
      desc: "Make precise strategic choices backed by real-time AI-powered analytics and predictive modeling.",
      gradient: "from-purple-600 via-violet-600 to-indigo-700",
      icon: <MdAnalytics className="text-6xl mb-6" />
    },
    {
      title: "Enterprise Security",
      desc: "Bank-grade security protocols protect your sensitive financial and business data at every level.",
      gradient: "from-red-600 via-pink-600 to-purple-700",
      icon: <MdSecurity className="text-6xl mb-6" />
    },
    {
      title: "Future-Proof Technology",
      desc: "Stay ahead with self-learning AI models that continuously improve through operational use.",
      gradient: "from-teal-600 via-green-600 to-emerald-700",
      icon: <FaRegLightbulb className="text-6xl mb-6" />
    },
  ];

  
  // Solutions data
  const solutions = [
    // {
    //   title: "Optimize Financial Decision-Making",
    //   description:
    //     "Our AI-powered financial tools analyze vast amounts of data in real-time, providing actionable insights to optimize budgeting, forecasting, and investment strategies. Make smarter financial decisions with confidence.",
    //   image: OptimizeFinancial,
    // },
    {
      title: "Enhance Operational Efficiency",
      description:
        "Streamline your business operations with AI-driven automation. From supply chain management to resource allocation, our solutions reduce inefficiencies and boost productivity across your organization.",
      image: EnhanceOperations,
    },
    {
      title: "Revolutionize Customer Experience",
      description:
        "Deliver personalized customer experiences with AI-powered chatbots, recommendation engines, and sentiment analysis. Understand your customers better and build lasting relationships through data-driven insights.",
      image: RevolutionizeCustomer,
    },
    {
      title: "Predictive Maintenance for Assets",
      description:
        "Minimize downtime and maximize asset lifespan with AI-powered predictive maintenance. Our systems analyze equipment performance to predict failures before they happen, saving time and costs.",
      image: PredictiveMaintenance,
    },
    // {
    //   title: "Accelerate Innovation with Generative AI",
    //   description:
    //     "Leverage generative AI to create new products, services, and solutions. From designing prototypes to generating creative content, our AI tools empower your team to innovate faster.",
    //   image: AccelerateInnovation,
    // },
    {
      title: "Strengthen Cybersecurity",
      description:
        "Protect your business from cyber threats with AI-driven security solutions. Our systems detect anomalies, predict vulnerabilities, and respond to threats in real-time, ensuring your data stays safe.",
      image: StrengthenCybersecurity,
    },
  ];

  // Handle scroll events for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      sections.current.forEach((section) => {
        if (!section) return;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.id;
        
        if (scrollY > sectionTop - window.innerHeight / 1.3 && 
            scrollY < sectionTop + sectionHeight) {
          setIsVisible(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Add sections to ref array
  useEffect(() => {
    sections.current = document.querySelectorAll('[data-section]');
  }, []);

  
  // Use this useEffect to trigger animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);
  
  // Trigger video animation after text appears
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoVisible(true); // Trigger video animation after 1.5 seconds
    }, 1000); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, []);

  // Custom Button component with hover effects
  const PrimaryButton = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`group relative px-8 py-4 bg-transparent overflow-hidden rounded-lg font-semibold text-lg inline-block ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 transform group-hover:scale-105"></span>
      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative text-white z-10">{children}</span>
    </Link>
  );

  return (
    <div className="bg-black text-white overflow-hidden">
      < Navbar />
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Animated background with particles overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black to-purple-900/10 z-10"></div>
        
        {/* Parallax Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-container">
            <div className="stars stars-small"></div>
            <div className="stars stars-medium"></div>
            <div className="stars stars-large"></div>
          </div>
        </div>
        
        {/* Video Background with zoom-in animation */}
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isVideoVisible ? { scale: 1, opacity: 0.5 } : {}}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <source src={BackgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-20 max-w-7xl mx-auto px-6"
          >
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Welcome to QuantumFinance AI <br></br>
            </h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-500"
            >
              Redefined Enterprise and Resource Management <br></br><br></br>
            </motion.h2> 
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1, ease: "easeOut" }}
              className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-gray-300 leading-relaxed"
            >
              Harness the power of artificial intelligence to transform your financial operations,
              automate critical decisions, and achieve unprecedented business growth.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 flex flex-col md:flex-row gap-6 justify-center"
          >
            <PrimaryButton to="/book-demo">
              <span className="flex items-center gap-2">
                <span>Book a Demo</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </PrimaryButton>
            
            <a 
              href="#features" 
              className="group px-8 py-4 border border-purple-500/50 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-purple-950/30 transition-all duration-300"
            >
              Explore Features
              <svg className="w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </motion.div>
          <br></br>  <br></br>  <br></br>  <br></br>  <br></br>
          {/* Animated scroll indicator */}
          <motion.div 
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </section>
      
      {/* What We Offer - Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,56,202,0.15),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible['stats'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            data-section="stats"
            id="stats"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: "98%", label: "Accuracy in Financial Predictions", icon: "📈" },
              { value: "47%", label: "Average Reduction in Manual Tasks", icon: "⚙️" },
              { value: "3.8x", label: "Average ROI Within First Year", icon: "💰" },
              { value: "24/7", label: "AI-Powered Monitoring & Support", icon: "🔄" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transform hover:-translate-y-2">
                <div className="text-5xl mb-2">{stat.icon}</div>
                <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{stat.value}</h3>
                <p className="mt-2 text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section with hover effects and animations */}
      <section 
        id="features" 
        data-section="features"
        className="py-24 px-6 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible['features'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                AI-Powered Enterprise Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our suite of cutting-edge AI tools transforms how businesses manage resources,
              make decisions, and plan for the future.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible['features'] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 hover:border-purple-500/50 group transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transform hover:-translate-y-2"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Carousel with 3D effect */}
      <section 
        id="advantages" 
        data-section="advantages"
        className="py-24 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyYTJhMmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible['advantages'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Why Choose QuantumFinance AI
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We deliver enterprise-grade artificial intelligence solutions that give your business
              a competitive advantage in today's data-driven market.
            </p>
          </motion.div>
          
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Autoplay, Pagination]}
            className="mySwiper"
          >
            {advantages.map((item, index) => (
              <SwiperSlide key={index} className="max-w-md my-10">
                <div className={`p-10 h-96 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-xl flex flex-col justify-center items-center text-center transform transition-transform duration-500 hover:scale-105`}>
                  {item.icon}
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/90">{item.desc}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      <section id="features" className="py-24 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.1),transparent_70%)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Powerful AI Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform combines advanced machine learning algorithms with financial expertise to deliver unparalleled insights and automation.
          </p>
        </motion.div>

        {/* Horizontal Scrolling Carousel */}
        <motion.div
          ref={carouselRef}
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -800, right: 0 }} // Adjust based on content width
          className="flex space-x-8 cursor-grab active:cursor-grabbing"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              style={{ rotateY }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              className="flex-shrink-0 w-80 h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 relative overflow-hidden group"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Feature Icon */}
              <div className="text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {feature.icon}
              </div>

              {/* Feature Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 mb-6">{feature.desc}</p>

              {/* Learn More Button */}
              <button
                onClick={() => setFeatureModal({ isOpen: true, feature })}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity duration-300"
              >
                Learn More
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Feature Modal */}
      <AnimatePresence>
        {featureModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setFeatureModal({ isOpen: false, feature: null })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFeatureModal({ isOpen: false, feature: null })}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center mb-6">
                <div className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mr-4">
                  {featureModal.feature?.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{featureModal.feature?.title}</h3>
              </div>

              <p className="text-gray-300 mb-6">{featureModal.feature?.desc}</p>

              <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Key Benefits:</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Enhanced decision-making with AI-driven insights</li>
                  <li>Significant reduction in operational costs</li>
                  <li>Improved accuracy and efficiency</li>
                  <li>Customizable solutions for your specific needs</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity duration-300">
                  Request Demo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>


{/* NEW SECTION 1: Solutions Showcase with Interactive Cards */}
<section 
  id="solutions" 
  data-section="solutions"
  className="py-24 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden"
>
  {/* Background Elements */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse" 
         style={{ animationDuration: '15s' }}></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse" 
         style={{ animationDuration: '20s' }}></div>
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['solutions'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Transformative AI Solutions
        </span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Explore how our AI solutions can revolutionize key aspects of your business operations
        and drive sustainable growth.
      </p>
    </motion.div>
    
    {/* Grid Layout with Unique Hover Effects */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">
      {solutions.map((solution, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible['solutions'] ? { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, delay: index * 0.1 }
          } : {}}
          className="relative group h-96 overflow-hidden rounded-xl shadow-2xl transform transition-transform duration-300 hover:scale-[1.02]"
          whileHover={{ scale: 1.02 }} // Slight zoom on hover
        >
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 transition-all duration-500 group-hover:scale-110">
            <img 
              src={solution.image} 
              alt={solution.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Description Box with Unique Animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              delay: index % 2 === 0 ? 0 : 0 // Alternate delay for each card
            }}
            className="absolute inset-0 flex flex-col justify-end p-6 text-center opacity-0 group-hover:opacity-100 z-10" // Added z-10
          >
            <h3 className="text-2xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {solution.title}
            </h3>
            <p className="text-gray-300 mb-4">{solution.description}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-transparent border border-purple-500 rounded-full text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-300 text-sm flex items-center gap-2"
            >
              Explore Solution
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Unique Overlay Effects for Each Card */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-0" // Added z-0
            style={{
              background: index % 2 === 0 
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)' 
                : 'linear-gradient(45deg, rgba(168, 85, 247, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)'
            }}
          ></motion.div>
        </motion.div>
      ))}
    </div>
  </div>
</section>
{/* NEW SECTION: AI-Powered Workflow Automation */}
<section 
  id="workflow-automation" 
  data-section="workflow-automation"
  className="py-24 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden"
>
  {/* Dynamic Background Elements */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse" 
         style={{ animationDuration: '15s' }}></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse" 
         style={{ animationDuration: '20s' }}></div>
    <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full filter blur-3xl animate-pulse" 
         style={{ animationDuration: '25s' }}></div>
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['workflow-automation'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Intelligent Workflow Automation
        </span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Our AI-driven ERP platform automates complex business processes, reduces manual work, 
        and delivers actionable insights across your entire organization.
      </p>
    </motion.div>
    
    {/* Process Automation Showcase */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isVisible['workflow-automation'] ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/30">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
                <FiTrendingUp className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Process Visualization</h3>
              <p className="text-gray-400">See how AI optimizes your business workflows in real-time</p>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-28 h-28 bg-purple-500/10 rounded-full filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full filter blur-xl animate-pulse"></div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={isVisible['workflow-automation'] ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-6"
      >
        {[
          {
            icon: <FiBarChart2 className="h-8 w-8 text-blue-400" />,
            title: "Data Integration",
            description: "Seamlessly connect all your business data sources into a unified AI-powered platform."
          },
          {
            icon: <FiPieChart className="h-8 w-8 text-purple-400" />,
            title: "Process Automation",
            description: "Automate repetitive tasks and workflows to increase efficiency and reduce errors."
          },
          {
            icon: <FiTrendingUp className="h-8 w-8 text-cyan-400" />,
            title: "Predictive Analytics",
            description: "Leverage AI to forecast trends, demand, and potential operational bottlenecks."
          },
          {
            icon: <FiBriefcase className="h-8 w-8 text-green-400" />,
            title: "Resource Optimization",
            description: "Dynamically allocate resources based on real-time needs and predictive insights."
          }
        ].map((item, index) => (
          <div key={index} className="flex items-start p-4 rounded-xl bg-gray-900/50 border border-gray-800/30 hover:border-blue-500/30 transition-colors duration-300">
            <div className="flex-shrink-0 mr-4 mt-1">
              {item.icon}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
              <p className="text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
    
    {/* Efficiency Metrics */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['workflow-automation'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-800/30"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { value: "68%", label: "Faster Process Completion" },
          { value: "45%", label: "Reduction in Manual Errors" },
          { value: "52%", label: "Cost Reduction in Operations" },
          { value: "3.5x", label: "Return on Investment" }
        ].map((stat, index) => (
          <div key={index} className="p-4">
            <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {stat.value}
            </div>
            <div className="text-gray-300 mt-2 text-sm md:text-base">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
    
    {/* CTA Banner */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['workflow-automation'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mt-16 text-center"
    >
      <h3 className="text-2xl font-bold text-white mb-4">Ready to automate your business processes?</h3>
      <p className="text-gray-300 mb-8">Discover how our AI ERP platform can transform your operations.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <PrimaryButton to="/book-demo" className="inline-flex items-center">
          <span>Request Demo</span>
          <FiArrowRight className="ml-2" />
        </PrimaryButton>
        <a 
          href="#features" 
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center"
        >
          <span>Explore Features</span>
        </a>
      </div>
    </motion.div>
  </div>
</section>

{/* NEW SECTION 2: Testimonials with Animated Cards */}
<section 
  id="testimonials" 
  data-section="testimonials"
  className="py-24 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden"
>
  {/* Animated geometric shapes background */}
  <div className="absolute inset-0 opacity-20 overflow-hidden">
    <svg className="absolute top-0 left-0 w-full opacity-50" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>
      <path d="M0,0 L100,0 L50,100 Z" fill="url(#gradient1)" opacity="0.2" transform="translate(400, 50) rotate(45)">
        <animateTransform attributeName="transform" type="rotate" from="45 400 50" to="405 400 50" dur="45s" repeatCount="indefinite" />
      </path>
      <path d="M0,0 L80,0 L40,80 Z" fill="url(#gradient1)" opacity="0.2" transform="translate(100, 300) rotate(120)">
        <animateTransform attributeName="transform" type="rotate" from="120 100 300" to="480 100 300" dur="60s" repeatCount="indefinite" />
      </path>
      <circle cx="350" cy="250" r="30" fill="url(#gradient1)" opacity="0.1">
        <animate attributeName="r" from="30" to="50" dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
  
  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['testimonials'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          What Our Clients Say
        </span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Discover how QuantumFinance AI has transformed operations and driven growth
        for enterprise clients across industries.
      </p>
    </motion.div>
    
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      breakpoints={{
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      modules={[Pagination, Autoplay]}
      className="testimonial-swiper"
    >
      {[
        {
          name: "Sarah Johnson",
          title: "CFO, Nexus Global",
          quote: "QuantumFinance AI has revolutionized our financial forecasting accuracy by 47%. The predictive analytics have given us a competitive edge in market volatility.",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
          rating: 5,
          gradient: "from-blue-600 to-indigo-700"
        },
        {
          name: "Michael Chen",
          title: "CTO, Horizon Tech",
          quote: "The AI-driven inventory management system has reduced our carrying costs by 23% while improving fulfillment rates. The ROI has been exceptional.",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
          rating: 5,
          gradient: "from-purple-600 to-pink-700"
        },
        {
          name: "Elena Rodriguez",
          title: "COO, Vertex Industries",
          quote: "Implementing QuantumFinance AI's predictive maintenance solution has decreased downtime by 62% across our manufacturing facilities. A true game-changer.",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
          rating: 5,
          gradient: "from-emerald-600 to-teal-700"
        },
        {
          name: "Thomas Wright",
          title: "CEO, Meridian Group",
          quote: "The market analysis capabilities have helped us identify and capitalize on opportunities our competitors missed. Our growth has accelerated significantly.",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
          rating: 5,
          gradient: "from-amber-600 to-orange-700"
        },
      ].map((testimonial, index) => (
        <SwiperSlide key={index}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible['testimonials'] ? { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6, 
                delay: 0.1 * index
              }
            } : {}}
            className="h-full"
          >
            <div className={`bg-gradient-to-br ${testimonial.gradient} p-0.5 rounded-2xl h-full`}>
              <div className="bg-gray-900 rounded-2xl p-8 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-white/20">
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{testimonial.name}</h3>
                    <p className="text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-300 italic mb-6 flex-grow">" {testimonial.quote} "</p>
                
                <div className="mt-auto">
                  <a href="#" className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:underline">
                    Read Full Case Study
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
    
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible['testimonials'] ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="mt-16 text-center"
    >
      <PrimaryButton to="/case-studies" className="inline-flex items-center gap-2">
        View All Case Studies
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </PrimaryButton>
    </motion.div>
  </div>
</section>


{/* Improved CTA Section - Call to Action with Interactive Elements */}
<section 
  id="cta" 
  data-section="cta"
  className="py-20 bg-gradient-to-br from-gray-950 via-indigo-950/20 to-black relative overflow-hidden"
>
  {/* Animated background elements */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div className="absolute top-10 right-10 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse"></div>
    <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
  </div>
  
  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-md rounded-3xl border border-indigo-500/30 p-10 md:p-16 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
      <div className="flex flex-col md:flex-row items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={isVisible['cta'] ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="md:w-3/5 mb-10 md:mb-0 md:pr-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
              Transform Your Business
            </span>
            <span className="block text-white mt-2">
              With AI-Powered Decision Making
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8">
            Join over 500 enterprises that have revolutionized their financial operations and achieved unprecedented growth with QuantumFinance AI.
          </p>
          
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className={`w-10 h-10 rounded-full border-2 border-indigo-900 bg-gradient-to-br from-blue-${num*100} to-purple-${num*100} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{num}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400">
              <span className="text-indigo-400 font-bold">98%</span> of clients report ROI within 6 months
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible['cta'] ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-2/5"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Get Started Today
            </h3>
            
            <form className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Business Email" 
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <select className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white appearance-none">
                  <option value="" disabled selected>Company Size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
              
              <button 
                type="button"
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Schedule a Demo
              </button>
            </form>
            
            <p className="text-gray-400 text-sm text-center mt-6">
              No credit card required. Get started in minutes.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Trust indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible['cta'] ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 pt-8 border-t border-gray-800"
      >
        <p className="text-gray-400 text-center mb-6">Trusted by industry leaders worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          {/* Replace with actual company logos */}
          {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
            <div key={index} className="text-gray-300 font-bold text-xl">
              {company}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
</section>



{/* End of page spacer - This helps with visual balance before the footer */}
<div className="h-20 bg-black relative overflow-hidden">
<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent)]"></div>
</div>
<Footer />

{/* Floating Back to Top Button */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 p-4 rounded-full shadow-lg transition-all duration-300"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"></path>
  </svg>
</motion.button>

</div>
  );
};

export default HomePage;

