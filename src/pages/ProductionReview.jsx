import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, Package, Calendar, Download, RefreshCw, Search,
  Clock, Target, Award, Zap, Eye, X, Grid, List, User, Cpu,
  TrendingUp, Factory, CheckCircle, XCircle, AlertCircle, ArrowRight,
  BarChart3, Box, Layers, Settings, Filter
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
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
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    minEfficiency: 0,
    showOnlyIssues: false
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      
      const summaryRes = await api.get(`/analytics/production-summary/?${params}`);
      setProductionSummary(summaryRes.data);

      const employeeRes = await api.get(`/analytics/employees/?${params}`);
      setEmployeeData(employeeRes.data.employees || []);

      const equipmentRes = await api.get(`/analytics/equipment/?${params}`);
      setEquipmentData(equipmentRes.data.equipment || []);

      const workOrderRes = await api.get(`/analytics/workorders/?${params}`);
      setWorkOrderData(workOrderRes.data.work_orders || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
                  Production Review & Analytics
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
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'employees', label: 'Employees', icon: Users },
                { id: 'equipment', label: 'Equipment', icon: Cpu },
                { id: 'workorders', label: 'Work Orders', icon: Package }
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
          {/* Overview Tab */}
          {activeTab === 'overview' && productionSummary && (
            <div className="space-y-4 sm:space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <MetricCard
                  icon={Package}
                  value={productionSummary.total_produced?.toLocaleString() || 0}
                  label="Total Produced"
                  subtext={`${productionSummary.total_entries} entries`}
                  color="purple"
                  delay={0}
                />
                <MetricCard
                  icon={Target}
                  value={`${productionSummary.yield_pct?.toFixed(1) || 0}%`}
                  label="Quality Yield"
                  subtext={`${productionSummary.total_rejected?.toLocaleString() || 0} rejected`}
                  color="blue"
                  delay={0.1}
                />
                <MetricCard
                  icon={Zap}
                  value={productionSummary.avg_hourly_output?.toFixed(1) || 0}
                  label="Avg Hourly Output"
                  subtext="units per hour"
                  color="emerald"
                  delay={0.2}
                />
                <MetricCard
                  icon={Clock}
                  value={`${(productionSummary.total_downtime_minutes / 60)?.toFixed(1) || 0}h`}
                  label="Total Downtime"
                  subtext={`${productionSummary.total_downtime_minutes || 0} minutes`}
                  color="amber"
                  delay={0.3}
                />
              </div>

              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TopPerformersList
                  title="Top Operators"
                  icon={Award}
                  iconColor="emerald"
                  data={productionSummary.top_operators}
                  onItemClick={fetchEmployeeDetail}
                  idKey="operator_id"
                  nameKey="operator_name"
                />
                <TopPerformersList
                  title="Top Equipment"
                  icon={Cpu}
                  iconColor="blue"
                  data={productionSummary.top_equipment}
                  onItemClick={fetchEquipmentDetail}
                  idKey="equipment_id"
                  nameKey="equipment_code"
                />
              </div>

              {/* Work Orders Summary */}
              <WorkOrdersTable
                data={productionSummary.work_orders_summary}
                onViewDetail={fetchWorkOrderDetail}
                getQualityColor={getQualityColor}
              />
            </div>
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
    </div>
  );
};

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

export default ProductionReview;