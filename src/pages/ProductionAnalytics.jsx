import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, PieChart, Calendar, Filter, Download, 
  AlertTriangle, TrendingUp, TrendingDown, Clock, Eye, Maximize2,
  ChevronDown, ChevronUp, Search, RefreshCw, Settings, Factory,
  Gauge, Package, AlertCircle, CheckCircle, XCircle, Info
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

// Recharts for proper data visualization
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Helper functions moved outside component
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  const statusColors = {
    'OVERLOADED': 'text-red-400',
    'HIGH_UTILIZATION': 'text-amber-400',
    'FUTURE_BOTTLENECK': 'text-amber-400',
    'AVAILABLE': 'text-emerald-400',
    'WORLD_CLASS': 'text-emerald-400',
    'GOOD': 'text-emerald-300',
    'FAIR': 'text-amber-400',
    'POOR': 'text-amber-500',
    'UNACCEPTABLE': 'text-red-400'
  };
  return statusColors[status] || 'text-gray-400';
};

const getSeverityBadge = (severity) => {
  const severityConfig = {
    'HIGH': { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High', icon: AlertCircle },
    'MEDIUM': { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Medium', icon: AlertTriangle },
    'LOW': { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Low', icon: Info }
  };
  return severityConfig[severity] || { color: 'text-gray-400', bg: 'bg-gray-500/10', label: severity, icon: Info };
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, valueFormatter = (value) => value }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-gray-300">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white" style={{ color: entry.color }}>
            {entry.name}: {valueFormatter(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ProductionAnalytics = () => {
  const [activeTab, setActiveTab] = useState('scheduling');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [expandedCards, setExpandedCards] = useState({});
  const [detailView, setDetailView] = useState(null);

  // Data states
  const [schedulingData, setSchedulingData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [oeeData, setOeeData] = useState([]);
  const [rejectionData, setRejectionData] = useState({});
  const [anomalyData, setAnomalyData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [dateRange, selectedEquipment, selectedProduct]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Format dates for API calls
      const startDate = dateRange.start;
      const endDate = dateRange.end;
      
      // Fetch all data in parallel with date parameters
      const [
        schedulingRes,
        capacityRes,
        oeeRes,
        rejectionRes,
        anomalyRes
      ] = await Promise.all([
        api.get(`planning/schedule-suggestions/?days_ahead=7`),
        api.get(`planning/capacity-analysis/?start_date=${startDate}&end_date=${endDate}`),
        api.get(`quality/oee-trends/?start_date=${startDate}&end_date=${endDate}`),
        api.get(`quality/rejection-analysis/?start_date=${startDate}&end_date=${endDate}`),
        api.get(`quality/anomalies/?start_date=${startDate}&end_date=${endDate}`)
      ]);
  
      setSchedulingData(schedulingRes.data.equipment_schedule || []);
      setCapacityData(capacityRes.data.equipment_analysis || []);
      setOeeData(oeeRes.data.equipment_trends || []);
      setRejectionData(rejectionRes.data || {});
      setAnomalyData(anomalyRes.data.anomalies || []);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar activeItem="production-analytics" />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-3 p-1 rounded-lg hover:bg-gray-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Factory className="w-5 h-5" />
              </button>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                >
                  Production Analytics
                </motion.h1>
                <p className="text-gray-400 text-sm mt-1">Monitor and optimize your manufacturing operations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAllData}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:block text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 md:px-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'scheduling', label: 'Scheduling', icon: Clock },
              { id: 'capacity', label: 'Capacity', icon: Gauge },
              { id: 'oee', label: 'OEE Trends', icon: TrendingUp },
              { id: 'rejections', label: 'Rejections', icon: XCircle },
              { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${activeTab === tab.id ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment</label>
                <select
                  value={selectedEquipment}
                  onChange={e => setSelectedEquipment(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Equipment</option>
                  {capacityData.map(equipment => (
                    <option key={equipment.equipment_code} value={equipment.equipment_code}>
                      {equipment.equipment_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Product</label>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Products</option>
                  {/* Would populate with actual products from API */}
                  <option value="prod-1">Product A</option>
                  <option value="prod-2">Product B</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={fetchAllData}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-all"
                >
                  <Filter className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedulingData.map(equipment => (
                  <div key={equipment.equipment_id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{equipment.equipment_name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(equipment.capacity_status)} ${getStatusColor(equipment.capacity_status).replace('text', 'bg')}/10`}>
                          {equipment.capacity_status ? equipment.capacity_status.replace('_', ' ') : 'Unknown'}
                        </div>
                        <button 
                          onClick={() => toggleCardExpansion(`sched-${equipment.equipment_id}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          {expandedCards[`sched-${equipment.equipment_id}`] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Utilization</p>
                        <p className="text-xl font-bold text-white">{equipment.current_utilization_pct}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Available Capacity</p>
                        <p className="text-xl font-bold text-white">{equipment.available_capacity_pct}%</p>
                      </div>
                    </div>
                    
                    {expandedCards[`sched-${equipment.equipment_id}`] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-4"
                      >
                        <div className="border-t border-gray-700/50 pt-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-3">Recommended Orders</h4>
                          <div className="space-y-3">
                            {equipment.recommended_orders.slice(0, 3).map(order => (
                              <div key={order.wo_number} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                                <div>
                                  <p className="text-sm font-medium text-white">WO-{order.wo_number}</p>
                                  <p className="text-xs text-gray-400">{order.product_sku}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-white">{order.quantity_planned} units</p>
                                  <p className="text-xs text-gray-400">{order.estimated_hours}h</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setDetailView({ type: 'scheduling', data: equipment })}
                          className="w-full flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm py-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full Schedule</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'capacity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capacityData.map(equipment => (
                  <div key={equipment.equipment_code} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{equipment.equipment_name}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(equipment.capacity_status)} ${getStatusColor(equipment.capacity_status).replace('text', 'bg')}/10`}>
                        {equipment.capacity_status.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400">Utilization</span>
                          <span className="text-sm font-medium text-white">{equipment.utilization_pct}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              equipment.utilization_pct > 85 ? 'bg-red-500' : 
                              equipment.utilization_pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(equipment.utilization_pct, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Efficiency</p>
                          <p className="text-xl font-bold text-white">{equipment.efficiency_pct}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Pending Demand</p>
                          <p className="text-xl font-bold text-white">{equipment.pending_demand_hours}h</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Actual Production</p>
                          <p className="text-lg font-semibold text-white">{equipment.actual_production}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Theoretical Capacity</p>
                          <p className="text-lg font-semibold text-white">{equipment.theoretical_capacity}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setDetailView({ type: 'capacity', data: equipment })}
                      className="w-full mt-4 flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm py-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Detailed Analysis</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'oee' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {oeeData.map(equipment => (
                  <div key={equipment.equipment_id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">{equipment.equipment_name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(equipment.performance_rating)} ${getStatusColor(equipment.performance_rating).replace('text', 'bg')}/10`}>
                          {equipment.performance_rating.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">{equipment.avg_oee}%</div>
                        <div className="text-xs text-gray-400">OEE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-white mb-1">{equipment.avg_availability}%</div>
                        <div className="text-xs text-gray-400">Availability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-white mb-1">{equipment.avg_performance}%</div>
                        <div className="text-xs text-gray-400">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-white mb-1">{equipment.avg_quality}%</div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </div>
                    </div>
                    
                    <div className="h-40 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={equipment.daily_oee_data.filter(day => day.hours_operated > 0)}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => formatDate(value)}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                          <Area 
                            type="monotone" 
                            dataKey="oee" 
                            stroke="#8B5CF6" 
                            fill="url(#colorOee)" 
                            strokeWidth={2}
                            name="OEE"
                          />
                          <defs>
                            <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <button 
                      onClick={() => setDetailView({ type: 'oee', data: equipment })}
                      className="w-full flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm py-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View OEE Trends</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rejections' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Rejection Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-rose-400 mb-1">{rejectionData.summary?.total_rejected_qty || 0}</div>
                      <div className="text-sm text-gray-400">Total Rejected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{rejectionData.summary?.avg_daily_rejections?.toFixed(1) || 0}</div>
                      <div className="text-sm text-gray-400">Avg Daily</div>
                    </div>
                  </div>
                  
                  <div className="h-40 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={rejectionData.daily_trend || []}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => formatDate(value)}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                        <Line 
                          type="monotone" 
                          dataKey="rejection_rate_pct" 
                          stroke="#F43F5E" 
                          strokeWidth={2}
                          name="Rejection Rate"
                          dot={{ fill: '#F43F5E', r: 4 }}
                          activeDot={{ r: 6, fill: '#F43F5E' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Top Problem Products */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Top Problem Products</h3>
                  
                  <div className="space-y-4">
                    {rejectionData.top_problem_products?.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{product[1].product_name}</p>
                          <p className="text-xs text-gray-400">{product[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-rose-400">{product[1].rejection_rate_pct.toFixed(1)}%</p>
                          <p className="text-xs text-gray-400">{product[1].total_rejected} rejected</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setDetailView({ type: 'rejections', data: rejectionData })}
                className="w-full flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm py-4"
              >
                <Eye className="w-4 h-4" />
                <span>View Complete Rejection Analysis</span>
              </button>
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Production Anomalies</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{anomalyData.length} detected</span>
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-full">
                      {anomalyData.filter(a => a.severity === 'HIGH').length} Critical
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Anomaly Type Breakdown */}
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-sm text-gray-400 mb-4">By Type</h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={Object.entries(
                              anomalyData.reduce((acc, anomaly) => {
                                acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {Object.entries(
                              anomalyData.reduce((acc, anomaly) => {
                                acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
                                return acc;
                              }, {})
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981'][index % 3]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Severity Breakdown */}
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-sm text-gray-400 mb-4">By Severity</h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(
                            anomalyData.reduce((acc, anomaly) => {
                              acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([name, value]) => ({ name, value }))}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <Tooltip />
                          <Bar 
                            dataKey="value" 
                            fill="#8B5CF6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {anomalyData.slice(0, 5).map((anomaly, index) => {
                    const severityBadge = getSeverityBadge(anomaly.severity);
                    const SeverityIcon = severityBadge.icon;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="flex items-start justify-between p-4 bg-gray-800/30 rounded-xl cursor-pointer hover:bg-gray-700/30 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setDetailView({ type: 'anomaly', data: anomaly })}
                      >
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${severityBadge.bg} mt-1`}>
                            <SeverityIcon className={`w-4 h-4 ${severityBadge.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white capitalize">{anomaly.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400">{anomaly.equipment} • {new Date().toLocaleString()}</p>
                            <p className="text-sm text-gray-300 mt-1 line-clamp-1">
                              {anomaly.type === 'LOW_PRODUCTION' && 
                                `Production dropped to ${anomaly.actual} units (expected ${anomaly.expected})`}
                              {anomaly.type === 'HIGH_REJECTION' && 
                                `Rejection rate increased to ${anomaly.rejection_rate}%`}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${severityBadge.bg} ${severityBadge.color}`}>
                          {severityBadge.label}
                        </span>
                      </motion.div>
                    );
                  })}
                  
                  {anomalyData.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                      <p className="text-gray-400">No anomalies detected in the selected period</p>
                    </div>
                  )}
                </div>
                
                {anomalyData.length > 5 && (
                  <button 
                    onClick={() => setDetailView({ type: 'anomalies', data: anomalyData })}
                    className="w-full mt-6 flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 text-sm py-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View All Anomalies</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailView && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">
                  {detailView.type === 'scheduling' && 'Equipment Schedule Details'}
                  {detailView.type === 'capacity' && 'Capacity Analysis Details'}
                  {detailView.type === 'oee' && 'OEE Trend Analysis'}
                  {detailView.type === 'rejections' && 'Complete Rejection Analysis'}
                  {detailView.type === 'anomaly' && 'Anomaly Details'}
                  {detailView.type === 'anomalies' && 'All Anomalies'}
                </h3>
                <button 
                  onClick={() => setDetailView(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {detailView.type === 'rejections' && (
                  <RejectionAnalysisDetail data={detailView.data} />
                )}
                
                {detailView.type === 'anomaly' && (
                  <AnomalyDetail data={detailView.data} />
                )}
                
                {detailView.type === 'anomalies' && (
                  <AllAnomaliesDetail data={detailView.data} />
                )}
                
                {detailView.type === 'scheduling' && (
                  <SchedulingDetail data={detailView.data} />
                )}
                
                {detailView.type === 'capacity' && (
                  <CapacityDetail data={detailView.data} />
                )}
                
                {detailView.type === 'oee' && (
                  <OeeDetail data={detailView.data} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Detail Components
const RejectionAnalysisDetail = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Period</p>
          <p className="text-white font-medium">
            {formatDate(data.analysis_period?.start_date)} - {formatDate(data.analysis_period?.end_date)}
          </p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Total Rejections</p>
          <p className="text-rose-400 font-bold text-xl">{data.summary?.total_rejected_qty}</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Avg Daily</p>
          <p className="text-white font-bold text-xl">{data.summary?.avg_daily_rejections?.toFixed(1)}</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Entries</p>
          <p className="text-white font-bold text-xl">{data.summary?.total_rejection_entries}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Daily Rejection Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.daily_trend || []}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total_rejected" 
                  fill="#F43F5E" 
                  name="Rejected Quantity"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Rejection Rate Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.daily_trend || []}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                <Line 
                  type="monotone" 
                  dataKey="rejection_rate_pct" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Rejection Rate"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700/30 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-4">Top Problem Products</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-600">
                <th className="pb-2">Product</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2 text-right">Produced</th>
                <th className="pb-2 text-right">Rejected</th>
                <th className="pb-2 text-right">Rejection Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.top_problem_products?.map((product, index) => (
                <tr key={index} className="border-b border-gray-700/50 last:border-0">
                  <td className="py-3 text-white">{product[1].product_name}</td>
                  <td className="py-3 text-gray-400">{product[0]}</td>
                  <td className="py-3 text-right text-white">{product[1].total_produced}</td>
                  <td className="py-3 text-right text-rose-400">{product[1].total_rejected}</td>
                  <td className="py-3 text-right text-white">{product[1].rejection_rate_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Equipment Performance</h4>
          <div className="space-y-3">
            {data.equipment_performance && Object.entries(data.equipment_performance).map(([equipment, stats], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{equipment}</span>
                <span className="text-sm text-rose-400">{stats.total_rejected} rejected</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Operator Performance</h4>
          <div className="space-y-3">
            {data.operator_performance && Object.entries(data.operator_performance).map(([operator, stats], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{operator}</span>
                <span className="text-sm text-rose-400">{stats.total_rejected} rejected</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnomalyDetail = ({ data }) => {
  const severityBadge = getSeverityBadge(data.severity);
  const SeverityIcon = severityBadge.icon;
  
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${severityBadge.bg}`}>
          <SeverityIcon className={`w-6 h-6 ${severityBadge.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white capitalize">{data.type.replace('_', ' ')}</h3>
          <p className="text-gray-400">{data.equipment} • Hour {data.hour} • {formatDateTime(new Date().toISOString())}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${severityBadge.bg} ${severityBadge.color}`}>
          {severityBadge.label} Severity
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Equipment</span>
              <span className="text-white">{data.equipment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hour</span>
              <span className="text-white">{data.hour}:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white capitalize">{data.type.replace('_', ' ')}</span>
            </div>
            {data.type === 'LOW_PRODUCTION' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expected</span>
                  <span className="text-white">{data.expected} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Actual</span>
                  <span className="text-rose-400">{data.actual} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deviation</span>
                  <span className="text-rose-400">-{(((data.expected - data.actual) / data.expected) * 100).toFixed(1)}%</span>
                </div>
              </>
            )}
            {data.type === 'HIGH_REJECTION' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Rejection Rate</span>
                <span className="text-rose-400">{data.rejection_rate}%</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Recommendation</h4>
          <p className="text-white">{data.suggestion}</p>
        </div>
      </div>
      
      <div className="bg-gray-700/30 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-4">Historical Context</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { hour: 8, value: 25 },
                { hour: 9, value: 28 },
                { hour: 10, value: 32 },
                { hour: 11, value: 50 },
                { hour: 12, value: 35 },
                { hour: 13, value: 30 },
              ]}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value}%`} />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Rejection Rate"
                dot={{ fill: '#8B5CF6', r: 4 }}
                activeDot={{ r: 6, fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const AllAnomaliesDetail = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">All Detected Anomalies</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">{data.length} total anomalies</span>
          <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-full">
            {data.filter(a => a.severity === 'HIGH').length} Critical
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((anomaly, index) => {
          const severityBadge = getSeverityBadge(anomaly.severity);
          const SeverityIcon = severityBadge.icon;
          
          return (
            <motion.div 
              key={index} 
              className="flex items-start justify-between p-4 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-600/30 transition-colors"
              whileHover={{ scale: 1.01 }}
              onClick={() => setDetailView({ type: 'anomaly', data: anomaly })}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${severityBadge.bg} mt-1`}>
                  <SeverityIcon className={`w-4 h-4 ${severityBadge.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white capitalize">{anomaly.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{anomaly.equipment} • Hour {anomaly.hour}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {anomaly.type === 'LOW_PRODUCTION' && 
                      `Production dropped to ${anomaly.actual} units (expected ${anomaly.expected})`}
                    {anomaly.type === 'HIGH_REJECTION' && 
                      `Rejection rate increased to ${anomaly.rejection_rate}%`}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${severityBadge.bg} ${severityBadge.color}`}>
                {severityBadge.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const SchedulingDetail = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Equipment</p>
          <p className="text-white font-medium">{data.equipment_name}</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Utilization</p>
          <p className="text-white font-bold text-xl">{data.current_utilization_pct}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Available Capacity</p>
          <p className="text-white font-bold text-xl">{data.available_capacity_pct}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Recommended Orders</p>
          <p className="text-white font-bold text-xl">{data.recommended_orders?.length || 0}</p>
        </div>
      </div>
      
      <div className="bg-gray-700/30 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-4">Recommended Production Schedule</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-600">
                <th className="pb-2">Work Order</th>
                <th className="pb-2">Product</th>
                <th className="pb-2 text-right">Quantity</th>
                <th className="pb-2 text-right">Due Date</th>
                <th className="pb-2 text-right">Hours Needed</th>
                <th className="pb-2 text-right">Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.recommended_orders?.map((order, index) => (
                <tr key={index} className="border-b border-gray-700/50 last:border-0">
                  <td className="py-3 text-white">{order.wo_number}</td>
                  <td className="py-3 text-gray-400">{order.product_sku}</td>
                  <td className="py-3 text-right text-white">{order.quantity_planned}</td>
                  <td className="py-3 text-right text-white">{formatDate(order.due_date)}</td>
                  <td className="py-3 text-right text-white">{order.estimated_hours}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.priority <= 3 ? 'bg-rose-500/10 text-rose-400' : 
                      order.priority <= 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {order.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CapacityDetail = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Equipment</p>
          <p className="text-white font-medium">{data.equipment_name}</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Utilization</p>
          <p className="text-white font-bold text-xl">{data.utilization_pct}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Efficiency</p>
          <p className="text-white font-bold text-xl">{data.efficiency_pct}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Status</p>
          <p className={`font-bold text-xl ${getStatusColor(data.capacity_status)}`}>
            {data.capacity_status.replace('_', ' ')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Production Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Actual Production</span>
                <span className="text-sm font-medium text-white">{data.actual_production}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${(data.actual_production / data.theoretical_capacity) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Theoretical Capacity</span>
                <span className="text-sm font-medium text-white">{data.theoretical_capacity}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Pending Demand</span>
                <span className="text-sm font-medium text-white">{data.pending_demand_hours} hours</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${Math.min(data.pending_demand_hours / 10 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Performance Indicators</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-600/30 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{data.utilization_pct}%</div>
              <div className="text-xs text-gray-400">Utilization</div>
            </div>
            <div className="text-center p-3 bg-gray-600/30 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{data.efficiency_pct}%</div>
              <div className="text-xs text-gray-400">Efficiency</div>
            </div>
            <div className="text-center p-3 bg-gray-600/30 rounded-xl">
              <div className="text-xl font-semibold text-white mb-1">{data.actual_production}</div>
              <div className="text-xs text-gray-400">Actual Output</div>
            </div>
            <div className="text-center p-3 bg-gray-600/30 rounded-xl">
              <div className="text-xl font-semibold text-white mb-1">{data.theoretical_capacity}</div>
              <div className="text-xs text-gray-400">Theoretical Max</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OeeDetail = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Equipment</p>
          <p className="text-white font-medium">{data.equipment_name}</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">OEE</p>
          <p className="text-white font-bold text-xl">{data.avg_oee}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Availability</p>
          <p className="text-white font-bold text-xl">{data.avg_availability}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Performance</p>
          <p className="text-white font-bold text-xl">{data.avg_performance}%</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Quality</p>
          <p className="text-white font-bold text-xl">{data.avg_quality}%</p>
        </div>
      </div>
      
      <div className="bg-gray-700/30 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-4">OEE Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.daily_oee_data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value)}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
              <Area 
                type="monotone" 
                dataKey="oee" 
                stroke="#8B5CF6" 
                fill="url(#colorOee)" 
                strokeWidth={2}
                name="OEE"
              />
              <defs>
                <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Availability Trend</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.daily_oee_data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                <Line 
                  type="monotone" 
                  dataKey="availability" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Availability"
                  dot={{ fill: '#10B981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Performance Trend</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.daily_oee_data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Performance"
                  dot={{ fill: '#3B82F6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-4">Quality Trend</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.daily_oee_data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip valueFormatter={(value) => `${value.toFixed(1)}%`} />} />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Quality"
                  dot={{ fill: '#8B5CF6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionAnalytics;