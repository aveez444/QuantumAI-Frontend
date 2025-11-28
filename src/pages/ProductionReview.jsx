import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, Package, Calendar, Download, RefreshCw, Search,
  Clock, Target, Award, Zap, Eye, X, Grid, List, User, Cpu,
  TrendingUp, Factory, CheckCircle, XCircle, AlertCircle, ArrowRight,
  BarChart3, Box, Layers, Settings, Filter, PieChart, LineChart as LineChartIcon,
  BarChart3 as BarChartIcon, TrendingDown, Sparkles, Brain
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart as RechartsPieChart,
  Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter, ScatterChart  // Add ScatterChart here
} from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const ProductionReview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const [productionSummary, setProductionSummary] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [workOrderData, setWorkOrderData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    minEfficiency: 0,
    showOnlyIssues: false,
    department: 'all',
    shift: 'all'
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('30d');

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      
      const [summaryRes, employeeRes, equipmentRes, workOrderRes, analyticsRes] = await Promise.all([
        api.get(`/analytics/production-summary/?${params}`),
        api.get(`/analytics/employees/?${params}`),
        api.get(`/analytics/equipment/?${params}`),
        api.get(`/analytics/workorders/?${params}`),
        api.get(`/analytics/detailed-analytics/?${params}&timeframe=${chartTimeframe}`)
      ]);

      setProductionSummary(summaryRes.data);
      setEmployeeData(employeeRes.data.employees || []);
      setEquipmentData(equipmentRes.data.equipment || []);
      setWorkOrderData(workOrderRes.data.work_orders || []);
      setAnalyticsData(analyticsRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewAlertDetails = (alert) => {
  setSelectedAlert(alert);
  setShowAlertModal(true);
};

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setSelectedAlert(null);
  };

  const fetchEmployeeDetail = async (employeeId) => {
    setDetailLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const res = await api.get(`/analytics/employees/${employeeId}/?${params}`);
      setSelectedEmployee(res.data);
      setSelectedEquipment(null);
      setSelectedWorkOrder(null);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching employee detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchEquipmentDetail = async (equipmentId) => {
    setDetailLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const res = await api.get(`/analytics/equipment/${equipmentId}/?${params}`);
      setSelectedEquipment(res.data);
      setSelectedEmployee(null);
      setSelectedWorkOrder(null);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching equipment detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchWorkOrderDetail = async (workOrderId) => {
    setDetailLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const res = await api.get(`/analytics/workorders/${workOrderId}/?${params}`);
      setSelectedWorkOrder(res.data);
      setSelectedEmployee(null);
      setSelectedEquipment(null);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching work order detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/data/export/?type=${reportType}&${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${dateRange.end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  // Enhanced analytics calculations
  const analyticsMetrics = useMemo(() => {
    if (!analyticsData) return null;

    return {
      overallEfficiency: analyticsData.overall_efficiency || 0,
      qualityTrend: analyticsData.quality_trend || 0,
      productivityIndex: analyticsData.productivity_index || 0,
      utilizationRate: analyticsData.utilization_rate || 0,
      performanceScore: analyticsData.performance_score || 0
    };
  }, [analyticsData]);

  const getFilteredEmployees = () => {
    let filtered = employeeData;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(emp => 
        emp.employee_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    if (filters.minEfficiency > 0) {
      filtered = filtered.filter(emp => 
        (emp.avg_hourly_output || 0) >= filters.minEfficiency
      );
    }
    
    if (filters.showOnlyIssues) {
      filtered = filtered.filter(emp => 
        (emp.quality_rate_pct || 100) < 90
      );
    }
    
    if (filters.department !== 'all') {
      filtered = filtered.filter(emp => 
        emp.department === filters.department
      );
    }
    
    return filtered;
  };

  const getFilteredEquipment = () => {
    let filtered = equipmentData;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(eq => 
        eq.equipment_code?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        eq.equipment_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    if (filters.showOnlyIssues) {
      filtered = filtered.filter(eq => 
        (eq.quality_rate_pct || 100) < 90 || (eq.downtime_minutes || 0) > 60
      );
    }
    
    return filtered;
  };

  const getFilteredWorkOrders = () => {
    let filtered = workOrderData;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(wo => 
        wo.wo_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        wo.product_sku?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        wo.product_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-emerald-400';
    if (efficiency >= 75) return 'text-blue-400';
    if (efficiency >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getQualityColor = (quality) => {
    if (quality >= 95) return 'text-emerald-400';
    if (quality >= 90) return 'text-blue-400';
    if (quality >= 85) return 'text-amber-400';
    return 'text-red-400';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-emerald-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
    setSelectedEquipment(null);
    setSelectedWorkOrder(null);
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
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400"
                >
                  Production Intelligence Dashboard
                </motion.h1>
                <p className="text-gray-400 mt-1 text-sm">
                  {dateRange.start_date} to {dateRange.end_date}
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2 text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                    className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-28"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                    className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-28"
                  />
                </div>

                <div className="hidden sm:flex bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchAllData}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs sm:text-sm hidden sm:inline">Refresh</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadReport('production')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 py-2 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Export</span>
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'overview', label: 'Business Intelligence', icon: Brain },
                { id: 'employees', label: 'Employees', icon: Users },
                { id: 'equipment', label: 'Equipment', icon: Cpu },
                { id: 'workorders', label: 'Work Orders', icon: Package },
               
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Business Intelligence Tab */}
          {activeTab === 'overview' && productionSummary && analyticsData && (
            <BIDashboard 
              productionSummary={productionSummary}
              analyticsData={analyticsData}
              analyticsMetrics={analyticsMetrics}
              chartTimeframe={chartTimeframe}
              setChartTimeframe={setChartTimeframe}
              getEfficiencyColor={getEfficiencyColor}
              getQualityColor={getQualityColor}
              getTrendColor={getTrendColor}
              getTrendIcon={getTrendIcon}
              onEmployeeClick={fetchEmployeeDetail}
              onEquipmentClick={fetchEquipmentDetail}
              onWorkOrderClick={fetchWorkOrderDetail}
              onViewAlertDetails={handleViewAlertDetails} 
            />
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'analytics' && analyticsData && (
            <AdvancedAnalytics 
              analyticsData={analyticsData}
              getEfficiencyColor={getEfficiencyColor}
              getQualityColor={getQualityColor}
            />
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <EmployeesTab
              employees={getFilteredEmployees()}
              filters={filters}
              setFilters={setFilters}
              fetchDetail={fetchEmployeeDetail}
              getQualityColor={getQualityColor}
              getEfficiencyColor={getEfficiencyColor}
            />
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <EquipmentTab
              equipment={getFilteredEquipment()}
              filters={filters}
              setFilters={setFilters}
              fetchDetail={fetchEquipmentDetail}
              getQualityColor={getQualityColor}
              getEfficiencyColor={getEfficiencyColor}
            />
          )}

          {/* Work Orders Tab */}
          {activeTab === 'workorders' && (
            <WorkOrdersTab
              workOrders={getFilteredWorkOrders()}
              filters={filters}
              setFilters={setFilters}
              fetchDetail={fetchWorkOrderDetail}
              getQualityColor={getQualityColor}
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        show={showDetailModal}
        loading={detailLoading}
        employee={selectedEmployee}
        equipment={selectedEquipment}
        workOrder={selectedWorkOrder}
        onClose={closeModal}
        onDownload={handleDownloadReport}
        getQualityColor={getQualityColor}
        getEfficiencyColor={getEfficiencyColor}
      />

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        show={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedAlert(null);
        }}
        onViewEquipment={(equipmentId) => {
          setShowAlertModal(false);
          fetchEquipmentDetail(equipmentId);
        }}
        onViewWorkOrder={(workOrderId) => {
          setShowAlertModal(false);
          fetchWorkOrderDetail(workOrderId);
        }}
      />
    </div>
  );
};

// Component: BI Dashboard
const BIDashboard = ({ 
  productionSummary, 
  analyticsData, 
  analyticsMetrics, 
  chartTimeframe, 
  setChartTimeframe,
  getEfficiencyColor,
  getQualityColor,
  getTrendColor,
  getTrendIcon,
  onEmployeeClick,
  onEquipmentClick,
  onWorkOrderClick,
  onViewAlertDetails  // Add this prop 
}) => (
  <div className="space-y-6">
    {/* KPI Cards with Trends */}
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Overall Efficiency"
        value={`${analyticsMetrics.overallEfficiency}%`}
        trend={analyticsMetrics.overallEfficiency - 85}
        icon={Zap}
        color="purple"
        delay={0}
      />
      <KPICard
        title="Quality Yield"
        value={`${productionSummary.yield_pct?.toFixed(1)}%`}
        trend={analyticsMetrics.qualityTrend}
        icon={Target}
        color="emerald"
        delay={0.1}
      />
      <KPICard
        title="Productivity Index"
        value={analyticsMetrics.productivityIndex.toFixed(1)}
        trend={analyticsMetrics.productivityIndex - 1.0}
        icon={TrendingUp}
        color="blue"
        delay={0.2}
      />
      <KPICard
        title="Utilization Rate"
        value={`${analyticsMetrics.utilizationRate}%`}
        trend={analyticsMetrics.utilizationRate - 75}
        icon={Activity}
        color="amber"
        delay={0.3}
      />
      <KPICard
        title="Performance Score"
        value={analyticsMetrics.performanceScore.toFixed(0)}
        trend={analyticsMetrics.performanceScore - 80}
        icon={Award}
        color="cyan"
        delay={0.4}
      />
    </div>

    {/* Charts Row 1 */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Production Trend Chart */}
      <ChartCard
        title="Production Trend"
        icon={BarChartIcon}
        timeframe={chartTimeframe}
        onTimeframeChange={setChartTimeframe}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.production_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Bar dataKey="production" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Quality vs Efficiency Scatter */}
      <ChartCard
        title="Quality vs Efficiency Analysis"
        icon={BarChartIcon}
        timeframe={chartTimeframe}
        onTimeframeChange={setChartTimeframe}
      >
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={analyticsData.quality_efficiency_correlation}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="efficiency" 
              name="Efficiency %" 
              stroke="#6B7280" 
              fontSize={12}
              domain={[60, 100]}
            />
            <YAxis 
              type="number" 
              dataKey="quality" 
              name="Quality %" 
              stroke="#6B7280" 
              fontSize={12}
              domain={[80, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Scatter name="Equipment" dataKey="quality" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>

  {/* Performance Progress */}
<ChartCard
  title="Performance Metrics"
  icon={Target}
  timeframe={chartTimeframe}
  onTimeframeChange={setChartTimeframe}
>
  <div className="space-y-6 py-4">
    {analyticsData.performance_radar?.map((metric, index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              index === 0 ? 'bg-purple-500/20' :
              index === 1 ? 'bg-emerald-500/20' :
              index === 2 ? 'bg-blue-500/20' :
              index === 3 ? 'bg-amber-500/20' : 'bg-cyan-500/20'
            }`}>
              {index === 0 && <Zap className="w-4 h-4 text-purple-400" />}
              {index === 1 && <Target className="w-4 h-4 text-emerald-400" />}
              {index === 2 && <TrendingUp className="w-4 h-4 text-blue-400" />}
              {index === 3 && <Activity className="w-4 h-4 text-amber-400" />}
              {index === 4 && <Award className="w-4 h-4 text-cyan-400" />}
            </div>
            <span className="text-sm font-medium text-white capitalize">{metric.subject}</span>
          </div>
          <span className="text-white font-bold">{metric.A}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${
              index === 0 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
              index === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
              index === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              index === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
              'bg-gradient-to-r from-cyan-500 to-cyan-600'
            }`}
            style={{ width: `${metric.A}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>Target: {metric.B}%</span>
          <span>100%</span>
        </div>
      </div>
    ))}
  </div>
</ChartCard>

      {/* Real-time Metrics */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          Real-time Insights
        </h3>
        <div className="space-y-4">
          {analyticsData.real_time_insights?.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{insight.metric}</span>
                <span className={`text-xs font-bold ${getTrendColor(insight.trend)}`}>
                  {insight.trend > 0 ? '+' : ''}{insight.trend}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>


      {/* Top Performers & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopPerformersList
          title="Top Operators"
          icon={Award}
          iconColor="emerald"
          data={productionSummary.top_operators}
          onItemClick={onEmployeeClick}
          idKey="operator_id"
          nameKey="operator_name"
          metricKey="produced"
        />
        
        <TopPerformersList
          title="Top Equipment"
          icon={Cpu}
          iconColor="blue"
          data={productionSummary.top_equipment}
          onItemClick={onEquipmentClick}
          idKey="equipment_id"
          nameKey="equipment_code"
          metricKey="produced"
        />
      </div>

      {/* Work Orders Summary */}
      <div className="mt-6">
        <WorkOrdersTable
          data={productionSummary.work_orders_summary}
          onViewDetail={onWorkOrderClick}
          getQualityColor={getQualityColor}
        />
      </div>

          {/* Alerts Panel */}
      <div className="mt-6">
        <AlertPanel 
          alerts={analyticsData.alerts} 
          onViewDetails={onViewAlertDetails}  
        />
      </div>
    </div>
);

// Component: Advanced Analytics
const AdvancedAnalytics = ({ analyticsData, getEfficiencyColor, getQualityColor }) => (
  <div className="space-y-6">
    {/* Statistical Analysis */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Production Distribution" icon={BarChartIcon}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.production_distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Efficiency Correlation" icon={LineChartIcon}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={analyticsData.correlation_analysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="efficiency" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            />
            <Bar dataKey="frequency" fill="#374151" />
            <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>

    {/* Predictive Analytics */}
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-400" />
        Predictive Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData.predictive_insights?.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{insight.metric}</span>
              <span className={`text-xs font-bold ${
                insight.prediction > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {insight.prediction > 0 ? '+' : ''}{insight.prediction}%
              </span>
            </div>
            <p className="text-xs text-gray-400">{insight.timeframe}</p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${Math.abs(insight.confidence)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Confidence: {insight.confidence}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Component: KPI Card with Trends
const KPICard = ({ title, value, trend, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-gradient-to-br from-${color}-900/30 to-${color}-800/20 rounded-2xl p-6 border border-${color}-500/20`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className={`flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
        {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-bold">{trend > 0 ? '+' : ''}{trend}%</span>
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <div className="text-2xl font-bold text-white">{value}</div>
  </motion.div>
);

// Component: Chart Card
const ChartCard = ({ title, icon: Icon, children, timeframe, onTimeframeChange }) => (
  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold flex items-center">
        <Icon className="w-5 h-5 mr-2 text-purple-400" />
        {title}
      </h3>
      {onTimeframeChange && (
        <div className="flex bg-gray-900 rounded-lg p-1">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <button
              key={period}
              onClick={() => onTimeframeChange(period)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === period 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Component: Alert Panel
const AlertPanel = ({ alerts, onViewDetails }) => (
  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <AlertCircle className="w-5 h-5 mr-2 text-amber-400" />
      Active Alerts ({alerts?.length || 0})
    </h3>
    <div className="space-y-3">
      {alerts?.map((alert, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`p-4 rounded-xl border ${
            alert.severity === 'CRITICAL' 
              ? 'bg-gradient-to-r from-red-900/20 to-red-800/10 border-red-500/30' 
              : alert.severity === 'HIGH'
              ? 'bg-gradient-to-r from-orange-900/20 to-amber-900/10 border-orange-500/30'
              : 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-yellow-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'CRITICAL' ? 'bg-red-500/20' :
                alert.severity === 'HIGH' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
              }`}>
                {alert.severity === 'CRITICAL' && <XCircle className="w-4 h-4 text-red-400" />}
                {alert.severity === 'HIGH' && <AlertCircle className="w-4 h-4 text-orange-400" />}
                {alert.severity === 'MEDIUM' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
              </div>
              <div>
                <span className="text-sm font-medium text-white">{alert.equipment_code}</span>
                <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold ${
              alert.severity === 'CRITICAL' ? 'text-red-400' :
              alert.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
            }`}>
              {alert.alert_type}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{alert.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </span>
              {alert.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.duration}
                </span>
              )}
            </div>
            <button 
              onClick={() => onViewDetails(alert)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors group"
            >
              View Details 
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      ))}
      {(!alerts || alerts.length === 0) && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-gray-400">No active alerts</p>
          <p className="text-sm text-gray-500 mt-1">All systems are running normally</p>
        </div>
      )}
    </div>
  </div>
);

// Component: Metric Card
const MetricCard = ({ icon: Icon, value, label, subtext, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-gradient-to-br from-${color}-900/30 to-${color}-800/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-${color}-500/20`}
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className={`p-2 sm:p-3 bg-${color}-500/20 rounded-lg sm:rounded-xl`}>
        <Icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${color}-400`} />
      </div>
      <span className="text-lg sm:text-2xl font-bold text-white">{value}</span>
    </div>
    <h3 className="text-gray-400 text-xs sm:text-sm font-medium">{label}</h3>
    <div className="mt-1 sm:mt-2 flex items-center text-xs">
      <span className="text-gray-400">{subtext}</span>
    </div>
  </motion.div>
);

// Component: Top Performers List
const TopPerformersList = ({ title, icon: Icon, iconColor, data, onItemClick, idKey, nameKey }) => (
  <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 text-${iconColor}-400`} />
      {title}
    </h3>
    <div className="space-y-2 sm:space-y-3">
      {data?.slice(0, 5).map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center justify-between p-2 sm:p-3 bg-gray-900/50 rounded-lg sm:rounded-xl hover:bg-gray-900/70 transition-colors cursor-pointer"
          onClick={() => item[idKey] && onItemClick(item[idKey])}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm ${
              idx === 0 ? 'bg-amber-500/20 text-amber-400' :
              idx === 1 ? 'bg-gray-400/20 text-gray-400' :
              idx === 2 ? 'bg-orange-500/20 text-orange-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-xs sm:text-sm truncate">{item[nameKey]}</p>
              <p className="text-xs text-gray-400">{item.entries} hrs</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-xs sm:text-sm">{item.produced?.toLocaleString()}</p>
            <p className="text-xs text-gray-400">units</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Component: Work Orders Table
const WorkOrdersTable = ({ data, onViewDetail, getQualityColor }) => (
  <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
      <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-400" />
      Recent Work Orders
    </h3>
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">WO Number</th>
              <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Product</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Produced</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium hidden sm:table-cell">Rejected</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Yield</th>
              <th className="text-center py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.slice(0, 10).map((wo, idx) => (
              <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-900/30">
                <td className="py-2 sm:py-3 px-3 sm:px-4">
                  <span className="text-blue-400 font-mono text-xs sm:text-sm">{wo.wo_number}</span>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-white text-xs sm:text-sm truncate max-w-[120px]">{wo.product_sku}</td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-emerald-400 font-semibold text-xs sm:text-sm">
                  {wo.produced?.toLocaleString()}
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-red-400 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                  {wo.rejected?.toLocaleString()}
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right">
                  <span className={`${getQualityColor(wo.yield_pct)} text-xs sm:text-sm font-bold`}>
                    {wo.yield_pct?.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-center">
                  <button
                    onClick={() => onViewDetail(wo.work_order_id)}
                    className="p-1 sm:p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Component: Employees Tab
const EmployeesTab = ({ employees, filters, setFilters, fetchDetail, getQualityColor, getEfficiencyColor }) => (
  <div className="space-y-4 sm:space-y-6">
    <FilterPanel filters={filters} setFilters={setFilters} type="employee" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {employees.map((emp, idx) => (
        <EmployeeCard
          key={emp.employee_id}
          employee={emp}
          idx={idx}
          onClick={() => fetchDetail(emp.employee_id)}
          getQualityColor={getQualityColor}
          getEfficiencyColor={getEfficiencyColor}
        />
      ))}
    </div>
    {employees.length === 0 && <EmptyState icon={Users} message="No employees found" />}
  </div>
);

// Component: Equipment Tab
const EquipmentTab = ({ equipment, filters, setFilters, fetchDetail, getQualityColor, getEfficiencyColor }) => (
  <div className="space-y-4 sm:space-y-6">
    <FilterPanel filters={filters} setFilters={setFilters} type="equipment" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {equipment.map((eq, idx) => (
        <EquipmentCard
          key={eq.equipment_id}
          equipment={eq}
          idx={idx}
          onClick={() => fetchDetail(eq.equipment_id)}
          getQualityColor={getQualityColor}
          getEfficiencyColor={getEfficiencyColor}
        />
      ))}
    </div>
    {equipment.length === 0 && <EmptyState icon={Cpu} message="No equipment found" />}
  </div>
);

// Component: Work Orders Tab
const WorkOrdersTab = ({ workOrders, filters, setFilters, fetchDetail, getQualityColor }) => (
  <div className="space-y-4 sm:space-y-6">
    <FilterPanel filters={filters} setFilters={setFilters} type="workorder" />
    <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-700">
              <th className="text-left py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium">WO Number</th>
              <th className="text-left py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium">Product</th>
              <th className="text-right py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium">Produced</th>
              <th className="text-right py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium hidden sm:table-cell">Rejected</th>
              <th className="text-right py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium">Yield</th>
              <th className="text-center py-4 px-6 text-xs sm:text-sm text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo, idx) => (
              <motion.tr
                key={wo.work_order_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-gray-700/50 hover:bg-gray-900/30 transition-colors"
              >
                <td className="py-4 px-6">
                  <span className="text-blue-400 font-mono font-medium text-xs sm:text-sm">{wo.wo_number}</span>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="text-white font-medium text-xs sm:text-sm">{wo.product_sku}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {wo.equipment_contributions?.length || 0} equipment
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">{wo.produced?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-6 text-right hidden sm:table-cell">
                  <span className="text-red-400 font-bold text-xs sm:text-sm">{wo.rejected?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`font-bold text-xs sm:text-sm ${getQualityColor(wo.quality_rate_pct)}`}>
                    {wo.quality_rate_pct?.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => fetchDetail(wo.work_order_id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {workOrders.length === 0 && (
        <div className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No work orders found</h3>
          <p className="text-gray-500">Try adjusting your search</p>
        </div>
      )}
    </div>
  </div>
);

// Component: Filter Panel
const FilterPanel = ({ filters, setFilters, type }) => (
  <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${type}s...`}
          value={filters.searchTerm}
          onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      {type === 'employee' && (
        <div>
          <input
            type="number"
            placeholder="Min efficiency"
            value={filters.minEfficiency || ''}
            onChange={(e) => setFilters({...filters, minEfficiency: Number(e.target.value)})}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showIssues"
          checked={filters.showOnlyIssues}
          onChange={(e) => setFilters({...filters, showOnlyIssues: e.target.checked})}
          className="w-4 h-4 rounded border-gray-700 bg-gray-900"
        />
        <label htmlFor="showIssues" className="text-xs sm:text-sm text-gray-300">
          {type === 'equipment' ? 'Show only issues' : 'Show quality issues'}
        </label>
      </div>

      {type === 'employee' && (
        <select
          value={filters.department}
          onChange={(e) => setFilters({...filters, department: e.target.value})}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Departments</option>
          <option value="production">Production</option>
          <option value="quality">Quality Control</option>
          <option value="maintenance">Maintenance</option>
        </select>
      )}
    </div>
  </div>
);

// Component: Employee Card
const EmployeeCard = ({ employee, idx, onClick, getQualityColor, getEfficiencyColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold text-sm sm:text-base truncate">{employee.employee_name}</h4>
          <p className="text-xs text-gray-400">{employee.employee_code}</p>
          <p className="text-xs text-gray-400">{employee.hours_worked} hrs</p>
        </div>
      </div>
      <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Produced</span>
        <span className="text-white font-bold text-sm sm:text-base">{employee.total_produced?.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Quality</span>
        <span className={`font-bold text-sm sm:text-base ${getQualityColor(employee.quality_rate_pct)}`}>
          {employee.quality_rate_pct?.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Avg/Hr</span>
        <span className={`font-bold text-sm sm:text-base ${getEfficiencyColor(employee.avg_hourly_output)}`}>
          {employee.avg_hourly_output?.toFixed(1)}
        </span>
      </div>
    </div>
  </motion.div>
);

// Component: Equipment Card
const EquipmentCard = ({ equipment, idx, onClick, getQualityColor, getEfficiencyColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold text-sm sm:text-base truncate">{equipment.equipment_code}</h4>
          <p className="text-xs text-gray-400">{equipment.equipment_name}</p>
          <p className="text-xs text-gray-400">{equipment.entries} hrs</p>
        </div>
      </div>
      <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Produced</span>
        <span className="text-white font-bold text-sm sm:text-base">{equipment.produced?.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Quality</span>
        <span className={`font-bold text-sm sm:text-base ${getQualityColor(equipment.quality_rate_pct)}`}>
          {equipment.quality_rate_pct?.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">Downtime</span>
        <span className={`font-bold text-sm sm:text-base ${
          equipment.downtime_minutes > 120 ? 'text-red-400' :
          equipment.downtime_minutes > 60 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {(equipment.downtime_minutes / 60).toFixed(1)}h
        </span>
      </div>
    </div>
  </motion.div>
);

// Component: Empty State
const EmptyState = ({ icon: Icon, message }) => (
  <div className="bg-gray-800/50 rounded-2xl p-12 border border-gray-700/50 text-center">
    <Icon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
    <h3 className="text-xl font-semibold text-gray-400 mb-2">{message}</h3>
    <p className="text-gray-500">Try adjusting your filters</p>
  </div>
);

// Component: Detail Modal
const DetailModal = ({ show, loading, employee, equipment, workOrder, onClose, onDownload, getQualityColor, getEfficiencyColor }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-gray-700/50 flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-white truncate">
              {employee && `Employee: ${employee.employee_name}`}
              {equipment && `Equipment: ${equipment.equipment_code}`}
              {workOrder && `Work Order: ${workOrder.wo_number}`}
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                />
              </div>
            ) : (
              <>
                {employee && <EmployeeDetail employee={employee} getQualityColor={getQualityColor} getEfficiencyColor={getEfficiencyColor} />}
                {equipment && <EquipmentDetail equipment={equipment} getQualityColor={getQualityColor} />}
                {workOrder && <WorkOrderDetail workOrder={workOrder} getQualityColor={getQualityColor} />}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-700/50 flex justify-end gap-3">
            <button
              onClick={() => {
                const type = employee ? 'employee' : equipment ? 'equipment' : 'workorder';
                onDownload(type);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Component: Employee Detail
const EmployeeDetail = ({ employee, getQualityColor, getEfficiencyColor }) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Summary Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Produced" value={employee.total_produced?.toLocaleString()} color="emerald" />
      <StatCard label="Total Rejected" value={employee.total_rejected?.toLocaleString()} color="red" />
      <StatCard 
        label="Quality Rate" 
        value={`${employee.quality_rate_pct?.toFixed(1)}%`} 
        color={getQualityColor(employee.quality_rate_pct)} 
      />
      <StatCard 
        label="Avg Hourly" 
        value={employee.avg_hourly_output?.toFixed(1)} 
        color={getEfficiencyColor(employee.avg_hourly_output)} 
      />
    </div>

    {/* Work Order Breakdown */}
    <div>
      <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Work Order Performance</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">WO</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Product</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Produced</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Rejected</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Yield</th>
            </tr>
          </thead>
          <tbody>
            {employee.work_order_breakdown?.map((wo, idx) => (
              <tr key={idx} className="border-b border-gray-700/50">
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-blue-400 font-mono text-xs sm:text-sm">{wo.wo_number}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-white text-xs sm:text-sm">{wo.product_sku}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-emerald-400 font-semibold text-xs sm:text-sm">
                  {wo.produced?.toLocaleString()}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-red-400 font-semibold text-xs sm:text-sm">
                  {wo.rejected?.toLocaleString()}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                  <span className={`${getQualityColor(wo.yield_pct)} text-xs sm:text-sm font-bold`}>
                    {wo.yield_pct?.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Recent Production Entries */}
    {employee.production_entries && employee.production_entries.length > 0 && (
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Production Entries</h4>
        <div className="space-y-2">
          {employee.production_entries.slice(0, 10).map((entry, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-3 text-xs sm:text-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-blue-400 font-mono">{entry.wo_number}</span>
                <span className="text-gray-400">{new Date(entry.entry_datetime).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Produced: </span>
                  <span className="text-emerald-400 font-semibold">{entry.quantity_produced}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rejected: </span>
                  <span className="text-red-400 font-semibold">{entry.quantity_rejected}</span>
                </div>
                <div>
                  <span className="text-gray-400">Equipment: </span>
                  <span className="text-white">{entry.equipment_code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Component: Equipment Detail
const EquipmentDetail = ({ equipment, getQualityColor }) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Summary Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Produced" value={equipment.produced?.toLocaleString()} color="emerald" />
      <StatCard label="Total Rejected" value={equipment.rejected?.toLocaleString()} color="red" />
      <StatCard 
        label="Quality Rate" 
        value={`${equipment.quality_rate_pct?.toFixed(1)}%`} 
        color={getQualityColor(equipment.quality_rate_pct)} 
      />
      <StatCard label="Downtime" value={`${(equipment.downtime_minutes / 60)?.toFixed(1)}h`} color="amber" />
    </div>

    {/* Additional Info */}
    <div className="bg-gray-900/50 rounded-xl p-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Hours Operated:</span>
          <span className="ml-2 text-white font-semibold">{equipment.entries}</span>
        </div>
        <div>
          <span className="text-gray-400">Avg Hourly Output:</span>
          <span className="ml-2 text-white font-semibold">{equipment.avg_hourly_output?.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-400">Location:</span>
          <span className="ml-2 text-white font-semibold">{equipment.location || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-400">Department:</span>
          <span className="ml-2 text-white font-semibold">{equipment.department || 'N/A'}</span>
        </div>
      </div>
    </div>

    {/* Work Order Breakdown */}
    {equipment.work_order_breakdown && equipment.work_order_breakdown.length > 0 && (
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Work Orders Processed</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">WO</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Product</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Produced</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400 font-medium">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {equipment.work_order_breakdown.map((wo, idx) => (
                <tr key={idx} className="border-b border-gray-700/50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-blue-400 font-mono text-xs sm:text-sm">{wo.wo_number}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-white text-xs sm:text-sm">{wo.product_sku}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-emerald-400 font-semibold text-xs sm:text-sm">
                    {wo.produced?.toLocaleString()}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-red-400 font-semibold text-xs sm:text-sm">
                    {wo.rejected?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

// Component: Work Order Detail
const WorkOrderDetail = ({ workOrder, getQualityColor }) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Summary Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Produced" value={workOrder.produced?.toLocaleString()} color="emerald" />
      <StatCard label="Total Rejected" value={workOrder.rejected?.toLocaleString()} color="red" />
      <StatCard 
        label="Quality Rate" 
        value={`${workOrder.quality_rate_pct?.toFixed(1)}%`} 
        color={getQualityColor(workOrder.quality_rate_pct)} 
      />
      <StatCard label="Entries" value={workOrder.entries} color="blue" />
    </div>

    {/* Work Order Info */}
    <div className="bg-gray-900/50 rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Product:</span>
          <span className="ml-2 text-white font-semibold">{workOrder.product_sku} - {workOrder.product_name}</span>
        </div>
        <div>
          <span className="text-gray-400">Status:</span>
          <span className="ml-2 text-white font-semibold">{workOrder.status}</span>
        </div>
        <div>
          <span className="text-gray-400">Planned Quantity:</span>
          <span className="ml-2 text-white font-semibold">{workOrder.quantity_planned?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Completed:</span>
          <span className="ml-2 text-white font-semibold">{workOrder.quantity_completed?.toLocaleString()}</span>
        </div>
        {workOrder.due_date && (
          <div>
            <span className="text-gray-400">Due Date:</span>
            <span className="ml-2 text-white font-semibold">{workOrder.due_date}</span>
          </div>
        )}
        {workOrder.cost_center && (
          <div>
            <span className="text-gray-400">Cost Center:</span>
            <span className="ml-2 text-white font-semibold">{workOrder.cost_center}</span>
          </div>
        )}
      </div>
    </div>

    {/* Equipment Contributions */}
    {workOrder.equipment_contributions && workOrder.equipment_contributions.length > 0 && (
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Equipment Contributions</h4>
        <div className="space-y-3">
          {workOrder.equipment_contributions.map((eq, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm sm:text-base">{eq.equipment_code}</h5>
                    <p className="text-xs text-gray-400">{eq.equipment_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold text-purple-400">{eq.share_pct?.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">contribution</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-400">Produced</p>
                  <p className="text-emerald-400 font-semibold">{eq.produced?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Rejected</p>
                  <p className="text-red-400 font-semibold">{eq.rejected?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Downtime</p>
                  <p className="text-amber-400 font-semibold">{(eq.downtime_minutes / 60)?.toFixed(1)}h</p>
                </div>
              </div>

              {/* Contribution Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${eq.share_pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Operator Contributions */}
    {workOrder.operator_contributions && workOrder.operator_contributions.length > 0 && (
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Operator Contributions</h4>
        <div className="space-y-3">
          {workOrder.operator_contributions.map((op, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm sm:text-base">{op.operator_name}</h5>
                    <p className="text-xs text-gray-400">{op.employee_code} - {op.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold text-purple-400">{op.share_pct?.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">contribution</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-400">Produced</p>
                  <p className="text-emerald-400 font-semibold">{op.produced?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Rejected</p>
                  <p className="text-red-400 font-semibold">{op.rejected?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Hours</p>
                  <p className="text-blue-400 font-semibold">{op.hours_worked}</p>
                </div>
              </div>

              {/* Contribution Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${op.share_pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Production Timeline */}
    {workOrder.production_timeline && workOrder.production_timeline.length > 0 && (
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Production Timeline (Recent)</h4>
        <div className="space-y-2">
          {workOrder.production_timeline.slice(0, 15).map((entry, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-3 text-xs sm:text-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-white font-medium">{entry.operator_name}</span>
                  <span className="text-gray-400 ml-2">on {entry.equipment_code}</span>
                </div>
                <span className="text-gray-400">{new Date(entry.entry_datetime).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Produced: </span>
                  <span className="text-emerald-400 font-semibold">{entry.quantity_produced}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rejected: </span>
                  <span className="text-red-400 font-semibold">{entry.quantity_rejected}</span>
                </div>
                <div>
                  <span className="text-gray-400">Downtime: </span>
                  <span className="text-amber-400 font-semibold">{entry.downtime_minutes}m</span>
                </div>
              </div>
              {entry.notes && (
                <div className="mt-2 text-xs text-gray-400">
                  <span className="font-medium">Note:</span> {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Component: Stat Card (for modal)
const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-900/50 rounded-xl p-3 sm:p-4 text-center">
    <div className={`text-xl sm:text-2xl font-bold text-${color}-400`}>
      {value}
    </div>
    <div className="text-xs sm:text-sm text-gray-400 mt-1">{label}</div>
  </div>
);

// Component: Alert Detail Modal
const AlertDetailModal = ({ alert, show, onClose, onViewEquipment, onViewWorkOrder }) => {
  if (!show || !alert) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      default: return 'gray';
    }
  };

  const severityColor = getSeverityColor(alert.severity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className={`p-6 border-b ${
            severityColor === 'red' ? 'border-red-500/30 bg-red-900/10' :
            severityColor === 'orange' ? 'border-orange-500/30 bg-orange-900/10' :
            'border-yellow-500/30 bg-yellow-900/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  severityColor === 'red' ? 'bg-red-500/20' :
                  severityColor === 'orange' ? 'bg-orange-500/20' :
                  'bg-yellow-500/20'
                }`}>
                  {alert.severity === 'CRITICAL' && <XCircle className="w-6 h-6 text-red-400" />}
                  {alert.severity === 'HIGH' && <AlertCircle className="w-6 h-6 text-orange-400" />}
                  {alert.severity === 'MEDIUM' && <AlertCircle className="w-6 h-6 text-yellow-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Alert Details</h3>
                  <p className={`text-sm font-bold ${
                    severityColor === 'red' ? 'text-red-400' :
                    severityColor === 'orange' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    {alert.severity} Priority • {alert.alert_type}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Alert Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Equipment</p>
                  <p className="text-white font-semibold">{alert.equipment_code}</p>
                  {alert.equipment_name && (
                    <p className="text-sm text-gray-400">{alert.equipment_name}</p>
                  )}
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">First Detected</p>
                  <p className="text-white font-semibold">{alert.timestamp}</p>
                  {alert.duration && (
                    <p className="text-sm text-gray-400">Duration: {alert.duration}</p>
                  )}
                </div>
              </div>

              {/* Alert Message */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Alert Description</h4>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-300 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              {/* Additional Details */}
              {(alert.work_order_id || alert.operator_id || alert.department) && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Related Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {alert.work_order_id && (
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1">Work Order</p>
                        <p className="text-blue-400 font-semibold">{alert.work_order_id}</p>
                      </div>
                    )}
                    {alert.operator_id && (
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1">Operator</p>
                        <p className="text-white font-semibold">{alert.operator_id}</p>
                      </div>
                    )}
                    {alert.department && (
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1">Department</p>
                        <p className="text-white font-semibold">{alert.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Recommended Actions</h4>
                <div className="space-y-2">
                  {alert.severity === 'CRITICAL' && (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-white">Immediate maintenance required</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg">
                        <Users className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-white">Notify maintenance team immediately</p>
                      </div>
                    </>
                  )}
                  {alert.severity === 'HIGH' && (
                    <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <p className="text-sm text-white">Schedule maintenance within 4 hours</p>
                    </div>
                  )}
                  {alert.severity === 'MEDIUM' && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-900/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <p className="text-sm text-white">Schedule maintenance within 24 hours</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-700/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Last updated: {alert.timestamp}
            </div>
            <div className="flex gap-3">
              {alert.equipment_id && (
                <button
                  onClick={() => onViewEquipment(alert.equipment_id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <Cpu className="w-4 h-4" />
                  View Equipment
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductionReview;