import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Factory, Users, 
  AlertTriangle, CheckCircle, Clock, Activity, BarChart3, PieChart,
  Zap, Target, RefreshCw, Calendar, Settings, Bell, ArrowUpRight,
  ArrowDownRight, Minus, ChevronRight, Eye, EyeOff, Filter, Grid,
  List, ChevronDown, ExternalLink, Maximize2, X, Info, AlertCircle,
  Truck, Wrench, FileText, MapPin, Phone, Mail, CreditCard, Shield,
  Box, Cpu, Database, BarChart2, TrendingUp as TrendingUpIcon,
  ShoppingCart, ArrowRight, ArrowLeft, Play, Pause, StopCircle,
  ClipboardList, Calendar as CalendarIcon, PieChart as PieChartIcon,
  Layers, DollarSign as DollarSignIcon, AlertOctagon, Gauge, Search,
  Download, Upload, Send, UserCheck, Building, Hash, Percent, XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
         Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart,
         Scatter, ZAxis, Legend, ComposedChart, ReferenceLine
} from 'recharts';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const BusinessDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [operationsData, setOperationsData] = useState(null);
  const [overdueOrders, setOverdueOrders] = useState([]);
  
  // Enhanced date range state
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState('all');
  const [alertsData, setAlertsData] = useState([]);

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  useEffect(() => {
    if (viewMode === 'analytics') {
      fetchAnalyticsData();
    } else if (viewMode === 'operations') {
      fetchOperationsData();
    }
  }, [viewMode, dateRange]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchWorkOrders(),
        fetchOverdueOrders(), // Add this
        fetchAlerts()
      ]);
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 800);
    }
  }, [dateRange]);

  const fetchOverdueOrders = async () => {
    try {
      const res = await api.get('operations/overdue-work-orders/', {
        headers: { Accept: 'application/json' }
      });
      setOverdueOrders(res.data.orders || []);
    } catch (err) {
      console.error('Overdue orders fetch error:', err);
    }
  };
  
  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      
      const res = await api.get(`business-overview/?${params}`, {
        headers: { Accept: 'application/json' }
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      throw err;
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const res = await api.get('api/work-orders/', {
        headers: { Accept: 'application/json' }
      });
      setWorkOrders(res.data.results || []);
    } catch (err) {
      console.error('Work orders fetch error:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('dashboard/alerts/', {
        headers: { Accept: 'application/json' }
      });
      setAlertsData(res.data.alerts || []);
    } catch (err) {
      console.error('Alerts fetch error:', err);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      const [oeeRes, abcRes, capacityRes, anomaliesRes] = await Promise.all([
        api.get(`quality/oee-trends/?${params}`),
        api.get('inventory/abc-analysis/'),
        api.get(`planning/capacity-analysis/?${params}`),
        api.get(`quality/anomalies/?${params}`)
      ]);
      
      setAnalyticsData({
        oeeTrends: oeeRes.data,
        abcAnalysis: abcRes.data,
        capacityAnalysis: capacityRes.data,
        anomalies: anomaliesRes.data
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
  };

  const fetchOperationsData = async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      const [scheduleRes, reorderRes, rejectionRes] = await Promise.all([
        api.get(`planning/schedule-suggestions/?${params}`),
        api.get('inventory/reorder-suggestions/'),
        api.get(`quality/rejection-analysis/?${params}`)
      ]);
      
      setOperationsData({
        scheduleSuggestions: scheduleRes.data,
        reorderSuggestions: reorderRes.data,
        rejectionAnalysis: rejectionRes.data
      });
    } catch (err) {
      console.error('Operations fetch error:', err);
    }
  };

  // Utility functions
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'HIGH': 
      case 'CRITICAL': return 'from-red-500 to-red-600 text-red-100';
      case 'MEDIUM': return 'from-amber-500 to-amber-600 text-amber-100';
      case 'LOW': return 'from-green-500 to-green-600 text-green-100';
      default: return 'from-blue-500 to-blue-600 text-blue-100';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 3) return 'from-red-500 to-red-600 text-red-100';
    if (priority <= 6) return 'from-amber-500 to-amber-600 text-amber-100';
    return 'from-green-500 to-green-600 text-green-100';
  };

  const getOverdueWorkOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    return workOrders.filter(wo => 
      wo.due_date < today && 
      !['completed', 'cancelled'].includes(wo.status)
    );
  };

  const getUpcomingWorkOrders = () => {
    // Use the data from dashboard API instead of workOrders state
    const upcomingOrdersData = dashboardData?.upcoming_work_orders?.orders || [];
    
    if (!upcomingOrdersData || upcomingOrdersData.length === 0) {
      return [];
    }
    
    // Process the data to add urgency information
    const today = new Date();
    
    return upcomingOrdersData.map(order => {
      const dueDate = new Date(order.due_date);
      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      const urgency = daysUntilDue <= 1 ? 'HIGH' : daysUntilDue <= 3 ? 'MEDIUM' : 'LOW';
      
      return {
        ...order,
        days_until_due: daysUntilDue,
        urgency: urgency
      };
    });
  };
  
  // Enhanced Components
  const DateRangePicker = () => (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        <span>{formatDate(dateRange.start_date)} - {formatDate(dateRange.end_date)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl z-50 min-w-80"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Select Date Range</h4>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 90 days', days: 90 },
                  { label: 'This Year', days: 365 }
                ].map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => {
                      const end = new Date().toISOString().split('T')[0];
                      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setDateRange({ start_date: start, end_date: end });
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDatePicker(false);
                    fetchAllData();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-sm text-white transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const KPICard = ({ title, value, subtitle, icon: Icon, trend, color, onClick, loading: cardLoading }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-6 cursor-pointer group shadow-2xl`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-white/90" />
          {trend && (
            <div className="flex items-center text-white/80 text-sm">
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        
        {cardLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        ) : (
          <>
            <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
          </>
        )}
      </div>
      
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4 text-white/60" />
      </div>
    </motion.div>
  );

  const AlertsWidget = () => (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Bell className="w-5 h-5 mr-2 text-amber-400" />
          Live Alerts
        </h3>
        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">
          {alertsData.filter(a => a.severity === 'HIGH').length} Critical
        </span>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alertsData.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        ) : (
          alertsData.slice(0, 5).map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border ${
                alert.severity === 'HIGH' ? 'bg-red-500/10 border-red-500/20' :
                alert.severity === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-white text-sm">{alert.title}</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{alert.message}</p>
              <p className="text-gray-500 text-xs mt-1">{formatDateTime(alert.timestamp)}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const OverdueWorkOrdersWidget = () => {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Overdue Work Orders
          </h3>
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">
            {overdueOrders.length} Overdue
          </span>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {overdueOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No overdue work orders</p>
            </div>
          ) : (
            overdueOrders.map((order, index) => (
              <motion.div
                key={order.wo_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-4 h-4 text-red-400" />
                    <span className="font-bold text-lg text-white">{order.wo_number}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-red-400">
                      Overdue by {order.days_overdue} days
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Product:</span>
                    <span className="text-white font-medium">{order.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white">{formatNumber(order.quantity_planned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">{formatNumber(order.quantity_completed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'released' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.priority <= 3 ? 'bg-red-500/20 text-red-400' :
                      order.priority <= 6 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {order.priority}/10
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  const UpcomingWorkOrdersWidget = () => {
    const upcomingOrders = getUpcomingWorkOrders();
    
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-amber-400" />
            Upcoming Work Orders
          </h3>
          <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-sm">
            {upcomingOrders.length} upcoming
          </span>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {upcomingOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming work orders</p>
            </div>
          ) : (
            upcomingOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order.wo_number || order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${getUrgencyColor(order.urgency)} rounded-2xl p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-5 h-5" />
                    <span className="font-bold text-lg">{order.wo_number}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">Due in {order.days_until_due} days</div>
                    <div className="text-xs opacity-60">{order.urgency} Priority</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Product:</span>
                    <span className="font-medium">{order.product_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Quantity:</span>
                    <span className="font-medium">{formatNumber(order.quantity_planned)} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Status:</span>
                    <span className="font-medium">{order.status?.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  {order.cost_center && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Cost Center:</span>
                      <span className="font-medium">{order.cost_center}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };
  const ProductionAnomaliesWidget = () => {
    const anomalies = analyticsData?.anomalies?.anomalies || [];
    const criticalAnomalies = anomalies.filter(a => a.severity === 'HIGH');
    
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <AlertOctagon className="w-5 h-5 mr-2 text-red-400" />
            Production Anomalies
          </h3>
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">
            {criticalAnomalies.length} Critical
          </span>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {criticalAnomalies.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No critical anomalies detected</p>
            </div>
          ) : (
            criticalAnomalies.slice(0, 3).map((anomaly, index) => (
              <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-white text-sm">{anomaly.equipment || 'Unknown Equipment'}</p>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Critical</span>
                </div>
                <p className="text-red-300 text-sm">{anomaly.type.replace('_', ' ')}</p>
                <p className="text-red-400 text-xs mt-1">{anomaly.suggestion}</p>
                {anomaly.expected && anomaly.actual && (
                  <div className="mt-2 text-xs text-red-500">
                    Expected: {anomaly.expected}, Actual: {anomaly.actual}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Enhanced Analytics Components
  const ProductionTrendChart = () => {
    // Use real data from dashboard instead of generating mock data
    const productionTrends = dashboardData?.production_trends?.daily_data || [];
    
    if (productionTrends.length === 0) return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No production data available</p>
        </div>
      </div>
    );
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={productionTrends}>
          <defs>
            <linearGradient id="produced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="rejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#F9FAFB'
            }} 
          />
          <Area type="monotone" dataKey="produced" stroke="#10B981" fill="url(#produced)" strokeWidth={2} />
          <Area type="monotone" dataKey="rejected" stroke="#EF4444" fill="url(#rejected)" strokeWidth={2} />
          {productionTrends[0]?.target && (
            <ReferenceLine y={productionTrends[0].target} stroke="#8B5CF6" strokeDasharray="3 3" label="Target" />
          )}
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  const QualityMetricsChart = () => {
    const qualityData = dashboardData?.production_summary;
    
    if (!qualityData) return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No quality data available</p>
        </div>
      </div>
    );

    const totalProduced = qualityData.total_produced || 0;
    const totalRejected = qualityData.total_rejected || 0;
    
    const data = [
      { name: 'Good Quality', value: totalProduced, color: '#10B981' },
      { name: 'Rejected', value: totalRejected, color: '#EF4444' }
    ];

    if (totalProduced === 0 && totalRejected === 0) return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No quality data available</p>
        </div>
      </div>
    );

    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatNumber(value)}
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }} 
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  const OEETrendChart = () => {
    if (!analyticsData?.oeeTrends?.equipment_trends) return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Gauge className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No OEE data available</p>
        </div>
      </div>
    );
    
    const equipmentData = analyticsData.oeeTrends.equipment_trends[0];
    if (!equipmentData?.daily_oee_data) return null;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={equipmentData.daily_oee_data}>
          <defs>
            <linearGradient id="oee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#F9FAFB'
            }} 
          />
          <Area type="monotone" dataKey="oee" stroke="#8884d8" fill="url(#oee)" strokeWidth={2} />
          <Line type="monotone" dataKey="availability" stroke="#10B981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="performance" stroke="#F59E0B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="quality" stroke="#EF4444" strokeWidth={2} dot={false} />
          <ReferenceLine y={85} stroke="#10B981" strokeDasharray="3 3" label="World Class" />
          <ReferenceLine y={65} stroke="#F59E0B" strokeDasharray="3 3" label="Good" />
          <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="3 3" label="Poor" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const ABCAnalysisChart = () => {
    if (!analyticsData?.abcAnalysis?.classification_summary) return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No ABC analysis data available</p>
        </div>
      </div>
    );
    
    const data = [
      { name: 'A Items', value: analyticsData.abcAnalysis.classification_summary.A.value, color: '#EF4444', items: analyticsData.abcAnalysis.classification_summary.A.items },
      { name: 'B Items', value: analyticsData.abcAnalysis.classification_summary.B.value, color: '#F59E0B', items: analyticsData.abcAnalysis.classification_summary.B.items },
      { name: 'C Items', value: analyticsData.abcAnalysis.classification_summary.C.value, color: '#10B981', items: analyticsData.abcAnalysis.classification_summary.C.items }
    ];
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent, items }) => `${name} ${(percent * 100).toFixed(0)}% (${items} items)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }} 
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  const CapacityUtilizationChart = () => {
    if (!analyticsData?.capacityAnalysis?.equipment_analysis) return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Cpu className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No capacity data available</p>
        </div>
      </div>
    );
    
    const data = analyticsData.capacityAnalysis.equipment_analysis
      .filter(item => item.utilization_pct > 0)
      .sort((a, b) => b.utilization_pct - a.utilization_pct)
      .slice(0, 8);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
          <YAxis 
            type="category" 
            dataKey="equipment_name" 
            stroke="#9CA3AF" 
            width={100}
            tick={{ fontSize: 11 }}
          />
          <Tooltip 
            formatter={(value) => `${value.toFixed(1)}%`}
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }} 
          />
          <Bar dataKey="utilization_pct" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.utilization_pct > 90 ? '#EF4444' : 
                  entry.utilization_pct > 75 ? '#F59E0B' : 
                  entry.utilization_pct > 50 ? '#10B981' : '#6B7280'
                } 
              />
            ))}
          </Bar>
          <ReferenceLine x={85} stroke="#F59E0B" strokeDasharray="3 3" />
          <ReferenceLine x={95} stroke="#EF4444" strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const FinancialTrendChart = () => {
    // Use real data from dashboard
    const financialTrends = dashboardData?.financial_trends?.period_data || [];
    
    if (financialTrends.length === 0) return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No financial trend data available</p>
        </div>
      </div>
    );
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={financialTrends}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#F9FAFB'
            }} 
          />
          <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revenue)" strokeWidth={2} />
          <Area type="monotone" dataKey="profit" stroke="#8B5CF6" fill="url(#profit)" strokeWidth={2} />
          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const ViewModeToggle = () => (
    <div className="flex items-center bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
      {[
        { key: 'overview', label: 'Overview', icon: Grid },
        { key: 'kpis', label: 'KPIs', icon: Target },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        { key: 'operations', label: 'Operations', icon: Factory }
      ].map(({ key, label, icon: Icon }) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode(key)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === key
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </motion.button>
      ))}
    </div>
  );

  // Operations Components
  const ScheduleSuggestions = () => {
    if (!operationsData?.scheduleSuggestions?.equipment_schedule) return (
      <div className="text-center py-4 text-gray-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No schedule suggestions available</p>
      </div>
    );
    
    return (
      <div className="space-y-4">
        {operationsData.scheduleSuggestions.equipment_schedule.slice(0, 3).map((equipment, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{equipment.equipment_name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                equipment.current_utilization_pct > 85 ? 'bg-red-500/20 text-red-400' :
                equipment.current_utilization_pct > 70 ? 'bg-amber-500/20 text-amber-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {equipment.current_utilization_pct}% utilized
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
              <span>Available Capacity: {equipment.available_capacity_pct}%</span>
              <span>Capacity/Hr: {equipment.capacity_per_hour}</span>
            </div>
            
            {equipment.recommended_orders?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Recommended Orders:</p>
                {equipment.recommended_orders.slice(0, 2).map((order, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-gray-900/50 p-3 rounded">
                    <div>
                      <span className="font-medium text-white">{order.wo_number}</span>
                      <p className="text-gray-400">{order.product_sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white">{order.estimated_hours}h</span>
                      <span className={`block px-2 py-1 rounded mt-1 ${
                        order.urgency_score > 80 ? 'bg-red-500/20 text-red-400' : 
                        order.urgency_score > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.urgency_score}% urgent
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No orders recommended</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const ReorderSuggestions = () => {
    if (!operationsData?.reorderSuggestions?.suggestions) return (
      <div className="text-center py-4 text-gray-500">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No reorder suggestions available</p>
      </div>
    );
    
    const criticalItems = operationsData.reorderSuggestions.suggestions
      .filter(item => item.urgency === 'HIGH')
      .slice(0, 5);
    
    if (criticalItems.length === 0) return (
      <div className="text-center py-4 text-gray-500">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No critical reorder suggestions</p>
      </div>
    );
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Total Investment Required:</span>
          <span className="font-semibold text-white">
            {formatCurrency(operationsData.reorderSuggestions.total_investment_required)}
          </span>
        </div>
        
        {criticalItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-white">{item.product_name || item.sku}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-red-400">
                <span>Stock: {item.current_stock}</span>
                <span>•</span>
                <span>Reorder: {item.recommended_quantity}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{formatCurrency(item.estimated_cost)}</p>
              <p className="text-xs text-red-400 mt-1">Critical</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const RejectionAnalysisWidget = () => {
    if (!operationsData?.rejectionAnalysis) return (
      <div className="text-center py-4 text-gray-500">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No rejection analysis available</p>
      </div>
    );

    const topProblems = operationsData.rejectionAnalysis.top_problem_products?.slice(0, 3) || [];

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {operationsData.rejectionAnalysis.summary?.total_rejected_qty || 0}
            </p>
            <p className="text-sm text-gray-400">Total Rejected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">
              {operationsData.rejectionAnalysis.summary?.avg_daily_rejections?.toFixed(0) || 0}
            </p>
            <p className="text-sm text-gray-400">Daily Average</p>
          </div>
        </div>

        {topProblems.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-400 mb-2">Top Problem Products:</h5>
            {topProblems.map(([sku, data], index) => (
              <div key={sku} className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-2">
                <div>
                  <p className="font-medium text-white text-sm">{data.product_name}</p>
                  <p className="text-xs text-amber-400">{sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{data.rejection_rate_pct?.toFixed(1)}%</p>
                  <p className="text-xs text-amber-400">{data.total_rejected} rejected</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Loading and Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
        <div className="ml-4 text-white">
          <p className="text-lg font-medium">Loading Dashboard...</p>
          <p className="text-sm text-gray-400">Fetching business intelligence data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400 max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchAllData}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Retry Loading
            </button>
            <p className="text-sm text-gray-400">
              Check your API connection and try again
            </p>
          </div>
        </div>
        </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      {/* Sidebar would go here */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between p-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
              >
                Business Intelligence Dashboard
              </motion.h1>
              <p className="text-gray-400 mt-1">
                Period: {formatDate(dateRange.start_date)} to {formatDate(dateRange.end_date)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <DateRangePicker />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAllData}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>
          
          <div className="px-6 pb-4">
            <ViewModeToggle />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Revenue"
                    value={formatCurrency(dashboardData?.financial_highlights?.revenue)}
                    subtitle={`Net Profit: ${formatCurrency(dashboardData?.financial_highlights?.net_profit)}`}
                    icon={DollarSign}
                    color="from-emerald-500 to-emerald-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Production Output"
                    value={formatNumber(dashboardData?.production_summary?.total_produced)}
                    subtitle={`${dashboardData?.production_summary?.completed_work_orders || 0} orders completed`}
                    icon={Factory}
                    color="from-blue-500 to-blue-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Quality Rate"
                    value={`${(100 - (dashboardData?.quality_metrics?.rejection_rate || 0)).toFixed(1)}%`}
                    subtitle={`${formatNumber(dashboardData?.quality_metrics?.total_rejected)} rejected`}
                    icon={Shield}
                    color="from-purple-500 to-purple-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Inventory Value"
                    value={formatCurrency(dashboardData?.inventory_status?.total_inventory_value)}
                    subtitle={`${dashboardData?.inventory_status?.total_items || 0} items tracked`}
                    icon={Package}
                    color="from-amber-500 to-amber-600"
                    loading={loading}
                  />
                </div>

                {/* Additional KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="OEE"
                    value={`${dashboardData?.key_performance_indicators?.overall_equipment_effectiveness?.toFixed(1) || '0'}%`}
                    subtitle="Overall Equipment Effectiveness"
                    icon={Gauge}
                    color="from-indigo-500 to-indigo-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="On-Time Delivery"
                    value={`${dashboardData?.key_performance_indicators?.on_time_delivery_rate?.toFixed(1) || '0'}%`}
                    subtitle="Delivery Performance"
                    icon={Truck}
                    color="from-cyan-500 to-cyan-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Low Stock Items"
                    value={dashboardData?.inventory_status?.low_stock_items_count || 0}
                    subtitle="Requiring attention"
                    icon={AlertOctagon}
                    color="from-rose-500 to-rose-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Active Equipment"
                    value={dashboardData?.equipment_status?.total_equipment || 0}
                    subtitle="In operation"
                    icon={Cpu}
                    color="from-violet-500 to-violet-600"
                    loading={loading}
                  />
                </div>

                {/* Alerts and Overdue Work Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AlertsWidget />
                  <OverdueWorkOrdersWidget />
                </div>

                {/* Charts and Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Production Trend */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                      Production Trends
                    </h3>
                    <ProductionTrendChart />
                  </div>

                  {/* Quality Overview */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-emerald-400" />
                      Quality Distribution
                    </h3>
                    <QualityMetricsChart />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatNumber(dashboardData?.production_summary?.total_produced)}
                        </p>
                        <p className="text-sm text-gray-400">Good Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">
                          {formatNumber(dashboardData?.production_summary?.total_rejected)}
                        </p>
                        <p className="text-sm text-gray-400">Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Work Orders and Financial Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UpcomingWorkOrdersWidget />
                  
                  {/* Financial Trends */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <TrendingUpIcon className="w-5 h-5 mr-2 text-emerald-400" />
                      Financial Trends
                    </h3>
                    <FinancialTrendChart />
                  </div>
                </div>

                {/* Equipment Status */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                    Equipment Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData?.equipment_status?.equipment_details?.slice(0, 6).map((equipment, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{equipment.equipment_name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            equipment.maintenance_status === 'MAINTENANCE_NEEDED' ? 'bg-red-500/20 text-red-400' :
                            equipment.maintenance_status === 'MAINTENANCE_SOON' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {equipment.maintenance_status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Recent Production: {formatNumber(equipment.recent_production)} units</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Status: {equipment.status}</span>
                          {equipment.next_maintenance && (
                            <span>Next Maint: {formatDate(equipment.next_maintenance)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'kpis' && (
              <motion.div
                key="kpis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="OEE"
                    value={`${dashboardData?.key_performance_indicators?.overall_equipment_effectiveness?.toFixed(1) || '0'}%`}
                    subtitle="Overall Equipment Effectiveness"
                    icon={Gauge}
                    color="from-indigo-500 to-indigo-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="On-Time Delivery"
                    value={`${dashboardData?.key_performance_indicators?.on_time_delivery_rate?.toFixed(1) || '0'}%`}
                    subtitle="Delivery Performance"
                    icon={Truck}
                    color="from-cyan-500 to-cyan-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Quality Rate"
                    value={`${(100 - (dashboardData?.key_performance_indicators?.rejection_rate || 0)).toFixed(1)}%`}
                    subtitle="Production Quality"
                    icon={Shield}
                    color="from-purple-500 to-purple-600"
                    loading={loading}
                  />
                  
                  <KPICard
                    title="Capacity Utilization"
                    value={`${dashboardData?.production_summary?.avg_efficiency?.toFixed(1) || '0'}%`}
                    subtitle="Production Efficiency"
                    icon={TrendingUpIcon}
                    color="from-emerald-500 to-emerald-600"
                    loading={loading}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Financial KPIs */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <DollarSignIcon className="w-5 h-5 mr-2 text-emerald-400" />
                      Financial Performance
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Revenue</span>
                        <span className="font-semibold text-white">{formatCurrency(dashboardData?.financial_highlights?.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gross Profit</span>
                        <span className="font-semibold text-white">{formatCurrency(dashboardData?.financial_highlights?.gross_profit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Net Profit</span>
                        <span className="font-semibold text-emerald-400">{formatCurrency(dashboardData?.financial_highlights?.net_profit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gross Margin</span>
                        <span className="font-semibold text-white">{dashboardData?.financial_highlights?.gross_margin?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Net Margin</span>
                        <span className="font-semibold text-white">{dashboardData?.financial_highlights?.net_margin?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Production KPIs */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Factory className="w-5 h-5 mr-2 text-blue-400" />
                      Production Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Produced</span>
                        <span className="font-semibold text-white">{formatNumber(dashboardData?.production_summary?.total_produced)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Rejected</span>
                        <span className="font-semibold text-red-400">{formatNumber(dashboardData?.production_summary?.total_rejected)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Rejection Rate</span>
                        <span className="font-semibold text-white">{dashboardData?.quality_metrics?.rejection_rate?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Work Orders</span>
                        <span className="font-semibold text-white">{dashboardData?.production_summary?.active_work_orders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Completed Orders</span>
                        <span className="font-semibold text-emerald-400">{dashboardData?.production_summary?.completed_work_orders}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* OEE Trends */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Gauge className="w-5 h-5 mr-2 text-indigo-400" />
                      OEE Trends
                    </h3>
                    <OEETrendChart />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">
                          {analyticsData?.oeeTrends?.overall_oee?.availability?.toFixed(1) || '0'}%
                        </p>
                        <p className="text-sm text-gray-400">Availability</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">
                          {analyticsData?.oeeTrends?.overall_oee?.performance?.toFixed(1) || '0'}%
                        </p>
                        <p className="text-sm text-gray-400">Performance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-pink-400">
                          {analyticsData?.oeeTrends?.overall_oee?.quality?.toFixed(1) || '0'}%
                        </p>
                        <p className="text-sm text-gray-400">Quality</p>
                      </div>
                    </div>
                  </div>

                  {/* ABC Analysis */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-amber-400" />
                      Inventory ABC Analysis
                    </h3>
                    <ABCAnalysisChart />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium text-red-400">A Items</p>
                        <p className="text-xs text-gray-400">
                          {analyticsData?.abcAnalysis?.classification_summary?.A?.percentage?.toFixed(1) || '0'}% of items
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-400">B Items</p>
                        <p className="text-xs text-gray-400">
                          {analyticsData?.abcAnalysis?.classification_summary?.B?.percentage?.toFixed(1) || '0'}% of items
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-400">C Items</p>
                        <p className="text-xs text-gray-400">
                          {analyticsData?.abcAnalysis?.classification_summary?.C?.percentage?.toFixed(1) || '0'}% of items
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Utilization */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                    Equipment Capacity Utilization
                  </h3>
                  <CapacityUtilizationChart />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Optimal</p>
                      <p className="text-xs text-gray-400">70-85%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-400">High</p>
                      <p className="text-xs text-gray-400">85-95%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-400">Critical</p>
                      <p className="text-xs text-gray-400">95%+</p>
                    </div>
                  </div>
                </div>

                {/* Production Anomalies */}
                <ProductionAnomaliesWidget />
              </motion.div>
            )}

            {viewMode === 'operations' && (
              <motion.div
                key="operations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Schedule Suggestions */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
                      Production Schedule Suggestions
                    </h3>
                    <ScheduleSuggestions />
                  </div>

                  {/* Reorder Suggestions */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <AlertOctagon className="w-5 h-5 mr-2 text-red-400" />
                      Critical Reorder Suggestions
                    </h3>
                    <ReorderSuggestions />
                  </div>
                </div>

                {/* Rejection Analysis */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-amber-400" />
                    Rejection Analysis
                  </h3>
                  <RejectionAnalysisWidget />
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-400" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-center transition-colors"
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Generate Report</p>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-600 hover:bg-purple-700 p-4 rounded-xl text-center transition-colors"
                    >
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Create Purchase Order</p>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-emerald-600 hover:bg-emerald-700 p-4 rounded-xl text-center transition-colors"
                    >
                      <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">New Work Order</p>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
