import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, Database, Globe, Grid, List, BarChart3, PieChart,
  ChevronLeft, ChevronRight, Download, Expand, ChevronDown, ChevronUp,
  RefreshCw, X, Filter, Eye, BarChart2, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Info, Star, Calendar, Hash, DollarSign,
  Users, Package, Wrench, FileText, CreditCard, Building, Clock,
  ArrowUpDown, Search, Plus, Minus, Maximize, Minimize, Home,
  Activity, Zap, Target, Award, Settings, HelpCircle, Menu,
  ArrowLeft, Layers, Shield, Cpu, Brain, ExternalLink, Copy,
  Smartphone, Monitor, Tablet, MapPin, Factory, Briefcase, MessageSquare,
  Lightbulb, Sparkles, LineChart, MoreHorizontal, ChevronsUpDown,
  Tag, Warehouse, Gauge, Beaker, ClipboardList, PlayCircle
} from 'lucide-react';
import api from '../utils/api';

const EnhancedAIAssistant = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataViewType, setDataViewType] = useState('cards');
  const [expandedSections, setExpandedSections] = useState({});
  const [currentPages, setCurrentPages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Items per page for pagination
  const ITEMS_PER_PAGE = 6;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchCapabilities();
  }, [activeTab]);

  const fetchCapabilities = async () => {
    setIsInitializing(true);
    try {
      const response = await api.get('ai-query/');
      setCapabilities(response.data);
      
      // Add welcome message when capabilities are loaded
      if (messages.length === 0) {
        const welcomeMessage = {
          id: Date.now(),
          text: response.data.message || "Hello! I'm your ERP AI Assistant. Ask me anything about your business data.",
          sender: 'ai',
          timestamp: new Date(),
          success: true,
          isWelcome: true,
          capabilities: response.data.capabilities,
          examples: response.data.example_queries,
          company: response.data.company
        };
        setMessages([welcomeMessage]);
      }
    } catch (err) {
      console.error('Failed to fetch capabilities:', err);
      setError('Failed to initialize AI Assistant');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputText;
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = activeTab === 'system' ? 'ai-query/' : 'api/general-ai/';
      const response = await api.post(endpoint, { query: currentQuery });
      
      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          analysis: response.data.analysis,
          data: response.data.data,
          sender: 'ai',
          timestamp: new Date(),
          success: response.data.success,
          meta: response.data.meta
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.error || 'Query failed');
      }
    } catch (err) {
      console.error('AI query error:', err);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: err.response?.data?.response || "I encountered an issue processing your request. Please try again or rephrase your question.",
        sender: 'ai',
        timestamp: new Date(),
        success: false,
        error: err.response?.data?.error || err.message
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuery = (query) => {
    setInputText(query);
    inputRef.current?.focus();
  };

  const toggleExpandSection = (messageId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${messageId}-${section}`]: !prev[`${messageId}-${section}`]
    }));
  };

  const handlePageChange = (messageId, dataKey, direction) => {
    const currentPage = currentPages[`${messageId}-${dataKey}`] || 1;
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    
    setCurrentPages(prev => ({
      ...prev,
      [`${messageId}-${dataKey}`]: newPage
    }));
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    }
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return value.toString();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'in_progress': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'planned': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      'released': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      'cancelled': 'text-red-400 bg-red-500/10 border-red-500/20',
      'delayed': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'high': 'text-red-400 bg-red-500/10 border-red-500/20',
      'medium': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      'low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return statusColors[status?.toLowerCase()] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const getFieldIcon = (fieldName, value) => {
    const field = fieldName?.toLowerCase() || '';
    
    // Status and priority specific icons
    if (field.includes('status') || field.includes('priority')) {
      const val = value?.toLowerCase() || '';
      if (val.includes('completed')) return CheckCircle;
      if (val.includes('progress')) return Clock;
      if (val.includes('planned')) return Calendar;
      if (val.includes('high')) return AlertCircle;
      return Activity;
    }
    
    // Field-specific icons
    const iconMap = {
      sku: Package,
      product_name: Package,
      wo_number: FileText,
      employee_code: Users,
      full_name: Users,
      equipment_code: Wrench,
      equipment_name: Wrench,
      cost: DollarSign,
      price: DollarSign,
      rate: DollarSign,
      amount: DollarSign,
      hourly_rate: DollarSign,
      date: Calendar,
      due_date: Calendar,
      hire_date: Calendar,
      quantity: Hash,
      location: MapPin,
      department: Building,
      category: Tag,
      warehouse: Warehouse,
      supplier: Briefcase,
      customer: Users,
      party: Briefcase,
      account: CreditCard,
      journal: FileText,
      downtime: AlertCircle,
      efficiency: Gauge,
      skill: Award,
      cost_center: Building
    };
    
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (field.includes(key)) {
        return Icon;
      }
    }
    return Info;
  };

  const renderDataCard = (item, index, delay = 0) => {
    const mainFields = Object.entries(item).slice(0, 4);
    const additionalFields = Object.entries(item).slice(4);
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: delay * 0.05, duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-xl"
      >
        {/* Main Fields */}
        <div className="space-y-4 mb-4">
          {mainFields.map(([field, value], fieldIndex) => {
            const Icon = getFieldIcon(field, value);
            const isStatus = field.toLowerCase().includes('status') || field.toLowerCase().includes('priority');
            
            return (
              <div key={fieldIndex} className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-gray-700/40 group-hover:bg-purple-500/10 transition-colors">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 capitalize font-medium mb-1">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {isStatus && value ? (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(value)}`}>
                        {value.toString().replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ) : (
                      <p className="text-sm text-white font-medium truncate">
                        {formatValue(value)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Additional Fields (Collapsible) */}
        {additionalFields.length > 0 && (
          <details className="group/details">
            <summary className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-gray-700/30 transition-colors cursor-pointer">
              <span className="text-xs text-gray-400 font-medium">
                +{additionalFields.length} more fields
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open/details:rotate-180 transition-transform" />
            </summary>
            <div className="mt-3 pt-3 border-t border-gray-700/40 space-y-3">
              {additionalFields.map(([field, value], fieldIndex) => {
                const Icon = getFieldIcon(field, value);
                const isStatus = field.toLowerCase().includes('status') || field.toLowerCase().includes('priority');
                
                return (
                  <div key={fieldIndex} className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <Icon className="w-3 h-3 text-gray-500 flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 capitalize">
                          {field.replace(/_/g, ' ')}
                        </p>
                        {isStatus && value ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
                            {value.toString().replace(/_/g, ' ').toUpperCase()}
                          </span>
                        ) : (
                          <p className="text-xs text-gray-300 truncate">
                            {formatValue(value)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </motion.div>
    );
  };

  const renderDataVisualization = (data, messageId) => {
    if (!data) return null;

    const dataKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
    
    return (
      <div className="space-y-6 mt-6">
        {dataKeys.map(key => {
          const items = data[key];
          const currentPage = currentPages[`${messageId}-${key}`] || 1;
          const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const currentItems = items.slice(startIndex, endIndex);
          const isExpanded = expandedSections[`${messageId}-${key}`];
          
          return (
            <motion.div 
              key={key} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700/50 overflow-hidden backdrop-blur-xl"
            >
              <div className="p-6 border-b border-gray-700/40 flex justify-between items-center bg-gradient-to-r from-gray-800/60 to-gray-900/60">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
                    <Database className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white capitalize text-xl mb-1">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>{items.length} total records</span>
                      </span>
                      {isExpanded && (
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Showing {startIndex + 1}-{Math.min(endIndex, items.length)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-xs text-gray-400 font-medium">View:</span>
                    <div className="flex bg-gray-700/50 rounded-xl p-1">
                      {['cards', 'table', 'charts'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setDataViewType(type)}
                          disabled={!isExpanded}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            dataViewType === type && isExpanded
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'text-gray-400 hover:text-gray-300 disabled:opacity-50'
                          }`}
                        >
                          {type === 'cards' && <Grid className="w-3 h-3" />}
                          {type === 'table' && <List className="w-3 h-3" />}
                          {type === 'charts' && <BarChart3 className="w-3 h-3" />}
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="p-3 rounded-xl hover:bg-gray-700/50 transition-colors group"
                    onClick={() => toggleExpandSection(messageId, key)}
                  >
                    {isExpanded ? (
                      <Minimize className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                      <Maximize className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Mobile View Type Selector */}
                      <div className="md:hidden mb-6">
                        <div className="flex bg-gray-700/50 rounded-xl p-1">
                          {['cards', 'table', 'charts'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setDataViewType(type)}
                              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                dataViewType === type
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                  : 'text-gray-400 hover:text-gray-300'
                              }`}
                            >
                              {type === 'cards' && <Grid className="w-4 h-4" />}
                              {type === 'table' && <List className="w-4 h-4" />}
                              {type === 'charts' && <BarChart3 className="w-4 h-4" />}
                              <span className="capitalize">{type}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && dataViewType !== 'charts' && (
                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700/30">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handlePageChange(messageId, key, 'prev')}
                              disabled={currentPage === 1}
                              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </button>
                            
                            <button
                              onClick={() => handlePageChange(messageId, key, 'next')}
                              disabled={currentPage === totalPages}
                              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-2">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPages(prev => ({
                                      ...prev,
                                      [`${messageId}-${key}`]: pageNum
                                    }))}
                                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                                      currentPage === pageNum
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>Page</span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg font-semibold">
                                {currentPage}
                              </span>
                              <span>of {totalPages}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Visualization */}
                      {dataViewType === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {currentItems.map((item, index) => renderDataCard(item, index, index))}
                        </div>
                      )}

                      {dataViewType === 'table' && (
                        <div className="overflow-x-auto">
                          <div className="bg-gray-900/40 rounded-2xl border border-gray-700/40 overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-700/50 bg-gray-800/50">
                                  {items.length > 0 && Object.keys(items[0]).map((header, idx) => (
                                    <th key={idx} className="text-left py-4 px-6 text-sm text-gray-300 font-bold capitalize">
                                      <div className="flex items-center space-x-2">
                                        {React.createElement(getFieldIcon(header), { className: "w-4 h-4 text-gray-400" })}
                                        <span>{header.replace(/_/g, ' ')}</span>
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {currentItems.map((row, rowIndex) => (
                                  <motion.tr 
                                    key={rowIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: rowIndex * 0.05 }}
                                    className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/40 transition-colors"
                                  >
                                    {Object.entries(row).map(([fieldName, cell], cellIndex) => {
                                      const isStatus = fieldName.toLowerCase().includes('status') || fieldName.toLowerCase().includes('priority');
                                      
                                      return (
                                        <td key={cellIndex} className="py-4 px-6 text-sm">
                                          {isStatus && cell ? (
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(cell)}`}>
                                              {cell.toString().replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-200 font-medium">{formatValue(cell)}</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {dataViewType === 'charts' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl p-8 border border-gray-700/40"
                          >
                            <h5 className="text-xl font-bold text-white mb-6 flex items-center">
                              <PieChart className="w-6 h-6 mr-3 text-purple-400" />
                              Distribution Analysis
                            </h5>
                            <div className="h-80 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                                  <PieChart className="w-12 h-12 text-purple-400" />
                                </div>
                                <p className="text-gray-300 text-lg font-semibold mb-2">Chart Visualization Ready</p>
                                <p className="text-gray-500 text-sm">Interactive charts will be displayed here</p>
                                <div className="mt-4 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-medium inline-block">
                                  {items.length} data points available
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl p-8 border border-gray-700/40"
                          >
                            <h5 className="text-xl font-bold text-white mb-6 flex items-center">
                              <BarChart2 className="w-6 h-6 mr-3 text-blue-400" />
                              Trends & Patterns
                            </h5>
                            <div className="h-80 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                                  <LineChart className="w-12 h-12 text-blue-400" />
                                </div>
                                <p className="text-gray-300 text-lg font-semibold mb-2">Trend Analysis Ready</p>
                                <p className="text-gray-500 text-sm">Advanced analytics visualization</p>
                                <div className="mt-4 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium inline-block">
                                  Statistical insights available
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWelcomeMessage = (message) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20 backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome to Your AI Assistant</h3>
          <p className="text-gray-300 text-lg">{message.text}</p>
          {message.company && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full text-sm text-purple-400 border border-purple-500/20">
              <Building className="w-4 h-4 mr-2" />
              <span>{message.company}</span>
            </div>
          )}
        </div>

        {/* Capabilities */}
        {message.capabilities && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              My Capabilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.capabilities.map((capability, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Queries */}
        {message.examples && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Try These Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.examples.map((example, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickQuery(example)}
                  className="flex items-center space-x-3 p-4 bg-gray-800/40 hover:bg-gray-700/50 rounded-xl border border-gray-700/40 hover:border-purple-500/30 transition-all text-left group"
                >
                  <PlayCircle className="w-4 h-4 text-purple-400 group-hover:text-purple-300 flex-shrink-0" />
                  <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                    {example}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const isWelcome = message.isWelcome;
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div className={`max-w-4xl w-full ${isUser ? 'flex justify-end' : ''}`}>
          <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-4 ${isUser ? 'space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
              isUser 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                : isWelcome
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : activeTab === 'system'
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
            }`}>
              {isUser ? (
                <Users className="w-6 h-6 text-white" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Message Content */}
            <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
              <div className={`inline-block ${isUser ? 'text-right' : 'text-left'} max-w-full`}>
                <div className={`rounded-2xl px-6 py-4 ${
                  isUser 
                    ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white' 
                    : isWelcome
                      ? 'bg-transparent border-0 p-0'
                      : message.success === false
                        ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 text-red-200'
                        : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 text-gray-200 backdrop-blur-xl'
                }`}>
                  {isWelcome ? (
                    renderWelcomeMessage(message)
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      
                      {/* Analysis Section */}
                      {message.analysis && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-semibold text-sm">AI Analysis</span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{message.analysis}</p>
                        </div>
                      )}
                      
                      {/* Error Display */}
                      {message.error && (
                        <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold text-sm">Error Details</span>
                          </div>
                          <p className="text-red-200 text-sm">{message.error}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Data Visualization */}
                {message.data && !isWelcome && renderDataVisualization(message.data, message.id)}
                
                {/* Timestamp */}
                <div className={`flex items-center space-x-2 mt-3 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <Clock className="w-3 h-3" />
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.success !== undefined && (
                    <div className={`w-2 h-2 rounded-full ${message.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
        <div className="ml-4">
          <p className="text-white font-semibold">Initializing AI Assistant...</p>
          <p className="text-gray-400 text-sm">Loading capabilities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 z-40 flex flex-col"
          >
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">AI Assistant</h2>
                    <p className="text-xs text-gray-400">Intelligent ERP Helper</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-800/50 transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Tab Indicator */}
              <div className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${activeTab === 'system' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                <span className="text-sm font-medium text-gray-300">
                  {activeTab === 'system' ? 'System AI Active' : 'General AI Active'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-3 overflow-y-auto">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium transition-colors">Dashboard</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMessages([]);
                  fetchCapabilities();
                }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium transition-colors">New Chat</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <Download className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium transition-colors">Export Chat</span>
              </motion.button>
              
              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Settings</p>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="p-2 bg-gray-500/10 rounded-xl group-hover:bg-gray-500/20 transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white font-medium transition-colors">Preferences</span>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="p-2 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                    <HelpCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white font-medium transition-colors">Help & Support</span>
                </motion.button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>v2.1.0</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span>Online</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 p-3 bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:bg-gray-700/80 transition-all shadow-lg"
      >
        <Menu className="w-5 h-5 text-gray-300" />
      </button>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
          <div className="p-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                  activeTab === 'system' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    AI Assistant
                  </h1>
                  <p className="text-gray-400 text-lg">
                    {activeTab === 'system' ? 'System Data Intelligence' : 'General AI Companion'}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{messages.filter(m => m.sender === 'user').length}</p>
                  <p className="text-xs text-gray-400">Queries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{messages.filter(m => m.success === true).length}</p>
                  <p className="text-xs text-gray-400">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{Object.keys(expandedSections).filter(key => expandedSections[key]).length}</p>
                  <p className="text-xs text-gray-400">Expanded</p>
                </div>
              </div>
            </motion.div>
            
            {/* Tabs */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('system')}
                className={`relative px-8 py-4 font-semibold flex items-center space-x-4 rounded-2xl transition-all duration-500 ${
                  activeTab === 'system' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/25' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 hover:bg-gray-800/70'
                }`}
              >
                <div className={`p-3 rounded-2xl ${activeTab === 'system' ? 'bg-white/10' : 'bg-gray-700/50'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">System AI</p>
                  <p className="text-xs opacity-75">ERP Data Intelligence</p>
                </div>
                {activeTab === 'system' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('general')}
                className={`relative px-8 py-4 font-semibold flex items-center space-x-4 rounded-2xl transition-all duration-500 ${
                  activeTab === 'general' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/25' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 hover:bg-gray-800/70'
                }`}
              >
                <div className={`p-3 rounded-2xl ${activeTab === 'general' ? 'bg-white/10' : 'bg-gray-700/50'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">General AI</p>
                  <p className="text-xs opacity-75">Universal Assistant</p>
                </div>
                {activeTab === 'general' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8" ref={messagesContainerRef}>
          <div className="max-w-6xl mx-auto">
            {messages.map(renderMessage)}
            
            {/* Loading Message */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex flex-row space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                    activeTab === 'system'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-block">
                      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl px-6 py-4 backdrop-blur-xl">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                          />
                          <span className="text-gray-300">Processing your request...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="sticky bottom-0 z-30 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${activeTab === 'system' ? 'about your business data' : 'me anything'}...`}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all backdrop-blur-xl"
                  rows={inputText.split('\n').length > 3 ? Math.min(inputText.split('\n').length, 6) : 3}
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  {inputText.trim() && (
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                      {inputText.length} chars
                    </span>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`p-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === 'system'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                } shadow-lg`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <Send className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Press</span>
                <kbd className="px-2 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50">Enter</kbd>
                <span>to send, </span>
                <kbd className="px-2 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50">Shift + Enter</kbd>
                <span>for new line</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'system' ? 'bg-purple-400' : 'bg-emerald-400'} animate-pulse`} />
                <span>{activeTab === 'system' ? 'System AI' : 'General AI'} Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIAssistant;