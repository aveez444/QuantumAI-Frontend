import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowRight, FiCheck, FiBarChart2, FiPieChart, 
  FiTrendingUp, FiBriefcase, FiX, FiPlay, FiUsers,
  FiClock, FiShield, FiGlobe, FiLayers, FiCpu,
  FiChevronDown, FiChevronRight, FiExternalLink,
  FiDownload, FiStar, FiArrowLeft, FiFilter
} from "react-icons/fi";
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

const Solutions = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [expandedSolution, setExpandedSolution] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const [solutionView, setSolutionView] = useState("list");
  const [filterCategory, setFilterCategory] = useState("all");

  // Restructured solutions data with different organization
  const solutionsData = [
    {
      id: 1,
      category: "optimization",
      title: "Smart Inventory Management",
      subtitle: "AI-Powered Stock Optimization",
      description: "Revolutionary inventory system that predicts demand patterns and optimizes stock levels using advanced machine learning algorithms.",
      impact: "30% cost reduction",
      timeline: "2-4 weeks",
      complexity: "Medium",
      icon: <FiBarChart2 className="text-2xl" />,
      color: "blue",
      features: [
        "Demand forecasting with 98% accuracy",
        "Automated reorder points",
        "Waste reduction algorithms",
        "Real-time inventory tracking",
        "Integration with existing ERP systems"
      ],
      benefits: [
        { metric: "Cost Reduction", value: "30%", description: "Lower carrying costs" },
        { metric: "Stockout Prevention", value: "95%", description: "Reduced stockouts" },
        { metric: "Waste Reduction", value: "45%", description: "Less expired inventory" }
      ],
      process: [
        "Data integration and analysis",
        "Algorithm training and calibration",
        "System deployment and testing",
        "Staff training and optimization"
      ],
      caseStudy: {
        company: "ManufaCorp Ltd.",
        result: "Reduced inventory costs by $2.3M annually while improving service levels by 28%"
      }
    },
    {
      id: 2,
      category: "maintenance",
      title: "Predictive Maintenance Engine",
      subtitle: "IoT-Driven Equipment Intelligence",
      description: "Advanced predictive maintenance system that uses IoT sensors and machine learning to predict equipment failures before they occur.",
      impact: "45% downtime reduction",
      timeline: "3-6 weeks",
      complexity: "High",
      icon: <FiTrendingUp className="text-2xl" />,
      color: "purple",
      features: [
        "Real-time equipment monitoring",
        "Failure prediction algorithms",
        "Maintenance scheduling optimization",
        "Parts inventory integration",
        "Mobile maintenance alerts"
      ],
      benefits: [
        { metric: "Downtime Reduction", value: "45%", description: "Less unplanned stops" },
        { metric: "Maintenance Cost", value: "25%", description: "Lower maintenance spend" },
        { metric: "Equipment Life", value: "20%", description: "Extended asset life" }
      ],
      process: [
        "IoT sensor installation",
        "Data collection and baseline",
        "AI model training",
        "Integration and monitoring"
      ],
      caseStudy: {
        company: "Industrial Systems Inc.",
        result: "Prevented 15 critical failures saving $1.8M in emergency repairs"
      }
    },
    {
      id: 3,
      category: "supply-chain",
      title: "Supply Chain Intelligence",
      subtitle: "End-to-End Visibility Platform",
      description: "Comprehensive supply chain optimization platform providing real-time visibility and intelligent decision-making capabilities.",
      impact: "52% delivery improvement",
      timeline: "4-8 weeks",
      complexity: "High",
      icon: <FiBriefcase className="text-2xl" />,
      color: "amber",
      features: [
        "Multi-tier supplier visibility",
        "Risk assessment and mitigation",
        "Logistics optimization",
        "Compliance tracking",
        "Performance analytics"
      ],
      benefits: [
        { metric: "Delivery Performance", value: "52%", description: "On-time deliveries" },
        { metric: "Supply Risk", value: "40%", description: "Risk reduction" },
        { metric: "Cost Savings", value: "18%", description: "Logistics optimization" }
      ],
      process: [
        "Supply chain mapping",
        "Data integration setup",
        "Analytics platform deployment",
        "Supplier onboarding"
      ],
      caseStudy: {
        company: "Global Manufacturing Co.",
        result: "Improved supplier performance by 35% and reduced supply disruptions by 60%"
      }
    },
    {
      id: 4,
      category: "production",
      title: "Production Intelligence Suite",
      subtitle: "Smart Manufacturing Orchestration",
      description: "Integrated production planning and scheduling system that optimizes manufacturing operations using AI-driven insights.",
      impact: "28% throughput increase",
      timeline: "3-5 weeks",
      complexity: "Medium",
      icon: <FiPieChart className="text-2xl" />,
      color: "green",
      features: [
        "Capacity optimization",
        "Resource allocation",
        "Bottleneck identification",
        "Quality integration",
        "Real-time adjustments"
      ],
      benefits: [
        { metric: "Throughput", value: "28%", description: "Increased production" },
        { metric: "Efficiency", value: "35%", description: "Resource utilization" },
        { metric: "Lead Time", value: "40%", description: "Faster delivery" }
      ],
      process: [
        "Current state analysis",
        "Optimization model creation",
        "System integration",
        "Performance monitoring"
      ],
      caseStudy: {
        company: "Precision Parts Ltd.",
        result: "Increased production capacity by 28% without additional equipment investment"
      }
    },
    {
      id: 5,
      category: "quality",
      title: "Intelligent Quality Control",
      subtitle: "AI-Vision Quality Assurance",
      description: "Computer vision-powered quality control system that detects defects and ensures consistent product quality at superhuman accuracy.",
      impact: "65% defect reduction",
      timeline: "2-3 weeks",
      complexity: "Medium",
      icon: <FiCheck className="text-2xl" />,
      color: "red",
      features: [
        "Visual defect detection",
        "Automated classification",
        "Root cause analysis",
        "Quality reporting",
        "Continuous learning"
      ],
      benefits: [
        { metric: "Defect Reduction", value: "65%", description: "Fewer quality issues" },
        { metric: "Inspection Speed", value: "300%", description: "Faster quality checks" },
        { metric: "Consistency", value: "99.8%", description: "Reliable detection" }
      ],
      process: [
        "Camera system installation",
        "Model training with samples",
        "Integration with production",
        "Continuous optimization"
      ],
      caseStudy: {
        company: "Quality First Manufacturing",
        result: "Reduced customer returns by 68% and improved brand reputation significantly"
      }
    },
    {
      id: 6,
      category: "sustainability",
      title: "Energy Optimization Platform",
      subtitle: "Smart Energy Management",
      description: "AI-driven energy optimization system that analyzes consumption patterns and implements intelligent energy-saving strategies.",
      impact: "25% energy savings",
      timeline: "2-4 weeks",
      complexity: "Low",
      icon: <FiGlobe className="text-2xl" />,
      color: "indigo",
      features: [
        "Real-time energy monitoring",
        "Peak demand management",
        "Efficiency recommendations",
        "Carbon footprint tracking",
        "Automated controls"
      ],
      benefits: [
        { metric: "Energy Savings", value: "25%", description: "Reduced consumption" },
        { metric: "Cost Reduction", value: "20%", description: "Lower energy bills" },
        { metric: "Carbon Footprint", value: "30%", description: "Environmental impact" }
      ],
      process: [
        "Energy audit and monitoring",
        "Optimization algorithm setup",
        "Automated control integration",
        "Performance tracking"
      ],
      caseStudy: {
        company: "EcoManufacturing Corp.",
        result: "Achieved carbon neutral production while saving $500K annually on energy costs"
      }
    }
  ];

  const categories = [
    { id: "all", label: "All Solutions", icon: <FiLayers className="mr-2" /> },
    { id: "optimization", label: "Optimization", icon: <FiBarChart2 className="mr-2" /> },
    { id: "maintenance", label: "Maintenance", icon: <FiCpu className="mr-2" /> },
    { id: "supply-chain", label: "Supply Chain", icon: <FiBriefcase className="mr-2" /> },
    { id: "production", label: "Production", icon: <FiPieChart className="mr-2" /> },
    { id: "quality", label: "Quality", icon: <FiCheck className="mr-2" /> },
    { id: "sustainability", label: "Sustainability", icon: <FiGlobe className="mr-2" /> }
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "benefits", label: "Benefits" },
    { id: "process", label: "Implementation" },
    { id: "case-studies", label: "Case Studies" }
  ];

  // Handle scroll animations
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

  const filteredSolutions = filterCategory === "all" 
    ? solutionsData 
    : solutionsData.filter(solution => solution.category === filterCategory);

  const getColorClasses = (color, type = "gradient") => {
    const colors = {
      blue: type === "gradient" ? "from-blue-500 to-cyan-500" : type === "bg" ? "bg-blue-500" : "text-blue-400",
      purple: type === "gradient" ? "from-purple-500 to-pink-500" : type === "bg" ? "bg-purple-500" : "text-purple-400",
      amber: type === "gradient" ? "from-amber-500 to-orange-500" : type === "bg" ? "bg-amber-500" : "text-amber-400",
      green: type === "gradient" ? "from-green-500 to-teal-500" : type === "bg" ? "bg-green-500" : "text-green-400",
      red: type === "gradient" ? "from-red-500 to-rose-500" : type === "bg" ? "bg-red-500" : "text-red-400",
      indigo: type === "gradient" ? "from-indigo-500 to-blue-500" : type === "bg" ? "bg-indigo-500" : "text-indigo-400"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 50 * (i % 2 === 0 ? 1 : -1), 0],
              y: [0, 30 * (i % 3 === 0 ? 1 : -1), 0],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-32 h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Hero Section - Completely Different Layout */}
      <section className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/30 border border-gray-700/50 text-sm mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                AI-Powered Industrial Solutions
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Solutions That
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                  Drive Results
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Discover our comprehensive suite of AI-powered manufacturing solutions. Each designed to solve specific challenges and deliver measurable ROI.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-800">
                  <FiUsers className="text-blue-400 mr-2" />
                  <span className="text-sm">500+ Implementations</span>
                </div>
                <div className="flex items-center bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-800">
                  <FiStar className="text-amber-400 mr-2" />
                  <span className="text-sm">98% Success Rate</span>
                </div>
                <div className="flex items-center bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-800">
                  <FiShield className="text-green-400 mr-2" />
                  <span className="text-sm">Enterprise Grade</span>
                </div>
              </div>
            </motion.div>

            {/* Right side - Interactive Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Solution Impact Preview</h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {solutionsData.slice(0, 3).map((solution, index) => (
                    <motion.div
                      key={solution.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getColorClasses(solution.color)} mr-3`}>
                          {solution.icon}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{solution.title}</div>
                          <div className="text-xs text-gray-400">{solution.timeline}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${getColorClasses(solution.color, "text")}`}>
                        {solution.impact}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="relative z-10 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center bg-gray-900/50 rounded-2xl p-2 border border-gray-800 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Filter Bar */}
            <section className="relative z-10 px-6 mb-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center text-gray-400">
                    <FiFilter className="mr-2" />
                    <span className="font-medium">Filter by category:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setFilterCategory(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center text-sm ${
                          filterCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                        }`}
                      >
                        {category.icon} {category.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setSolutionView("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        solutionView === "list" ? "bg-blue-600 text-white" : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      <FiLayers />
                    </button>
                    <button
                      onClick={() => setSolutionView("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        solutionView === "grid" ? "bg-blue-600 text-white" : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      <FiPieChart />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Solutions Display */}
            <section className="relative z-10 px-6 pb-16">
              <div className="max-w-7xl mx-auto">
                {solutionView === "list" ? (
                  /* List View - Accordion Style */
                  <div className="space-y-4">
                    {filteredSolutions.map((solution, index) => (
                      <motion.div
                        key={solution.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300"
                      >
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedSolution(expandedSolution === solution.id ? null : solution.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(solution.color)}`}>
                                {solution.icon}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold mb-1">{solution.title}</h3>
                                <p className="text-gray-400">{solution.subtitle}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getColorClasses(solution.color, "text")}`}>
                                  {solution.impact}
                                </div>
                                <div className="text-sm text-gray-500">{solution.timeline}</div>
                              </div>
                              
                              <motion.div
                                animate={{ rotate: expandedSolution === solution.id ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <FiChevronRight className="text-2xl text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedSolution === solution.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-800"
                            >
                              <div className="p-6 bg-gray-950/50">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                  <div className="lg:col-span-2">
                                    <p className="text-gray-300 mb-6">{solution.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="font-semibold mb-3 text-white">Key Features</h4>
                                        <ul className="space-y-2">
                                          {solution.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                              <FiCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                                              <span className="text-gray-400 text-sm">{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-semibold mb-3 text-white">Implementation</h4>
                                        <div className="space-y-2">
                                          {solution.process.map((step, i) => (
                                            <div key={i} className="flex items-center">
                                              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getColorClasses(solution.color)} flex items-center justify-center text-xs font-bold text-white mr-3`}>
                                                {i + 1}
                                              </div>
                                              <span className="text-gray-400 text-sm">{step}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                      <h4 className="font-semibold mb-4 text-white">Expected Impact</h4>
                                      <div className="space-y-3">
                                        {solution.benefits.map((benefit, i) => (
                                          <div key={i} className="flex items-center justify-between">
                                            <div>
                                              <div className="text-sm text-gray-400">{benefit.metric}</div>
                                              <div className="text-xs text-gray-500">{benefit.description}</div>
                                            </div>
                                            <div className={`text-lg font-bold ${getColorClasses(solution.color, "text")}`}>
                                              {benefit.value}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="flex gap-2 mt-4">
                                        <button className={`flex-1 px-4 py-2 bg-gradient-to-r ${getColorClasses(solution.color)} text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300`}>
                                          Request Demo
                                        </button>
                                        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors">
                                          <FiDownload />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Grid View - Different Card Style */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSolutions.map((solution, index) => (
                      <motion.div
                        key={solution.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:shadow-[0_0_40px_rgba(79,70,229,0.15)] transition-all duration-500"
                      >
                        {/* Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(solution.color)}`}>
                              {solution.icon}
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${getColorClasses(solution.color, "text")}`}>
                                {solution.impact}
                              </div>
                              <div className="text-xs text-gray-500">{solution.timeline}</div>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2">{solution.title}</h3>
                          <p className="text-sm text-gray-400 mb-4">{solution.subtitle}</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{solution.description}</p>
                        </div>

                        {/* Metrics */}
                        <div className="px-6 pb-4">
                          <div className="grid grid-cols-3 gap-2">
                            {solution.benefits.slice(0, 3).map((benefit, i) => (
                              <div key={i} className="text-center">
                                <div className={`text-lg font-bold ${getColorClasses(solution.color, "text")}`}>
                                  {benefit.value}
                                </div>
                                <div className="text-xs text-gray-500">{benefit.metric}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-4 border-t border-gray-800">
                          <button 
                            onClick={() => setSelectedSolution(solution)}
                            className="w-full py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center justify-center group-hover:text-blue-400"
                          >
                            Learn More <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === "benefits" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <section className="relative z-10 px-6 pb-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Measurable <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Business Impact</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Our solutions deliver quantifiable results across key performance indicators
                  </p>
                </div>

                {/* Impact Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                  {[
                    { category: "Cost Reduction", value: "15-30%", icon: "💰", color: "green", desc: "Lower operational costs" },
                    { category: "Efficiency Gains", value: "25-45%", icon: "⚡", color: "blue", desc: "Improved productivity" },
                    { category: "Quality Improvement", value: "40-65%", icon: "🎯", color: "purple", desc: "Fewer defects" },
                    { category: "ROI Timeline", value: "3-12 months", icon: "📈", color: "amber", desc: "Fast payback period" }
                  ].map((impact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300"
                    >
                      <div className="text-4xl mb-4">{impact.icon}</div>
                      <h3 className={`text-3xl font-bold mb-2 ${getColorClasses(impact.color, "text")}`}>
                        {impact.value}
                      </h3>
                      <h4 className="font-semibold mb-2">{impact.category}</h4>
                      <p className="text-gray-400 text-sm">{impact.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Detailed Benefits by Solution */}
                <div className="space-y-8">
                  {solutionsData.map((solution, index) => (
                    <motion.div
                      key={solution.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-gradient-to-r from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-8"
                    >
                      <div className="flex items-start space-x-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${getColorClasses(solution.color)} flex-shrink-0`}>
                          {solution.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{solution.title}</h3>
                          <p className="text-gray-400 mb-6">{solution.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {solution.benefits.map((benefit, i) => (
                              <div key={i} className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                                <div className={`text-2xl font-bold mb-1 ${getColorClasses(solution.color, "text")}`}>
                                  {benefit.value}
                                </div>
                                <div className="font-medium text-sm mb-1">{benefit.metric}</div>
                                <div className="text-xs text-gray-500">{benefit.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === "process" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <section className="relative z-10 px-6 pb-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Implementation <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Process</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Our proven methodology ensures successful deployment and maximum value realization
                  </p>
                </div>

                {/* Timeline View */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full hidden lg:block"></div>
                  
                  <div className="space-y-16">
                    {[
                      {
                        phase: "Discovery & Assessment",
                        duration: "Week 1-2",
                        icon: "🔍",
                        color: "blue",
                        activities: [
                          "Current state analysis",
                          "Requirements gathering", 
                          "Technical assessment",
                          "ROI projection"
                        ]
                      },
                      {
                        phase: "Solution Design",
                        duration: "Week 2-3", 
                        icon: "🎨",
                        color: "purple",
                        activities: [
                          "Custom solution architecture",
                          "Integration planning",
                          "User experience design",
                          "Testing strategy"
                        ]
                      },
                      {
                        phase: "Development & Integration",
                        duration: "Week 3-6",
                        icon: "⚙️", 
                        color: "amber",
                        activities: [
                          "System development",
                          "API integrations",
                          "Quality assurance",
                          "Security implementation"
                        ]
                      },
                      {
                        phase: "Deployment & Training",
                        duration: "Week 6-8",
                        icon: "🚀",
                        color: "green",
                        activities: [
                          "Production deployment",
                          "User training sessions", 
                          "Performance monitoring",
                          "Support handover"
                        ]
                      },
                      {
                        phase: "Optimization & Support",
                        duration: "Ongoing",
                        icon: "📈",
                        color: "indigo",
                        activities: [
                          "Performance optimization",
                          "Continuous improvement",
                          "24/7 support",
                          "Regular reviews"
                        ]
                      }
                    ].map((phase, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className={`flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                      >
                        {/* Content */}
                        <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(phase.color)}`}>
                                <span className="text-2xl">{phase.icon}</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{phase.phase}</h3>
                                <p className={`text-sm ${getColorClasses(phase.color, "text")}`}>{phase.duration}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {phase.activities.map((activity, i) => (
                                <div key={i} className="flex items-center">
                                  <FiCheck className="text-green-400 mr-2 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{activity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Timeline dot */}
                        <div className="hidden lg:block relative z-10">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getColorClasses(phase.color)} flex items-center justify-center text-white font-bold text-xl border-4 border-black`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="flex-1 hidden lg:block"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === "case-studies" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <section className="relative z-10 px-6 pb-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Success <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Stories</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Real results from real implementations across various industries
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {solutionsData.map((solution, index) => (
                    <motion.div
                      key={solution.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(79,70,229,0.15)] transition-all duration-500"
                    >
                      <div className="flex items-start space-x-4 mb-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(solution.color)}`}>
                          {solution.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{solution.title}</h3>
                          <p className={`text-sm ${getColorClasses(solution.color, "text")}`}>{solution.caseStudy.company}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="text-lg font-medium text-gray-300 mb-4">
                          "{solution.caseStudy.result}"
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                          {solution.benefits.map((benefit, i) => (
                            <div key={i} className="text-center">
                              <div className={`text-lg font-bold ${getColorClasses(solution.color, "text")}`}>
                                {benefit.value}
                              </div>
                              <div className="text-xs text-gray-500">{benefit.metric}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Implementation: {solution.timeline} • {solution.complexity} complexity
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center">
                          Full Case Study <FiExternalLink className="ml-1" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution Detail Modal - Redesigned */}
      <AnimatePresence>
        {selectedSolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSolution(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(selectedSolution.color)}`}>
                    {selectedSolution.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSolution.title}</h2>
                    <p className="text-gray-400">{selectedSolution.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Overview */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Overview</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{selectedSolution.description}</p>
                </div>

                {/* Key Metrics */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Expected Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedSolution.benefits.map((benefit, i) => (
                      <div key={i} className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className={`text-3xl font-bold mb-2 ${getColorClasses(selectedSolution.color, "text")}`}>
                          {benefit.value}
                        </div>
                        <div className="font-medium mb-1">{benefit.metric}</div>
                        <div className="text-sm text-gray-500">{benefit.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features & Process */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                    <div className="space-y-3">
                      {selectedSolution.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Implementation Steps</h3>
                    <div className="space-y-3">
                      {selectedSolution.process.map((step, i) => (
                        <div key={i} className="flex items-start">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getColorClasses(selectedSolution.color)} flex items-center justify-center text-xs font-bold text-white mr-3 mt-0.5 flex-shrink-0`}>
                            {i + 1}
                          </div>
                          <span className="text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Case Study */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4">Case Study</h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center font-bold">
                      {selectedSolution.caseStudy.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedSolution.caseStudy.company}</h4>
                      <p className="text-gray-300 mt-2">{selectedSolution.caseStudy.result}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-800">
                  <button className={`px-6 py-3 bg-gradient-to-r ${getColorClasses(selectedSolution.color)} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}>
                    Request Demo
                  </button>
                  <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Download Brochure
                  </button>
                  <button className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-800/50 transition-colors">
                    Schedule Consultation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
{/* New Solutions Comparison Section */}
<section className="relative z-10 px-6 py-16">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Why Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Solutions Stand Out</span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Compare our comprehensive approach against traditional solutions
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 border border-blue-500/30 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500"
      >
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mr-4">
            <FiTrendingUp className="text-2xl" />
          </div>
          <h3 className="text-2xl font-bold">Our AI-Powered Solutions</h3>
        </div>
        
        <div className="space-y-4">
          {[
            "Predictive analytics with 95%+ accuracy",
            "Seamless integration with existing systems",
            "Real-time monitoring and adjustments",
            "Continuous learning and improvement",
            "Customized to your specific operations",
            "Proactive problem prevention"
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-2xl p-8 opacity-80"
      >
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 mr-4">
            <FiClock className="text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400">Traditional Solutions</h3>
        </div>
        
        <div className="space-y-4">
          {[
            "Reactive approach to problems",
            "Limited integration capabilities",
            "Manual monitoring and adjustments",
            "Static algorithms without learning",
            "One-size-fits-all implementation",
            "Higher long-term maintenance costs"
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <FiX className="text-red-400 mt-1 mr-3 flex-shrink-0" />
              <span className="text-gray-500">{feature}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
</section>

      <section className="relative z-10 px-6 py-28">
<div className="max-w-7xl mx-auto">
<div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-800 shadow-[0_30px_80px_rgba(79,70,229,0.08)]">
{/* Ambient rings */}
<div className="pointer-events-none absolute -left-36 -top-36 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-600/8 blur-3xl mix-blend-screen" />
<div className="pointer-events-none absolute -right-36 -bottom-36 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-blue-400/6 to-indigo-700/6 blur-3xl mix-blend-screen" />


<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-12 lg:p-14">
{/* Left: Headline + CTAs */}
<div className="lg:col-span-7 text-center lg:text-left">
<motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
<h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">transform</span> your operations?
</h2>


<p className="mt-5 text-lg md:text-xl text-gray-300 max-w-3xl">
Trusted by <span className="font-semibold text-white">500+ manufacturers</span>, our AI-first platform turns hidden inefficiencies into predictable gains — faster cycles,
fewer breakdowns, measurable ROI in months.
</p>


<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
<button className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-700 text-white font-semibold shadow-2xl transform hover:scale-[1.02] transition-all">
Schedule demo
<FiArrowRight className="ml-1" />
</button>


<button className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl border border-gray-700 text-gray-200 bg-transparent hover:bg-gray-800/30 transition">
Explore solutions
</button>


<a href="#contact" className="text-sm text-gray-400 ml-0 sm:ml-4 mt-2 sm:mt-0">Prefer email? contact@company.com</a>
</div>
</motion.div>
</div>


{/* Right: Large visual stats card */}
<motion.div initial={{ opacity: 0, scale: 0.99 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="lg:col-span-5">
<div className="relative bg-gradient-to-t from-gray-900/75 to-gray-850/50 border border-gray-700 rounded-3xl p-6 shadow-2xl">
<div className="flex items-start gap-4">
<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
AI
</div>


<div className="flex-1 min-w-0">
<div className="flex items-center justify-between gap-3">
<div>
<div className="text-sm text-gray-400">Predictive Maintenance</div>
<div className="mt-1 text-2xl md:text-3xl font-bold text-white">Cut unplanned downtime <span className="text-cyan-300">up to 45%</span></div>
</div>


<div className="text-right">
<div className="text-xs text-gray-400">Confidence</div>
<div className="text-xl font-semibold text-cyan-300">98%</div>
</div>
</div>


{/* Adoption bar */}
<div className="mt-5">
<div className="flex items-center justify-between text-sm text-gray-400">
<span>Adoption</span>
<span className="font-semibold text-white">82%</span>
</div>
<div className="mt-2 w-full bg-gray-800 rounded-full h-3 overflow-hidden">
<div className="h-full rounded-full" style={{ width: '82%', background: 'linear-gradient(90deg,#06b6d4,#7c3aed)' }} />
</div>
</div>


{/* Key metrics badges */}
<div className="mt-6 grid grid-cols-3 gap-3 text-center">
<div className="py-3 px-2 bg-gray-900/40 border border-gray-800 rounded-xl">
<div className="text-2xl font-extrabold text-blue-400">500+</div>
<div className="text-xs text-gray-400">Implementations</div>
</div>


<div className="py-3 px-2 bg-gray-900/40 border border-gray-800 rounded-xl">
<div className="text-2xl font-extrabold text-purple-400">98%</div>
<div className="text-xs text-gray-400">Success rate</div>
</div>


<div className="py-3 px-2 bg-gray-900/40 border border-gray-800 rounded-xl">
<div className="text-2xl font-extrabold text-cyan-300">3.5x</div>
<div className="text-xs text-gray-400">Average ROI</div>
</div>
</div>


<div className="mt-5 flex items-center gap-3">
<FiCheck className="text-cyan-300" />
<div className="text-sm text-gray-300">Fast onboarding · Plant-ready integrations · Secure by default</div>
</div>


<div className="mt-5 text-right">
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-700 text-white font-semibold shadow">Request personalized demo</button>
</div>
</div>
</div>
</div>
</motion.div>
</div>
</div>
</div>
</section>
<Footer />
    </div>
  );
};

export default Solutions;