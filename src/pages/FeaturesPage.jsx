import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiZap, FiCpu, FiCloud, FiShield, FiBarChart2, 
  FiPieChart, FiUsers, FiGlobe, FiLayers, FiCode,
  FiChevronDown, FiChevronUp, FiPlay, FiPause,
  FiCheck, FiX, FiArrowRight, FiSearch, FiFilter,
  FiGrid, FiList, FiEye, FiLock, FiServer,
  FiExternalLink, FiClock, FiActivity, FiTrendingUp
} from "react-icons/fi";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FeaturesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const videoRef = useRef(null);

  const categories = [
    { id: "all", label: "All Features", icon: <FiGrid className="mr-2" /> },
    { id: "ai", label: "AI Capabilities", icon: <FiCpu className="mr-2" /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 className="mr-2" /> },
    { id: "security", label: "Security", icon: <FiShield className="mr-2" /> },
    { id: "integration", label: "Integrations", icon: <FiLayers className="mr-2" /> },
    { id: "automation", label: "Automation", icon: <FiZap className="mr-2" /> }
  ];

  const featuresData = [
    {
      id: 1,
      title: "Predictive Intelligence Engine",
      description: "Our proprietary AI algorithm analyzes historical data and real-time inputs to predict outcomes with 95%+ accuracy.",
      category: "ai",
      icon: <FiCpu className="text-3xl" />,
      color: "purple",
      status: "active",
      capabilities: [
        "Real-time pattern recognition",
        "Anomaly detection",
        "Self-learning algorithms",
        "Multi-variable analysis"
      ],
      metrics: {
        accuracy: "95%",
        speed: "2.7x faster",
        efficiency: "40% improvement"
      },
      videoDemo: "/demos/predictive-engine.mp4",
      longDescription: "Our Predictive Intelligence Engine leverages advanced machine learning techniques to analyze patterns in your data. It continuously learns from new information, improving its accuracy over time without manual intervention. The system can process terabytes of data in real-time, identifying trends and anomalies that would be impossible for humans to detect."
    },
    {
      id: 2,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive visualization tools that transform complex data into actionable insights with customizable reporting.",
      category: "analytics",
      icon: <FiBarChart2 className="text-3xl" />,
      color: "blue",
      status: "active",
      capabilities: [
        "Custom report building",
        "Real-time data streaming",
        "Export to multiple formats",
        "Collaborative analysis"
      ],
      metrics: {
        insights: "3.5x more",
        timeSaved: "15 hours/week",
        adoption: "82% rate"
      },
      longDescription: "The Advanced Analytics Dashboard provides a comprehensive view of your business performance through interactive visualizations. Drag-and-drop interface makes it easy to create custom reports without technical expertise. Share insights across your organization with role-based access controls and collaborative features."
    },
    {
      id: 3,
      title: "Zero-Trust Security Framework",
      description: "Enterprise-grade security with continuous verification and granular access controls to protect your most sensitive data.",
      category: "security",
      icon: <FiShield className="text-3xl" />,
      color: "green",
      status: "active",
      capabilities: [
        "End-to-end encryption",
        "Behavioral biometrics",
        "Real-time threat detection",
        "Compliance automation"
      ],
      metrics: {
        threatsBlocked: "99.97%",
        compliance: "100% maintained",
        incidents: "0 in 2023"
      },
      longDescription: "Our Zero-Trust Security Framework assumes no user or device is trustworthy until verified. Multi-factor authentication, continuous monitoring, and least-privilege access principles ensure your data remains protected. Automated compliance checks help you meet regulatory requirements without manual effort."
    },
    {
      id: 4,
      title: "Universal Integration Hub",
      description: "Connect with hundreds of tools and platforms through our flexible API-first architecture with no-code options.",
      category: "integration",
      icon: <FiLayers className="text-3xl" />,
      color: "amber",
      status: "active",
      capabilities: [
        "Pre-built connectors",
        "Custom API development",
        "Bi-directional sync",
        "Webhook support"
      ],
      metrics: {
        integrations: "250+",
        setupTime: "Under 15 minutes",
        reliability: "99.99% uptime"
      },
      longDescription: "The Universal Integration Hub eliminates data silos by connecting all your business applications. Choose from hundreds of pre-built connectors or create custom integrations with our visual workflow editor. Real-time data synchronization ensures information flows seamlessly between systems."
    },
    {
      id: 5,
      title: "Smart Automation Workflows",
      description: "Create complex business process automations with our intuitive visual workflow builder that anyone can use.",
      category: "automation",
      icon: <FiZap className="text-3xl" />,
      color: "red",
      status: "active",
      capabilities: [
        "Drag-and-drop interface",
        "Conditional logic",
        "Multi-step approvals",
        "Error handling"
      ],
      metrics: {
        processes: "Automate 90%",
        timeReduction: "Up to 80%",
        errors: "Eliminate 95%"
      },
      longDescription: "Smart Automation Workflows empower your team to automate repetitive tasks without coding knowledge. The visual editor makes it easy to design complex processes with conditional logic, approval steps, and error handling. Monitor performance through detailed analytics and optimize your workflows over time."
    },
    {
      id: 6,
      title: "Global Deployment Network",
      description: "Deploy anywhere with our globally distributed architecture that ensures low latency and high availability.",
      category: "infrastructure",
      icon: <FiGlobe className="text-3xl" />,
      color: "indigo",
      status: "active",
      capabilities: [
        "Multi-region deployment",
        "Auto-scaling",
        "Disaster recovery",
        "Edge computing"
      ],
      metrics: {
        regions: "15 worldwide",
        latency: "<50ms globally",
        availability: "99.999% SLA"
      },
      longDescription: "Our Global Deployment Network spans 15 regions worldwide, bringing your applications closer to users for optimal performance. Automatic scaling handles traffic spikes without manual intervention, while built-in redundancy ensures business continuity even during infrastructure failures."
    },
    {
      id: 7,
      title: "Collaboration Environment",
      description: "Work together seamlessly with built-in tools for commenting, task assignment, and real-time co-editing.",
      category: "collaboration",
      icon: <FiUsers className="text-3xl" />,
      color: "cyan",
      status: "active",
      capabilities: [
        "Real-time co-editing",
        "@mentions & notifications",
        "Version history",
        "Approval workflows"
      ],
      metrics: {
        collaboration: "63% faster",
        feedback: "40% quicker",
        engagement: "2.8x higher"
      },
      longDescription: "The Collaboration Environment breaks down organizational silos with tools designed for teamwork. Co-edit documents in real-time, assign tasks with deadlines, and maintain a complete version history. Integrated communication features keep conversations contextual and actionable."
    },
    {
      id: 8,
      title: "Custom Development Toolkit",
      description: "Extend and customize our platform with comprehensive developer tools, SDKs, and extensive documentation.",
      category: "development",
      icon: <FiCode className="text-3xl" />,
      color: "violet",
      status: "active",
      capabilities: [
        "REST & GraphQL APIs",
        "Client SDKs",
        "CLI tools",
        "Extensive documentation"
      ],
      metrics: {
        endpoints: "500+ API endpoints",
        libraries: "8 SDKs",
        documentation: "98% coverage"
      },
      longDescription: "Our Custom Development Toolkit provides everything developers need to extend platform functionality. Well-documented APIs, SDKs in popular programming languages, and CLI tools streamline the development process. Sample code and tutorials help your team get started quickly."
    }
  ];

  const getColorClasses = (color, type = "bg") => {
    const colors = {
      purple: type === "bg" ? "bg-purple-500" : type === "text" ? "text-purple-400" : "from-purple-600 to-purple-800",
      blue: type === "bg" ? "bg-blue-500" : type === "text" ? "text-blue-400" : "from-blue-600 to-blue-800",
      green: type === "bg" ? "bg-green-500" : type === "text" ? "text-green-400" : "from-green-600 to-green-800",
      amber: type === "bg" ? "bg-amber-500" : type === "text" ? "text-amber-400" : "from-amber-600 to-amber-800",
      red: type === "bg" ? "bg-red-500" : type === "text" ? "text-red-400" : "from-red-600 to-red-800",
      indigo: type === "bg" ? "bg-indigo-500" : type === "text" ? "text-indigo-400" : "from-indigo-600 to-indigo-800",
      cyan: type === "bg" ? "bg-cyan-500" : type === "text" ? "text-cyan-400" : "from-cyan-600 to-cyan-800",
      violet: type === "bg" ? "bg-violet-500" : type === "text" ? "text-violet-400" : "from-violet-600 to-violet-800"
    };
    return colors[color] || colors.purple;
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openFeatureModal = (feature) => {
    setSelectedFeature(feature);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeFeatureModal = () => {
    setSelectedFeature(null);
    setIsPlaying(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const filteredFeatures = featuresData.filter(feature => {
    const matchesCategory = activeCategory === "all" || feature.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Close modal when clicking outside content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedFeature && event.target.classList.contains('modal-overlay')) {
        closeFeatureModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedFeature]);

  return (
    <div className="min-h-screen bg-black text-white">
        <Navbar />
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100 * (i % 2 === 0 ? 1 : -1), 0],
              y: [0, 80 * (i % 3 === 0 ? 1 : -1), 0],
            }}
            transition={{
              duration: 20 + i * 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-40 h-40 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm mb-6"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                Powerful Capabilities
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="block">Features That</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400">
                  Empower Innovation
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-300 mb-10"
              >
                Discover the cutting-edge capabilities that make our platform the most powerful solution for modern businesses. Each feature is engineered for performance, scalability, and simplicity.
              </motion.p>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  className="w-full pl-12 pr-6 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </motion.div>

            {/* Hero Visual - Right Side */}
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-400">dashboard.example.com</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 mb-6">
                    <div className="col-span-4 h-4 bg-gray-800 rounded"></div>
                    <div className="col-span-3 h-4 bg-gray-800 rounded"></div>
                    <div className="col-span-5 h-4 bg-gray-800 rounded"></div>
                    
                    <div className="col-span-12 h-32 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-lg mt-4 flex items-center justify-center">
                      <FiActivity className="text-4xl text-cyan-400" />
                    </div>
                    
                    <div className="col-span-6 mt-4">
                      <div className="h-24 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-300">Performance</span>
                          <FiTrendingUp className="text-green-400" />
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full mb-1">
                          <div className="h-full bg-cyan-500 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-6 mt-4">
                      <div className="h-24 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-300">Usage</span>
                          <FiClock className="text-amber-400" />
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full mb-1">
                          <div className="h-full bg-purple-500 rounded-full w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: "50+", label: "Features" },
              { value: "99.9%", label: "Uptime" },
              { value: "500ms", label: "Response Time" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-900/30 rounded-xl border border-gray-800/50">
                <div className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="relative z-10 px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center text-sm ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-cyan-600 text-white" : "bg-gray-800/50 text-gray-400"
                }`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-cyan-600 text-white" : "bg-gray-800/50 text-gray-400"
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] transition-all duration-500 cursor-pointer"
                  onClick={() => openFeatureModal(feature)}
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(feature.color)} w-fit mb-4`}>
                      {feature.icon}
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Object.entries(feature.metrics).slice(0, 3).map(([key, value], i) => (
                        <div key={i} className="text-center p-2 bg-gray-800/30 rounded-lg">
                          <div className="text-sm font-bold text-cyan-400">{value}</div>
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Explore button */}
                    <div className="w-full py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center justify-center">
                      Explore Capabilities <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300 cursor-pointer"
                  onClick={() => openFeatureModal(feature)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(feature.color)}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                          <p className="text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2">
                          {Object.entries(feature.metrics).slice(0, 2).map(([key, value], i) => (
                            <div key={i} className="text-center p-2 bg-gray-800/30 rounded-lg">
                              <div className="text-sm font-bold text-cyan-400">{value}</div>
                              <div className="text-xs text-gray-500 capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                        
                        <FiArrowRight className="text-xl text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredFeatures.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No features found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={closeFeatureModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
              >
                <FiX className="text-xl" />
              </button>

              <div className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${getColorClasses(selectedFeature.color)}`}>
                    {selectedFeature.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedFeature.title}</h2>
                    <p className="text-gray-300 text-lg">{selectedFeature.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Key Capabilities</h3>
                    <ul className="space-y-3">
                      {selectedFeature.capabilities.map((capability, i) => (
                        <li key={i} className="flex items-start">
                          <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedFeature.metrics).map(([key, value], i) => (
                        <div key={i} className="bg-gray-800/30 rounded-lg p-4 text-center">
                          <div className={`text-xl font-bold ${getColorClasses(selectedFeature.color, "text")}`}>
                            {value}
                          </div>
                          <div className="text-sm text-gray-500 capitalize mt-1">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedFeature.longDescription && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Detailed Overview</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedFeature.longDescription}</p>
                  </div>
                )}

                {selectedFeature.videoDemo && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">See it in action</h3>
                    <div className="relative rounded-xl overflow-hidden bg-black">
                      <video 
                        ref={videoRef}
                        className="w-full"
                        poster="/placeholder.jpg"
                        onClick={toggleVideoPlayback}
                      >
                        <source src={selectedFeature.videoDemo} type="video/mp4" />
                      </video>
                      <button 
                        onClick={toggleVideoPlayback}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors"
                      >
                        {isPlaying ? (
                          <FiPause className="text-white text-3xl" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-cyan-600/80 flex items-center justify-center hover:bg-cyan-600 transition-colors">
                            <FiPlay className="text-white text-2xl ml-1" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                    Request Demo
                  </button>
                  <button className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                    Documentation <FiExternalLink className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capabilities Overview Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-black to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Features Work Together</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10"
            >
              Our platform's capabilities integrate seamlessly to create a powerful ecosystem that grows with your business
            </motion.p>

            {/* Visual Integration Diagram */}
            <motion.div 
              className="relative max-w-4xl mx-auto mb-16 hidden lg:block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-cyan-500/20 rounded-full animate-pulse"></div>
                <div className="w-80 h-80 border-2 border-purple-500/20 rounded-full absolute animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="w-96 h-96 border-2 border-blue-500/20 rounded-full absolute animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>
              
              <div className="relative z-10 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-cyan-600 to-cyan-800 rounded-xl w-fit">
                    <FiCpu className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Core</h3>
                  <p className="text-sm text-gray-400">Intelligent processing at the center</p>
                </div>
                
                <div className="text-center mt-12">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl w-fit">
                    <FiBarChart2 className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-gray-400">Data visualization & insights</p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl w-fit">
                    <FiShield className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Security</h3>
                  <p className="text-sm text-gray-400">Protection at all levels</p>
                </div>
                
                <div className="text-center col-span-3 mt-8">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-600 to-green-800 rounded-xl w-fit">
                    <FiZap className="text-2xl" />
                  </div>
                  <h3 className="font-semibold mb-2">Automation</h3>
                  <p className="text-sm text-gray-400">Connecting all components</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Unified Architecture",
                description: "All features built on a single, cohesive platform that ensures seamless data flow and consistent experience across all functionalities.",
                icon: <FiLayers className="text-3xl" />
              },
              {
                title: "Scalable Infrastructure",
                description: "Our distributed systems automatically scale to handle your growing data and user demands without compromising performance.",
                icon: <FiServer className="text-3xl" />
              },
              {
                title: "Enterprise-Grade Security",
                description: "End-to-end encryption, compliance certifications, and advanced access controls protect your data at every layer of the platform.",
                icon: <FiLock className="text-3xl" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300"
              >
                <div className="p-3 bg-cyan-500/10 rounded-xl w-fit mb-4 text-cyan-400">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FeaturesPage;