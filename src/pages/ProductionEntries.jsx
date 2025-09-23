import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  TrendingUp, AlertCircle, ShoppingCart, Box, Zap, Clock,
  Play, Square, CheckSquare, Users, Target, Calendar as CalendarIcon,
  BarChart2, PieChart, Activity, FileText, Clock as ClockIcon,
  ArrowRight, ArrowLeft, Wrench, Cog, AlertOctagon, TrendingDown,
  User, Settings, ClipboardList, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const ProductionEntries = () => {
  const [productionEntries, setProductionEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  
  // New production entry form state
  const [newProductionEntry, setNewProductionEntry] = useState({
    work_order: '',
    equipment: '',
    operator: '',
    entry_datetime: new Date().toISOString().slice(0, 16),
    quantity_produced: '',
    quantity_rejected: '',
    downtime_minutes: '',
    downtime_reason: '',
    shift: 'day'
  });
  
  // Bulk entry form state
  const [bulkEntries, setBulkEntries] = useState([{...newProductionEntry}]);
  
  // Data for dropdowns
  const [workOrders, setWorkOrders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Filters
  const [dateFilter, setDateFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [workOrderFilter, setWorkOrderFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({});
  const [efficiencyData, setEfficiencyData] = useState({});

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch production entries
      const entriesRes = await api.get('api/production-entries/');
      setProductionEntries(entriesRes.data.results || entriesRes.data);
      
      // Fetch dashboard summary
      const dashboardRes = await api.get('api/production-entries/oee_metrics/');
      setEfficiencyData(dashboardRes.data);
      
      // Calculate dashboard stats
      calculateDashboardStats(entriesRes.data.results || entriesRes.data);
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load production entries data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDashboardStats = (entries) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => 
      entry.entry_datetime && entry.entry_datetime.startsWith(today)
    );
    
    const totalProduced = todayEntries.reduce((sum, entry) => sum + (entry.quantity_produced || 0), 0);
    const totalRejected = todayEntries.reduce((sum, entry) => sum + (entry.quantity_rejected || 0), 0);
    const totalDowntime = todayEntries.reduce((sum, entry) => sum + (entry.downtime_minutes || 0), 0);
    
    setDashboardStats({
      total_entries: entries.length,
      today_entries: todayEntries.length,
      total_produced: totalProduced,
      total_rejected: totalRejected,
      total_downtime: totalDowntime,
      quality_rate: totalProduced + totalRejected > 0 ? 
        (totalProduced / (totalProduced + totalRejected)) * 100 : 0
    });
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch active work orders for dropdown
      const workOrdersRes = await api.get('api/work-orders/?status=in_progress');
      setWorkOrders(workOrdersRes.data.results || workOrdersRes.data);
      
      // Fetch equipment for dropdown
      const equipmentRes = await api.get('api/equipment/');
      setEquipment(equipmentRes.data.results || equipmentRes.data);
      
      // Fetch employees for dropdown
      const employeesRes = await api.get('api/employees/');
      setEmployees(employeesRes.data.results || employeesRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  useEffect(() => {
    // Apply filters whenever filters or productionEntries change
    let filtered = productionEntries;
    
    // Date range filter
    if (dateFilter.start && dateFilter.end) {
      filtered = filtered.filter(entry => {
        if (!entry.entry_datetime) return false;
        const entryDate = new Date(entry.entry_datetime).toISOString().split('T')[0];
        return entryDate >= dateFilter.start && entryDate <= dateFilter.end;
      });
    }
    
    // Work order filter
    if (workOrderFilter !== 'all') {
      filtered = filtered.filter(entry => entry.work_order?.id?.toString() === workOrderFilter);
    }
    
    // Equipment filter
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter(entry => entry.equipment?.id?.toString() === equipmentFilter);
    }
    
    // Operator filter
    if (operatorFilter !== 'all') {
      filtered = filtered.filter(entry => entry.operator?.id?.toString() === operatorFilter);
    }
    
    // Shift filter
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(entry => entry.shift === shiftFilter);
    }
    
    setFilteredEntries(filtered);
  }, [productionEntries, dateFilter, workOrderFilter, equipmentFilter, operatorFilter, shiftFilter]);

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleCreateProductionEntry = async (e) => {
    e.preventDefault();
    
    try {
      // Format the data correctly for the API
      const formattedData = {
        ...newProductionEntry,
        work_order: newProductionEntry.work_order,
        equipment: newProductionEntry.equipment,
        operator: newProductionEntry.operator,
        quantity_produced: parseInt(newProductionEntry.quantity_produced),
        quantity_rejected: parseInt(newProductionEntry.quantity_rejected),
        downtime_minutes: parseInt(newProductionEntry.downtime_minutes) || 0
      };
      
      const response = await api.post('api/production-entries/', formattedData);
      
      if (response.data) {
        // Add the new entry to the list
        setProductionEntries(prev => [...prev, response.data]);
        
        // Reset form and close modal
        setNewProductionEntry({
          work_order: '',
          equipment: '',
          operator: '',
          entry_datetime: new Date().toISOString().slice(0, 16),
          quantity_produced: '',
          quantity_rejected: '',
          downtime_minutes: '',
          downtime_reason: '',
          shift: 'day'
        });
        
        setShowCreateModal(false);
        
        // Refresh data to get updated work order status
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create production entry:', err);
      alert('Failed to create production entry. Please try again.');
    }
  };

  const handleBulkCreateEntries = async (e) => {
    e.preventDefault();
    
    try {
      // Format the data correctly for the API
      const formattedEntries = bulkEntries.map(entry => ({
        ...entry,
        work_order: entry.work_order,
        equipment: entry.equipment,
        operator: entry.operator,
        quantity_produced: parseInt(entry.quantity_produced),
        quantity_rejected: parseInt(entry.quantity_rejected),
        downtime_minutes: parseInt(entry.downtime_minutes) || 0
      }));
      
      const response = await api.post('api/production-entries/bulk_entry/', {
        entries: formattedEntries
      });
      
      if (response.data) {
        // Refresh the data to get all new entries
        fetchData();
        
        // Reset form and close modal
        setBulkEntries([{...newProductionEntry}]);
        setShowBulkModal(false);
      }
    } catch (err) {
      console.error('Failed to create bulk production entries:', err);
      alert('Failed to create production entries. Please try again.');
    }
  };

  const addBulkEntryRow = () => {
    setBulkEntries([...bulkEntries, {...newProductionEntry}]);
  };

  const removeBulkEntryRow = (index) => {
    if (bulkEntries.length > 1) {
      const updatedEntries = [...bulkEntries];
      updatedEntries.splice(index, 1);
      setBulkEntries(updatedEntries);
    }
  };

  const updateBulkEntry = (index, field, value) => {
    const updatedEntries = [...bulkEntries];
    updatedEntries[index][field] = value;
    setBulkEntries(updatedEntries);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getShiftColor = (shift) => {
    switch (shift?.toLowerCase()) {
      case 'morning': return 'bg-blue-500/10 text-blue-400';
      case 'afternoon': return 'bg-amber-500/10 text-amber-400';
      case 'night': return 'bg-purple-500/10 text-purple-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getEfficiencyColor = (value) => {
    if (value >= 90) return 'text-emerald-400 bg-emerald-400/10';
    if (value >= 80) return 'text-amber-400 bg-amber-400/10';
    return 'text-red-400 bg-red-400/10';
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
                Production Monitoring
              </motion.h1>
              <p className="text-gray-400 mt-1">Real-time Production Tracking & Efficiency</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Entry</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBulkModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl transition-all"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-sm">Bulk Entry</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's Entries</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats.today_entries || 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Produced</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {dashboardStats.total_produced || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Quality Rate</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {dashboardStats.quality_rate ? `${dashboardStats.quality_rate.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <TrendingUpIcon className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Downtime (min)</p>
                  <p className="text-2xl font-bold text-red-400">
                    {dashboardStats.total_downtime || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
          </div>

        {/* Equipment Efficiency */}
        {efficiencyData.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Equipment Efficiency (OEE)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {efficiencyData.slice(0, 3).map((equipment, index) => {
                // Cap values at 100% for visualization
                const availability = Math.min(equipment.availability, 100);
                const performance = Math.min(equipment.performance, 100);
                const quality = Math.min(equipment.quality, 100);
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{equipment.equipment_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEfficiencyColor(equipment.oee)} bg-gray-800`}>
                        OEE: {equipment.oee}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Availability */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Availability</span>
                        <span className="text-white">
                          {equipment.availability}%
                          {equipment.availability > 100 && (
                            <span className="text-amber-400 ml-1" title="Exceeds 100%">⚠</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 relative overflow-hidden">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${availability}%` }}
                        />
                        {equipment.availability > 100 && (
                          <div className="absolute inset-0 border border-amber-400 rounded-full" />
                        )}
                      </div>
                      
                      {/* Performance */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Performance</span>
                        <span className="text-white">
                          {equipment.performance}%
                          {equipment.performance > 100 && (
                            <span className="text-amber-400 ml-1" title="Exceeds 100%">⚠</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 relative overflow-hidden">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${performance}%` }}
                        />
                        {equipment.performance > 100 && (
                          <div className="absolute inset-0 border border-amber-400 rounded-full" />
                        )}
                      </div>
                      
                      {/* Quality */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Quality</span>
                        <span className="text-white">
                          {equipment.quality}%
                          {equipment.quality > 100 && (
                            <span className="text-amber-400 ml-1" title="Exceeds 100%">⚠</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 relative overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${quality}%` }}
                        />
                        {equipment.quality > 100 && (
                          <div className="absolute inset-0 border border-amber-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Work Order Filter */}
              <div>
                <select
                  value={workOrderFilter}
                  onChange={(e) => setWorkOrderFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Work Orders</option>
                  {workOrders.map(wo => (
                    <option key={wo.id} value={wo.id}>
                      {wo.wo_number} - {wo.product_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Equipment Filter */}
              <div>
                <select
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Equipment</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipment_code} - {eq.equipment_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Operator Filter */}
              <div>
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Operators</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} - {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Shift Filter */}
              <div>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Shifts</option>
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="swing">Swing Shift</option>
                </select>
              </div>
            </div>
          </div>

        
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-blue-400" />
                  Production Entries
                  <span className="ml-2 text-sm text-gray-400">({filteredEntries.length} entries)</span>
                </h3>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                    <Grid className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                    <List className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No production entries found</h3>
                  <p className="text-gray-500">Create a new production entry or try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date & Time</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Work Order</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Equipment</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Operator</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Output</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Efficiency</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Quality</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Shift</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, index) => {
                        const totalOutput = entry.quantity_produced + (entry.quantity_rejected || 0);
                        const qualityRate = totalOutput > 0 
                          ? (entry.quantity_produced / totalOutput) * 100 
                          : 0;
                        const efficiency = entry.efficiency_percentage || 0;
                        
                        return (
                          <motion.tr 
                            key={entry.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30 group"
                          >
                            <td className="py-3 px-4">
                              <div className="text-white font-medium">{formatDateTime(entry.entry_datetime)}</div>
                            </td>
                              {/* Work Order Cell */}
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                                      {entry.work_order_number || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {entry.work_order?.product_name || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                          {/* Equipment Cell */}
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-lg bg-purple-500/10 mr-3">
                                <Package className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{entry.equipment_name || 'N/A'}</div>
                                <div className="text-xs text-gray-400">{entry.equipment?.equipment_code || 'N/A'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Operator Cell */}
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-lg bg-emerald-500/10 mr-3">
                                <User className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{entry.operator_name || 'N/A'}</div>
                                <div className="text-xs text-gray-400">{entry.operator?.employee_code || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <div className="text-emerald-400 font-medium">{entry.quantity_produced}</div>
                                <div className="text-xs text-gray-500">|</div>
                                <div className="text-red-400 text-sm">{entry.quantity_rejected || 0}</div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1 relative overflow-hidden">
                                <div 
                                  className="h-1.5 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${Math.min((entry.quantity_produced / totalOutput) * 100, 100)}%`,
                                    background: `linear-gradient(90deg, #10b981 ${Math.min((entry.quantity_produced / totalOutput) * 100, 100)}%, #ef4444 0%)`
                                  }}
                                />
                                {(entry.quantity_produced / totalOutput) * 100 > 100 && (
                                  <div className="absolute inset-0 border border-amber-400 rounded-full" />
                                )}
                              </div>
                            </div>
                          </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${getEfficiencyColor(efficiency)} bg-gray-800/50`}>
                                  {efficiency.toFixed(1)}%
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${getEfficiencyColor(qualityRate)} bg-gray-800/50`}>
                                  {qualityRate.toFixed(1)}%
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getShiftColor(entry.shift)}`}>
                                {entry.shift?.toUpperCase() || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleViewDetails(entry)}
                                  className="p-1.5 bg-gray-800/50 hover:bg-blue-500/20 rounded-lg transition-colors group"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-400" />
                Daily Production Trend
              </h3>
              
              <div className="space-y-4">
                {filteredEntries.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{formatDateTime(entry.entry_datetime)}</span>
                        <span className="text-white">{entry.quantity_produced} units</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                          style={{ width: `${Math.min((entry.quantity_produced / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                Operator Performance
              </h3>
              
              <div className="space-y-4">
                {employees.slice(0, 3).map(employee => {
                  const employeeEntries = filteredEntries.filter(entry => 
                    entry.operator?.id === employee.id
                  );
                  
                  const totalProduced = employeeEntries.reduce((sum, entry) => sum + entry.quantity_produced, 0);
                  const totalRejected = employeeEntries.reduce((sum, entry) => sum + (entry.quantity_rejected || 0), 0);
                  const qualityRate = totalProduced + totalRejected > 0 ? 
                    (totalProduced / (totalProduced + totalRejected)) * 100 : 0;
                  
                  return (
                    <div key={employee.id} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{employee.full_name}</span>
                          <span className="text-white">{qualityRate.toFixed(1)}% quality</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{ width: `${qualityRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Production Entry Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Create Production Entry</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateProductionEntry} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Work Order Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Work Order</label>
                    <select
                      required
                      value={newProductionEntry.work_order}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, work_order: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Work Order</option>
                      {workOrders.map(wo => (
                        <option key={wo.id} value={wo.id}>
                          {wo.wo_number} - {wo.product_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Equipment Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Equipment</label>
                    <select
                      required
                      value={newProductionEntry.equipment}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, equipment: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.equipment_code} - {eq.equipment_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Operator Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Operator</label>
                    <select
                      required
                      value={newProductionEntry.operator}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, operator: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Operator</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employee_code} - {emp.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Shift Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Shift</label>
                    <select
                      required
                      value={newProductionEntry.shift}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, shift: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="swing">Swing Shift</option>
                    </select>
                  </div>
                  
                  {/* Date and Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newProductionEntry.entry_datetime}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, entry_datetime: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Quantity Produced */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity Produced</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProductionEntry.quantity_produced}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, quantity_produced: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Quantity Rejected */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity Rejected</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductionEntry.quantity_rejected}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, quantity_rejected: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Downtime Minutes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Downtime (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductionEntry.downtime_minutes}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, downtime_minutes: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Downtime Reason */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Downtime Reason (if any)</label>
                    <input
                      type="text"
                      value={newProductionEntry.downtime_reason}
                      onChange={(e) => setNewProductionEntry({...newProductionEntry, downtime_reason: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                  >
                    Create Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Production Entry Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Bulk Production Entry</h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleBulkCreateEntries} className="p-6 space-y-4">
                <div className="overflow-y-auto max-h-96">
                  {bulkEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-800/30 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-white">Entry {index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeBulkEntryRow(index)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Work Order Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Work Order</label>
                          <select
                            required
                            value={entry.work_order}
                            onChange={(e) => updateBulkEntry(index, 'work_order', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select a Work Order</option>
                            {workOrders.map(wo => (
                              <option key={wo.id} value={wo.id}>
                                {wo.wo_number} - {wo.product_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Equipment Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Equipment</label>
                          <select
                            required
                            value={entry.equipment}
                            onChange={(e) => updateBulkEntry(index, 'equipment', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Equipment</option>
                            {equipment.map(eq => (
                              <option key={eq.id} value={eq.id}>
                                {eq.equipment_code} - {eq.equipment_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Operator Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Operator</label>
                          <select
                            required
                            value={entry.operator}
                            onChange={(e) => updateBulkEntry(index, 'operator', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Operator</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.employee_code} - {emp.full_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Shift Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Shift</label>
                          <select
                            required
                            value={entry.shift}
                            onChange={(e) => updateBulkEntry(index, 'shift', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="day">Day Shift</option>
                            <option value="night">Night Shift</option>
                            <option value="swing">Swing Shift</option>
                          </select>
                        </div>
                        
                        {/* Date and Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={entry.entry_datetime}
                            onChange={(e) => updateBulkEntry(index, 'entry_datetime', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        {/* Quantity Produced */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Quantity Produced</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={entry.quantity_produced}
                            onChange={(e) => updateBulkEntry(index, 'quantity_produced', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        {/* Quantity Rejected */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Quantity Rejected</label>
                          <input
                            type="number"
                            min="0"
                            value={entry.quantity_rejected}
                            onChange={(e) => updateBulkEntry(index, 'quantity_rejected', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        {/* Downtime Minutes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Downtime (minutes)</label>
                          <input
                            type="number"
                            min="0"
                            value={entry.downtime_minutes}
                            onChange={(e) => updateBulkEntry(index, 'downtime_minutes', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        {/* Downtime Reason */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Downtime Reason (if any)</label>
                          <input
                            type="text"
                            value={entry.downtime_reason}
                            onChange={(e) => updateBulkEntry(index, 'downtime_reason', e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={addBulkEntryRow}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Entry</span>
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(false)}
                      className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                    >
                      Create All Entries
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* Production Entry Detail Modal */}
<AnimatePresence>
  {showDetailModal && selectedEntry && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-blue-400" />
            Production Entry Details
          </h3>
          <button
            onClick={() => setShowDetailModal(false)}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header with key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Produced</p>
                  <p className="text-2xl font-bold text-emerald-400">{selectedEntry.quantity_produced}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{selectedEntry.quantity_rejected || 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Quality Rate</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {selectedEntry.quantity_produced + (selectedEntry.quantity_rejected || 0) > 0 
                      ? ((selectedEntry.quantity_produced / (selectedEntry.quantity_produced + (selectedEntry.quantity_rejected || 0))) * 100).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Downtime</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedEntry.downtime_minutes || 0} min</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white border-b border-gray-700/50 pb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-blue-400" />
                Entry Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Date & Time</p>
                  <p className="text-white">{formatDateTime(selectedEntry.entry_datetime)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Shift</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getShiftColor(selectedEntry.shift)}`}>
                    {selectedEntry.shift?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
              
              {selectedEntry.downtime_reason && (
                <div>
                  <p className="text-sm text-gray-400">Downtime Reason</p>
                  <div className="bg-gray-800/50 rounded-xl p-3 mt-1 border border-gray-700/50">
                    <p className="text-white">{selectedEntry.downtime_reason}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white border-b border-gray-700/50 pb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-purple-400" />
                Related Information
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-1">Work Order</p>
                <p className="text-white font-medium">{selectedEntry.work_order_number || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{selectedEntry.work_order?.product_name || 'N/A'}</p>
              </div>
                
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-1">Equipment</p>
                <p className="text-white font-medium">{selectedEntry.equipment_name || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{selectedEntry.equipment?.equipment_code || 'N/A'}</p>
              </div>
                
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-1">Operator</p>
                <p className="text-white font-medium">{selectedEntry.operator_name || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{selectedEntry.operator?.employee_code || 'N/A'}</p>
              </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-700/50 flex justify-end">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default ProductionEntries;