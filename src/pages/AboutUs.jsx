import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers, FiHeart, FiAward, FiGlobe, FiTarget,
  FiClock, FiTrendingUp, FiZap, FiStar, FiBookOpen,
  FiMap, FiLayers, FiCpu, FiShield, FiBarChart2,
  FiChevronDown, FiChevronUp, FiPlay, FiPause,
  FiCheck, FiX, FiArrowRight, FiLinkedin, FiTwitter,
  FiInstagram, FiMail, FiExternalLink
} from "react-icons/fi";
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

const AboutUsPage = () => {
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [activeValue, setActiveValue] = useState(0);
  const [teamView, setTeamView] = useState("grid");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const values = [
    {
      title: "Innovation First",
      description: "We constantly push boundaries to develop cutting-edge solutions that transform industries.",
      icon: <FiZap className="text-3xl" />,
      color: "purple"
    },
    {
      title: "Customer Success",
      description: "Our clients' achievements are our greatest measure of success. We're committed to your growth.",
      icon: <FiTrendingUp className="text-3xl" />,
      color: "blue"
    },
    {
      title: "Integrity Always",
      description: "We operate with transparency, honesty, and ethical practices in everything we do.",
      icon: <FiShield className="text-3xl" />,
      color: "green"
    },
    {
      title: "Collaborative Excellence",
      description: "We believe that the best solutions emerge from diverse perspectives working together.",
      icon: <FiUsers className="text-3xl" />,
      color: "amber"
    }
  ];

  const timelineData = [
    {
      year: "2015",
      title: "Foundation",
      description: "Company founded with a vision to revolutionize industrial AI solutions.",
      milestone: "First patent filed",
      color: "purple"
    },
    {
      year: "2017",
      title: "Breakthrough",
      description: "Launched our flagship predictive maintenance platform to market acclaim.",
      milestone: "100th customer onboarded",
      color: "blue"
    },
    {
      year: "2019",
      title: "Expansion",
      description: "Opened international offices and secured Series B funding.",
      milestone: "Expanded to 3 continents",
      color: "green"
    },
    {
      year: "2021",
      title: "Innovation",
      description: "Introduced industry-first AI-powered supply chain optimization suite.",
      milestone: "5 industry awards won",
      color: "amber"
    },
    {
      year: "2023",
      title: "Leadership",
      description: "Recognized as market leader in industrial AI with 500+ enterprise clients.",
      milestone: "Reached 200 employees",
      color: "indigo"
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Alexandra Chen",
      role: "CEO & Founder",
      bio: "Former head of AI research at TechGlobal with 15+ years in industrial automation.",
      image: "/team/alexandra.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["AI Strategy", "Business Development", "Product Vision"],
      color: "purple"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "CTO",
      bio: "Ph.D in Machine Learning from Stanford. Built scalable AI systems for Fortune 500 companies.",
      image: "/team/marcus.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["Machine Learning", "System Architecture", "R&D"],
      color: "blue"
    },
    {
      id: 3,
      name: "Sophie Williams",
      role: "Head of Product",
      bio: "Product leader with expertise in bringing complex AI solutions to market successfully.",
      image: "/team/sophie.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["Product Management", "UX Research", "Market Analysis"],
      color: "green"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Lead Data Scientist",
      bio: "Data science innovator with publications in top AI journals and conferences.",
      image: "/team/david.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["Predictive Analytics", "Algorithm Development", "Data Engineering"],
      color: "amber"
    },
    {
      id: 5,
      name: "Elena Petrov",
      role: "VP of Engineering",
      bio: "Seasoned engineering leader with background in building high-performance teams.",
      image: "/team/elena.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["Software Architecture", "DevOps", "Team Leadership"],
      color: "red"
    },
    {
      id: 6,
      name: "James Okafor",
      role: "Head of Customer Success",
      bio: "Customer-centric leader with track record of driving adoption and satisfaction.",
      image: "/team/james.jpg",
      social: { linkedin: "#", twitter: "#" },
      expertise: ["Client Relations", "Implementation", "Solution Consulting"],
      color: "indigo"
    }
  ];

  const stats = [
    { value: "500+", label: "Enterprise Clients", icon: <FiUsers /> },
    { value: "98%", label: "Customer Satisfaction", icon: <FiStar /> },
    { value: "15", label: "Countries Served", icon: <FiGlobe /> },
    { value: "45%", label: "Average ROI", icon: <FiTrendingUp /> },
    { value: "24/7", label: "Global Support", icon: <FiClock /> },
    { value: "25+", label: "Industry Awards", icon: <FiAward /> }
  ];

  const getColorClasses = (color, type = "bg") => {
    const colors = {
      purple: type === "bg" ? "bg-purple-500" : type === "text" ? "text-purple-400" : "from-purple-600 to-purple-800",
      blue: type === "bg" ? "bg-blue-500" : type === "text" ? "text-blue-400" : "from-blue-600 to-blue-800",
      green: type === "bg" ? "bg-green-500" : type === "text" ? "text-green-400" : "from-green-600 to-green-800",
      amber: type === "bg" ? "bg-amber-500" : type === "text" ? "text-amber-400" : "from-amber-600 to-amber-800",
      red: type === "bg" ? "bg-red-500" : type === "text" ? "text-red-400" : "from-red-600 to-red-800",
      indigo: type === "bg" ? "bg-indigo-500" : type === "text" ? "text-indigo-400" : "from-indigo-600 to-indigo-800"
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

  const openMemberModal = (member) => {
    setSelectedMember(member);
    document.body.style.overflow = 'hidden';
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = 'auto';
  };

  // Close modal when clicking outside content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedMember && event.target.classList.contains('modal-overlay')) {
        closeMemberModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMember]);

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
                Our Story
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="block">Pioneering the Future of</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400">
                  Industrial Intelligence
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-300 mb-10"
              >
                We're transforming how industries operate through AI-powered solutions that drive efficiency, sustainability, and growth. Our mission is to empower businesses with intelligent technology that creates tangible value.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  Meet Our Team
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                  View Open Positions <FiArrowRight className="ml-2" />
                </button>
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
                    <div className="text-sm text-gray-400">ourstory.example.com</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 mb-6">
                    <div className="col-span-4 h-4 bg-gray-800 rounded"></div>
                    <div className="col-span-3 h-4 bg-gray-800 rounded"></div>
                    <div className="col-span-5 h-4 bg-gray-800 rounded"></div>
                    
                    <div className="col-span-12 h-32 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-lg mt-4 flex items-center justify-center">
                      <FiUsers className="text-4xl text-cyan-400" />
                    </div>
                    
                    <div className="col-span-6 mt-4">
                      <div className="h-24 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-300">Team Growth</span>
                          <FiTrendingUp className="text-green-400" />
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full mb-1">
                          <div className="h-full bg-cyan-500 rounded-full w-3/4"></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">+45% YoY</div>
                      </div>
                    </div>
                    
                    <div className="col-span-6 mt-4">
                      <div className="h-24 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-300">Global Reach</span>
                          <FiGlobe className="text-amber-400" />
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full mb-1">
                          <div className="h-full bg-purple-500 rounded-full w-5/6"></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">15 countries</div>
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-900/30 rounded-xl border border-gray-800/50">
                <div className="flex justify-center text-cyan-400 mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Purpose</span>
              </h2>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-800 mr-4">
                      <FiTarget className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold">Our Mission</h3>
                  </div>
                  <p className="text-gray-300">
                    To empower industries with intelligent technology that drives efficiency, reduces waste, and creates sustainable value for businesses, people, and the planet.
                  </p>
                </div>
                
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 mr-4">
                      <FiGlobe className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold">Our Vision</h3>
                  </div>
                  <p className="text-gray-300">
                    A world where industrial operations are seamlessly optimized through AI, creating abundance while minimizing environmental impact and maximizing human potential.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl"></div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-center">Our Impact</h3>
                
                <div className="space-y-6">
                  {[
                    { value: "2.3M", label: "Tons of CO₂ reduced annually" },
                    { value: "$4.7B", label: "Client savings generated" },
                    { value: "15K", label: "Jobs enhanced through our technology" },
                    { value: "98%", label: "Client retention rate" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full mr-4"></div>
                      <div>
                        <div className="font-bold text-cyan-400">{item.value}</div>
                        <div className="text-sm text-gray-400">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <div className="flex items-center justify-center">
                    <FiHeart className="text-red-400 mr-2" />
                    <span className="text-gray-300">Measuring success beyond profits</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Core Values</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              The principles that guide our decisions, actions, and innovations
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300 cursor-pointer ${activeValue === index ? 'ring-2 ring-cyan-500' : ''}`}
                onClick={() => setActiveValue(index)}
              >
                <div className={`p-3 rounded-xl ${getColorClasses(value.color, "bg")} w-fit mb-4`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Expanded Value View */}
          <AnimatePresence>
            {activeValue !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{values[activeValue].title}</h3>
                    <p className="text-gray-300 mb-6">
                      {values[activeValue].description} We embed this value in everything we do, from product development to customer support.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Guides our product development priorities",
                        "Shapes our hiring and team culture",
                        "Informs our client engagement approach",
                        "Drives our continuous improvement efforts"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                    <h4 className="font-semibold mb-4">How We Live This Value</h4>
                    <div className="space-y-4">
                      {[
                        { metric: "Team Training", value: "10+ hours quarterly", description: "Dedicated to value reinforcement" },
                        { metric: "Client Feedback", value: "4.9/5 rating", description: "On value alignment" },
                        { metric: "Projects Influenced", value: "100%", description: "All projects reflect our values" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">{item.metric}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          <div className={`text-lg font-bold ${getColorClasses(values[activeValue].color, "text")}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Journey</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              From ambitious startup to industry leader—key milestones in our evolution
            </motion.p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12 lg:space-y-0">
              {timelineData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                    <div className={`p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300 ${activeTimeline === index ? 'ring-2 ring-cyan-500' : ''}`}
                         onClick={() => setActiveTimeline(index)}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${getColorClasses(item.color, "bg")}`}>
                          <span className="text-white font-bold">{item.year}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="text-gray-400">{item.milestone}</p>
                        </div>
                      </div>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-full ${getColorClasses(item.color, "bg")} flex items-center justify-center text-white font-bold border-4 border-black`}>
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

      {/* Team Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Leadership Team</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Diverse experts united by a passion for innovation and excellence
            </motion.p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setTeamView("grid")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${teamView === "grid" ? "bg-cyan-600 text-white" : "bg-gray-800/50 text-gray-400"}`}
              >
                Grid View
              </button>
              <button
                onClick={() => setTeamView("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${teamView === "list" ? "bg-cyan-600 text-white" : "bg-gray-800/50 text-gray-400"}`}
              >
                List View
              </button>
            </div>
          </div>

          {teamView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] transition-all duration-500 cursor-pointer"
                  onClick={() => openMemberModal(member)}
                >
                  <div className="p-6">
                    {/* Member image placeholder */}
                    <div className={`h-48 rounded-xl ${getColorClasses(member.color)} mb-6 flex items-center justify-center text-white text-4xl`}>
                      {member.name.charAt(0)}
                    </div>
                    
                    {/* Name & Role */}
                    <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-300 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-cyan-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {member.bio}
                    </p>
                    
                    {/* Expertise tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.expertise.slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {member.expertise.length > 2 && (
                        <span className="px-2 py-1 bg-gray-800/50 text-gray-500 text-xs rounded">
                          +{member.expertise.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    {/* View profile button */}
                    <div className="w-full py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center justify-center">
                      View Profile <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300 cursor-pointer"
                  onClick={() => openMemberModal(member)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-xl ${getColorClasses(member.color)} flex items-center justify-center text-white text-2xl`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                          <p className="text-cyan-400 font-medium">{member.role}</p>
                          <p className="text-gray-400 text-sm mt-1">{member.bio}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2">
                          {member.expertise.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {member.expertise.length > 2 && (
                            <span className="px-2 py-1 bg-gray-800/50 text-gray-500 text-xs rounded">
                              +{member.expertise.length - 2}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                          <FiArrowRight className="text-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video/Story Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Story in <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Motion</span>
              </h2>
              
              <p className="text-gray-300 text-lg mb-6">
                Discover how our journey began, the challenges we've overcome, and our vision for the future in this short documentary about our company.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "The founding vision that started it all",
                  "Breakthrough moments in our development",
                  "How our technology creates real-world impact",
                  "Our commitment to sustainable innovation"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center">
                <FiPlay className="mr-2" /> Watch Our Story
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl"></div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden relative z-10">
                {/* Video placeholder */}
                <div className="h-80 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-cyan-600/30 border-4 border-cyan-400/50 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={toggleVideoPlayback}>
                      {isPlaying ? (
                        <FiPause className="text-3xl text-white" />
                      ) : (
                        <FiPlay className="text-3xl text-white ml-1" />
                      )}
                    </div>
                    <p className="text-gray-300">Our Founder's Story</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Our Founder's Vision</h3>
                    <span className="text-sm text-gray-500">12:45</span>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Chapter 3: The Breakthrough</span>
                    <span>3/8</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Transform</span> Your Business?
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Join hundreds of industry leaders who have revolutionized their operations with our AI-powered solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                Schedule a Demo
              </button>
              <button className="px-8 py-4 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors">
                Contact Our Team
              </button>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-800 flex flex-wrap justify-center gap-6 text-gray-500">
              <div className="flex items-center">
                <FiCheck className="text-green-400 mr-2" /> No credit card required
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-400 mr-2" /> Personalized consultation
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-400 mr-2" /> 30-day pilot program
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={closeMemberModal}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800 transition-colors z-10"
              >
                <FiX className="text-xl" />
              </button>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className={`w-32 h-32 rounded-xl ${getColorClasses(selectedMember.color)} flex items-center justify-center text-white text-5xl`}>
                    {selectedMember.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedMember.name}</h2>
                    <p className="text-cyan-400 font-medium mb-4">{selectedMember.role}</p>
                    <p className="text-gray-300">{selectedMember.bio}</p>
                    
                    <div className="flex items-center space-x-4 mt-4">
                      <a href={selectedMember.social.linkedin} className="text-gray-500 hover:text-cyan-400 transition-colors">
                        <FiLinkedin className="text-xl" />
                      </a>
                      <a href={selectedMember.social.twitter} className="text-gray-500 hover:text-cyan-400 transition-colors">
                        <FiTwitter className="text-xl" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.expertise.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Background</h3>
                  <p className="text-gray-300 mb-4">
                    With over a decade of experience in the industry, {selectedMember.name.split(' ')[0]} has been instrumental in driving our company's vision and technological innovation. Their unique perspective and leadership have helped shape our products and culture.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                      <span>Led the development of our flagship AI platform</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                      <span>Mentored and built high-performing engineering teams</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                      <span>Published research in top AI conferences and journals</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
   
  );
};

export default AboutUsPage;