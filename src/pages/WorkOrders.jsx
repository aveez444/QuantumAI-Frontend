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
  ArrowRight, ArrowLeft, Wrench, Cog, AlertOctagon, TrendingDown
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // New work order form state
  const [newWorkOrder, setNewWorkOrder] = useState({
    product: '',
    quantity_planned: '',
    priority: '5',
    due_date: '',
    cost_center: '',
    description: ''
  });
  
  // Data for dropdowns
  const [products, setProducts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: null,
    end: null
  });
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({});
  const [productionSuggestions, setProductionSuggestions] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState({});

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch work orders
      const workOrdersRes = await api.get('api/work-orders/');
      setWorkOrders(workOrdersRes.data.results || workOrdersRes.data);
      
      // Fetch dashboard summary
      const dashboardRes = await api.get('api/work-orders/dashboard_summary/');
      setDashboardStats(dashboardRes.data);
      
      // Fetch production schedule suggestions
      try {
        const suggestionsRes = await api.get('planning/schedule-suggestions/');
        setProductionSuggestions(suggestionsRes.data.equipment_schedule || []);
      } catch (err) {
        console.warn('Could not fetch production suggestions:', err);
      }
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load work orders data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch products for dropdown
      const productsRes = await api.get('api/products/');
      setProducts(productsRes.data.results || productsRes.data);
      
      // Fetch cost centers for dropdown
      const costCentersRes = await api.get('api/cost-centers/');
      setCostCenters(costCentersRes.data.results || costCentersRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  useEffect(() => {
    // Apply filters whenever filters or workOrders change
    let filtered = workOrders;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(wo => wo.priority.toString() === priorityFilter);
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(wo => 
        wo.wo_number.toLowerCase().includes(term) ||
        wo.product_sku.toLowerCase().includes(term) ||
        wo.product_name.toLowerCase().includes(term)
      );
    }
    
    // Date range filter
    if (dateRangeFilter.start && dateRangeFilter.end) {
      filtered = filtered.filter(wo => {
        const dueDate = new Date(wo.due_date);
        return dueDate >= new Date(dateRangeFilter.start) && 
               dueDate <= new Date(dateRangeFilter.end);
      });
    }
    
    setFilteredWorkOrders(filtered);
  }, [workOrders, statusFilter, priorityFilter, searchTerm, dateRangeFilter]);

  const handleViewDetails = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowDetailModal(true);
    
    // Fetch additional details for this work order
    fetchWorkOrderDetails(workOrder.id);
  };

  const fetchWorkOrderDetails = async (workOrderId) => {
    try {
      // Fetch production entries for this work order
      const entriesRes = await api.get(`api/production-entries/?work_order=${workOrderId}`);
      const rawEntries = entriesRes.data.results || entriesRes.data || [];

      // Map entries shape to what UI expects:
      const mappedEntries = rawEntries.map(e => ({
        id: e.id,
        // backend uses entry_datetime — convert to date string for UI
        date: e.entry_datetime || e.entry_date || e.created_at,
        operator_name: e.operator_name || (e.operator && e.operator.full_name) || 'N/A',
        quantity_completed: e.quantity_produced || 0,
        quantity_rejected: e.quantity_rejected || 0,
        hours_worked: e.hours_worked || (e.downtime_minutes ? (60 - (e.downtime_minutes || 0))/60 : 'N/A'),
        equipment_name: e.equipment_name || (e.equipment && e.equipment.equipment_name) || 'N/A',
        notes: e.downtime_reason || ''
      }));

      // Fetch material consumption if available
      try {
        const materialRes = await api.get(`reports/material-consumption/${workOrderId}/`);
        setSelectedWorkOrder(prev => ({
          ...prev,
          production_entries: mappedEntries,
          material_consumption: materialRes.data
        }));
      } catch (err) {
        setSelectedWorkOrder(prev => ({
          ...prev,
          production_entries: mappedEntries
        }));
      }
    } catch (err) {
      console.error('Failed to fetch work order details:', err);
    }
  };


  const handleStatusChange = async (workOrderId, actionType, opts = {}) => {
    /**
     * actionType: one of:
     *  - 'release'           -> POST /api/work-orders/{id}/release/
     *  - 'start'             -> POST /api/work-orders/{id}/start_production/
     *  - 'complete'          -> POST /api/work-orders/{id}/complete_production/
     *  - 'cancel'            -> POST /api/work-orders/{id}/cancel/
     *  - 'patch_status'      -> PATCH /api/work-orders/{id}/  with { status: opts.status }
     *
     * opts: optional payload (e.g. final_quantity_completed)
     */
    try {
      let endpoint = '';
      let method = 'post';
      let data = {};

      if (actionType === 'release') {
        endpoint = `api/work-orders/${workOrderId}/release/`;
      } else if (actionType === 'start') {
        endpoint = `api/work-orders/${workOrderId}/start_production/`;
      } else if (actionType === 'complete') {
        endpoint = `api/work-orders/${workOrderId}/complete_production/`;
        // include optional final qty if provided, otherwise backend will use aggregated value or 0
        if (typeof opts.final_quantity_completed !== 'undefined') {
          data = { final_quantity_completed: opts.final_quantity_completed };
        }
      } else if (actionType === 'cancel') {
        endpoint = `api/work-orders/${workOrderId}/cancel/`;
        if (opts.reason) data.reason = opts.reason;
      } else if (actionType === 'patch_status') {
        endpoint = `api/work-orders/${workOrderId}/`;
        method = 'patch';
        data = { status: opts.status };
      } else {
        console.warn('Unknown actionType', actionType);
        return false;
      }

      // Confirm dangerous actions (start/complete/cancel) with the user
      if (['start', 'complete', 'cancel'].includes(actionType)) {
        const confirmMsg = actionType === 'start'
          ? 'Start production for this work order?'
          : actionType === 'complete'
            ? 'Complete this work order? This will create stock receipts and post GL entries if enabled.'
            : 'Cancel this work order? This will set status to cancelled and prevent further entries.';
        if (!window.confirm(confirmMsg)) return false;
      }

      const response = method === 'post'
        ? await api.post(endpoint, data)
        : await api.patch(endpoint, data);

      // Update local list state by re-fetching the single work order data if backend returned updated object
      // Some endpoints return partial response; to be safe, fetch the updated WO from API
      try {
        const updatedRes = await api.get(`api/work-orders/${workOrderId}/`);
        const updatedWo = updatedRes.data;
        if (response.data) {
          setWorkOrders(prev => prev.map(wo => (wo.id === workOrderId ? response.data : wo)));
        if (selectedWorkOrder && selectedWorkOrder.id === workOrderId) {
          // also re-fetch detail to get fresh production entries, etc.
          fetchWorkOrderDetails(workOrderId);
          setSelectedWorkOrder(updatedWo);
        }
      }
      } catch (err) {
        // fallback: optimistic update based on action
        setWorkOrders(prev => prev.map(wo => {
          if (wo.id !== workOrderId) return wo;
          if (actionType === 'release') return { ...wo, status: 'released' };
          if (actionType === 'start') return { ...wo, status: 'in_progress' };
          if (actionType === 'complete') return { ...wo, status: 'completed', quantity_completed: opts.final_quantity_completed ?? wo.quantity_completed };
          if (actionType === 'cancel') return { ...wo, status: 'cancelled' };
          if (actionType === 'patch_status') return { ...wo, status: opts.status };
          return wo;
        }));
        if (selectedWorkOrder && selectedWorkOrder.id === workOrderId) {
          setSelectedWorkOrder(prev => ({
            ...prev,
            status: actionType === 'release' ? 'released' : actionType === 'start' ? 'in_progress' : actionType === 'complete' ? 'completed' : actionType === 'cancel' ? 'cancelled' : prev.status
          }));
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update work order status:', err);
      alert((err.response && err.response.data && err.response.data.error) || 'Failed to perform action. Check console.');
      return false;
    }
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('api/work-orders/', newWorkOrder);
      
      if (response.data) {
        // Add the new work order to the list
        setWorkOrders(prev => [...prev, response.data]);
        
        // Reset form and close modal
        setNewWorkOrder({
          product: '',
          quantity_planned: '',
          priority: '5',
          due_date: '',
          cost_center: '',
          description: ''
        });
        
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Failed to create work order:', err);
      alert('Failed to create work order. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'released': return 'text-amber-400 bg-amber-400/10';
      case 'planned': return 'text-purple-400 bg-purple-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 3) return 'text-red-400';
    if (priority <= 6) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getPriorityText = (priority) => {
    if (priority <= 3) return 'High';
    if (priority <= 6) return 'Medium';
    return 'Low';
  };

  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyStatus = (workOrder) => {
    const daysRemaining = calculateDaysRemaining(workOrder.due_date);
    
    if (workOrder.status === 'completed') return { status: 'completed', text: 'Completed' };
    if (workOrder.status === 'cancelled') return { status: 'cancelled', text: 'Cancelled' };
    
    if (daysRemaining < 0) return { status: 'overdue', text: `${Math.abs(daysRemaining)} days overdue` };
    if (daysRemaining === 0) return { status: 'due-today', text: 'Due today' };
    if (daysRemaining <= 2) return { status: 'urgent', text: `${daysRemaining} days remaining` };
    if (daysRemaining <= 7) return { status: 'approaching', text: `${daysRemaining} days remaining` };
    
    return { status: 'on-track', text: `${daysRemaining} days remaining` };
  };

  const getUrgencyColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-400 bg-red-400/10';
      case 'due-today': return 'text-amber-400 bg-amber-400/10';
      case 'urgent': return 'text-orange-400 bg-orange-400/10';
      case 'approaching': return 'text-blue-400 bg-blue-400/10';
      case 'on-track': return 'text-emerald-400 bg-emerald-400/10';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'cancelled': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
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
                Production Center
              </motion.h1>
              <p className="text-gray-400 mt-1">Work Orders & Production Management</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Work Order</span>
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
                  <p className="text-sm text-gray-400">Total Work Orders</p>
                  <p className="text-2xl font-bold text-white">{dashboardStats.total_work_orders || workOrders.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {dashboardStats.in_progress_orders || workOrders.filter(wo => wo.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {dashboardStats.completed_today || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-red-400">
                    {dashboardStats.overdue || workOrders.filter(wo => {
                      const daysRemaining = calculateDaysRemaining(wo.due_date);
                      return daysRemaining < 0 && wo.status !== 'completed';
                    }).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Production Insights */}
          {productionSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-400" />
                Production Schedule Suggestions
                <span className="ml-2 text-sm text-gray-400">AI-powered recommendations</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productionSuggestions.slice(0, 3).map((equipment, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{equipment.equipment_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        equipment.available_capacity_pct > 30 ? 'bg-emerald-500/10 text-emerald-400' :
                        equipment.available_capacity_pct > 15 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {equipment.available_capacity_pct.toFixed(0)}% available
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {equipment.recommended_orders.slice(0, 2).map((order, orderIndex) => (
                        <div key={orderIndex} className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">{order.product_sku}</span>
                            <span className="text-white">{order.estimated_hours}h</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(order.urgency_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {equipment.recommended_orders.length > 2 && (
                      <p className="text-xs text-gray-400 mt-2">
                        +{equipment.recommended_orders.length - 2} more orders recommended
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="planned">Planned</option>
                  <option value="released">Released</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="1">Priority 1 (Highest)</option>
                  <option value="2">Priority 2</option>
                  <option value="3">Priority 3</option>
                  <option value="4">Priority 4</option>
                  <option value="5">Priority 5 (Medium)</option>
                  <option value="6">Priority 6</option>
                  <option value="7">Priority 7</option>
                  <option value="8">Priority 8</option>
                  <option value="9">Priority 9</option>
                  <option value="10">Priority 10 (Lowest)</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={dateRangeFilter.start || ''}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={dateRangeFilter.end || ''}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Sort Options */}
              <div>
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => {
                    // Implement sorting logic here
                  }}
                >
                  <option value="due_date">Sort by: Due Date</option>
                  <option value="priority">Sort by: Priority</option>
                  <option value="status">Sort by: Status</option>
                  <option value="completion">Sort by: Completion %</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Work Orders
                <span className="ml-2 text-sm text-gray-400">({filteredWorkOrders.length} orders)</span>
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
            
            {filteredWorkOrders.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No work orders found</h3>
                <p className="text-gray-500">Create a new work order or try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Work Order #</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Priority</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Progress</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Timeline</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkOrders.map((workOrder, index) => {
                      const urgency = getUrgencyStatus(workOrder);
                      const completionPercentage = workOrder && workOrder.quantity_planned > 0 ? 
                        Math.min((workOrder.quantity_completed / workOrder.quantity_planned) * 100, 100) : 0;
                                            
                      return (
                        <motion.tr 
                          key={workOrder.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{workOrder.wo_number}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {workOrder.cost_center_name || 'No cost center'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-white">{workOrder.product_name}</div>
                              <div className="text-sm text-gray-400 font-mono">{workOrder.product_sku}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">
                              {workOrder.quantity_completed || 0} / {workOrder.quantity_planned}
                            </div>
                            <div className="text-xs text-gray-400">
                              {workOrder.quantity_scrapped || 0} scrapped
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{formatDate(workOrder.due_date)}</div>
                            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getUrgencyColor(urgency.status)}`}>
                              {urgency.text}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`flex items-center ${getPriorityColor(workOrder.priority)}`}>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              <span className="text-sm">{getPriorityText(workOrder.priority)}</span>
                              <span className="text-xs ml-1">({workOrder.priority})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                                  style={{ width: `${completionPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-white">{completionPercentage.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs text-gray-400">
                              Created: {formatDate(workOrder.created_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetails(workOrder)}
                                className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>

                              {/* Planned -> Release */}
                              {workOrder.status === 'planned' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'release')}
                                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
                                    title="Release Work Order"
                                  >
                                    <Package className="w-4 h-4 text-amber-400" />
                                  </button>

                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'cancel')}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Cancel Work Order"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}

                              {/* Released -> Start */}
                              {workOrder.status === 'released' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'start')}
                                    className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                                    title="Start Production"
                                  >
                                    <Play className="w-4 h-4 text-blue-400" />
                                  </button>

                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'cancel')}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Cancel Work Order"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}

                              {/* In Progress -> Complete / Cancel */}
                              {workOrder.status === 'in_progress' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'complete', { final_quantity_completed: workOrder.quantity_completed || 0 })}
                                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                    title="Complete Order"
                                  >
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  </button>

                                  <button
                                    onClick={() => handleStatusChange(workOrder.id, 'cancel')}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Cancel Work Order"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}

                              {/* Completed / Cancelled: only small actions (e.g. download or view) */}
                              {(workOrder.status === 'completed' || workOrder.status === 'cancelled') && (
                                <button
                                  onClick={() => {/* maybe open stock receipt or journal if you add links */}}
                                  className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                                  title={workOrder.status === 'completed' ? 'Completed' : 'Cancelled'}
                                >
                                  <Info className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
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
                Work Order Status Distribution
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {['planned', 'released', 'in_progress', 'completed', 'cancelled'].map(status => {
                  const count = workOrders.filter(wo => wo.status === status).length;
                  const percentage = workOrders.length > 0 ? (count / workOrders.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gray-600"></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                          style={{ width: `${Math.min(selectedWorkOrder?.completion_percentage ?? 0, 100)}%` }}
                        />

                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                Production Efficiency
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Average Completion Rate</span>
                    <span className="text-white font-medium">
                      {dashboardStats.avg_completion_rate ? `${dashboardStats.avg_completion_rate.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{ width: `${dashboardStats.avg_completion_rate || 0}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Total Planned Quantity</span>
                    <span className="text-white font-medium">{dashboardStats.total_planned_qty || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Total Completed Quantity</span>
                    <span className="text-white font-medium">{dashboardStats.total_completed_qty || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      style={{ width: `${dashboardStats.total_completed_qty && dashboardStats.total_planned_qty ? 
                        (dashboardStats.total_completed_qty / dashboardStats.total_planned_qty) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Work Order Modal */}
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
                <h3 className="text-xl font-semibold text-white">Create New Work Order</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateWorkOrder} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Product</label>
                    <select
                      required
                      value={newWorkOrder.product}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, product: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Cost Center Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cost Center</label>
                    <select
                      required
                      value={newWorkOrder.cost_center}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, cost_center: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Cost Center</option>
                      {costCenters.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.code} - {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Planned Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newWorkOrder.quantity_planned}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, quantity_planned: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                    <select
                      value={newWorkOrder.priority}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, priority: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">1 - Highest</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5 - Medium</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10 - Lowest</option>
                    </select>
                  </div>
                  
                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newWorkOrder.due_date}
                      onChange={(e) => setNewWorkOrder({...newWorkOrder, due_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newWorkOrder.description}
                    onChange={(e) => setNewWorkOrder({...newWorkOrder, description: e.target.value})}
                    rows="3"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                  >
                    Create Work Order
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* Work Order Detail Modal */}
<AnimatePresence>
  {showDetailModal && selectedWorkOrder && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800/70 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-gray-800/70 flex justify-between items-center sticky top-0 bg-gray-900/90 backdrop-blur-xl z-10">
          <div>
            <h3 className="text-xl font-bold text-white">
              {selectedWorkOrder.wo_number}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{selectedWorkOrder.product_name}</p>
          </div>
          <button
            onClick={() => setShowDetailModal(false)}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border ${getStatusColor(selectedWorkOrder.status).replace('text', 'border').replace('bg', 'border')} bg-gradient-to-r ${getStatusColor(selectedWorkOrder.status).includes('emerald') ? 'from-emerald-900/20 to-emerald-800/10' : 
            getStatusColor(selectedWorkOrder.status).includes('blue') ? 'from-blue-900/20 to-blue-800/10' : 
            getStatusColor(selectedWorkOrder.status).includes('amber') ? 'from-amber-900/20 to-amber-800/10' : 
            getStatusColor(selectedWorkOrder.status).includes('purple') ? 'from-purple-900/20 to-purple-800/10' : 
            'from-gray-900/20 to-gray-800/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getStatusColor(selectedWorkOrder.status)} bg-opacity-20 mr-3`}>
                  {selectedWorkOrder.status === 'completed' ? <CheckSquare className="w-5 h-5" /> :
                   selectedWorkOrder.status === 'in_progress' ? <Activity className="w-5 h-5" /> :
                   selectedWorkOrder.status === 'released' ? <Package className="w-5 h-5" /> :
                   selectedWorkOrder.status === 'planned' ? <Calendar className="w-5 h-5" /> :
                   <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-white capitalize">{selectedWorkOrder.status.replace('_', ' ')}</h4>
                  <p className="text-sm text-gray-300">
                    {selectedWorkOrder.status === 'completed' ? 'Order completed successfully' :
                     selectedWorkOrder.status === 'in_progress' ? 'Production in progress' :
                     selectedWorkOrder.status === 'released' ? 'Ready for production' :
                     selectedWorkOrder.status === 'planned' ? 'Scheduled for production' :
                     'Order has been cancelled'}
                  </p>
                </div>
              </div>
              
              {/* Status action buttons */}
              <div className="flex space-x-2">
                {selectedWorkOrder.status === 'planned' && (
                  <button
                    onClick={() => handleStatusChange(selectedWorkOrder.id, 'release')}
                    className="flex items-center text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Release
                  </button>
                )}

                {selectedWorkOrder.status === 'released' && (
                  <button
                    onClick={() => handleStatusChange(selectedWorkOrder.id, 'start')}
                    className="flex items-center text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </button>
                )}

                {selectedWorkOrder.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(selectedWorkOrder.id, 'complete', { final_quantity_completed: selectedWorkOrder.quantity_completed || 0 })}
                    className="flex items-center text-sm bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Complete
                  </button>
                )}

                {selectedWorkOrder.status !== 'completed' && selectedWorkOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedWorkOrder.id, 'cancel')}
                    className="flex items-center text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800/50 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{selectedWorkOrder.quantity_planned}</div>
              <div className="text-sm text-gray-400">Planned</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800/50 text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">{selectedWorkOrder.quantity_completed || 0}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800/50 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{selectedWorkOrder.quantity_scrapped || 0}</div>
              <div className="text-sm text-gray-400">Scrapped</div>
            </div>
          </div>
          
          {/* Progress Ring Visualization */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#333"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(selectedWorkOrder.completion_percentage || 0, 100)}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {Math.min(selectedWorkOrder.completion_percentage || 0, 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">Order Details</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Work Order #</span>
                  <span className="text-white">{selectedWorkOrder.wo_number}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Priority</span>
                  <span className={`flex items-center ${getPriorityColor(selectedWorkOrder.priority)} font-medium`}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getPriorityText(selectedWorkOrder.priority)} ({selectedWorkOrder.priority})
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Due Date</span>
                  <span className="text-white">{formatDate(selectedWorkOrder.due_date)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Created On</span>
                  <span className="text-white">{formatDate(selectedWorkOrder.created_at)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Cost Center</span>
                  <span className="text-white">{selectedWorkOrder.cost_center_name || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">Timeline & Progress</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{formatDate(selectedWorkOrder.created_at)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">{formatDate(selectedWorkOrder.updated_at)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-gray-400">Due Date</span>
                  <span className="text-white">{formatDate(selectedWorkOrder.due_date)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Days Remaining</span>
                  <span className={`${getUrgencyColor(getUrgencyStatus(selectedWorkOrder).status)} px-2 py-0.5 rounded-full text-xs`}>
                    {getUrgencyStatus(selectedWorkOrder).text}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Close
            </button>
            
            {selectedWorkOrder.status === 'in_progress' && (
              <button
                onClick={() => {
                  // Implement production entry creation
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all"
              >
                Add Production Entry
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default WorkOrders;