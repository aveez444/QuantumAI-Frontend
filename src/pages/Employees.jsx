import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, User,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  TrendingUp, AlertCircle, Users as UsersIcon, Target, Calendar as CalendarIcon,
  BarChart2, PieChart, Activity, FileText, Clock as ClockIcon,
  ArrowRight, ArrowLeft, Wrench, Cog, AlertOctagon, TrendingDown,
  Briefcase, Award, Clock, Star, UserCheck, UserX, BarChart,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, 
  Download as DownloadIcon, Filter as FilterIcon, X
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

// Production History Modal Component
const ProductionHistoryModal = ({ employee, isOpen, onClose }) => {
  const [productionData, setProductionData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    if (isOpen && employee) {
      fetchProductionData();
    }
  }, [isOpen, employee, dateRange]);

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      // Fetch productivity data for this employee with date range
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);
      
      const response = await api.get(`api/employees/${employee.id}/employee_productivity/?${params}`);
      
      if (response.data) {
        setSummaryData(response.data.summary);
        setProductionData(response.data.production_entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch production data:', error);
      // Set default empty data on error
      setSummaryData({
        total_produced: 0,
        quality_rate: 0,
        avg_hourly_output: 0,
        total_downtime_minutes: 0
      });
      setProductionData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDefaultRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setDateRange({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const exportData = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Work Order', 'Equipment', 'Produced', 'Rejected', 'Downtime (min)', 'Efficiency (%)', 'Shift'].join(','),
      ...productionData.map(entry => [
        new Date(entry.entry_datetime).toLocaleDateString(),
        entry.work_order_number || 'N/A',
        entry.equipment_name || 'N/A',
        entry.quantity_produced,
        entry.quantity_rejected,
        entry.downtime_minutes,
        entry.efficiency_percentage,
        entry.shift || 'N/A'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employee.employee_code}_production_history.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-700/50 flex justify-between items-center sticky top-0 bg-gray-800/80 backdrop-blur-xl">
            <div>
              <h3 className="text-xl font-semibold text-white">Production History</h3>
              <p className="text-gray-400 text-sm">{employee.full_name} ({employee.employee_code})</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Date Range Filter */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FilterIcon className="w-5 h-5 mr-2 text-blue-400" />
                Filter by Date Range
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={fetchProductionData}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all text-sm"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyDefaultRange(7)}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => applyDefaultRange(30)}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => applyDefaultRange(90)}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs transition-colors"
                >
                  Last 90 Days
                </button>
                <button
                  onClick={() => setDateRange({ start_date: '', end_date: '' })}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs transition-colors"
                >
                  All Time
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {summaryData && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-400">Total Produced</p>
                          <p className="text-2xl font-bold text-white">
                            {summaryData.total_produced}
                            <span className="text-sm font-normal text-gray-400 ml-1">units</span>
                          </p>
                        </div>
                        <TrendingUpIcon className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-400">Quality Rate</p>
                          <p className="text-2xl font-bold text-white">
                            {summaryData.quality_rate?.toFixed(1) || 0}%
                          </p>
                        </div>
                        <BarChart className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-400">Avg. Hourly Output</p>
                          <p className="text-2xl font-bold text-white">
                            {summaryData.avg_hourly_output?.toFixed(1) || 0}
                            <span className="text-sm font-normal text-gray-400 ml-1">units/hr</span>
                          </p>
                        </div>
                        <Activity className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-400">Total Downtime</p>
                          <p className="text-2xl font-bold text-white">
                            {formatDuration(summaryData.total_downtime_minutes || 0)}
                          </p>
                        </div>
                        <ClockIcon className="w-5 h-5 text-red-400" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Production Entries Table */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-400" />
                      Production Entries
                      <span className="ml-2 text-sm text-gray-400">({productionData.length} entries)</span>
                    </h4>
                    
                    <button 
                      onClick={exportData}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                  
                  {productionData.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No production entries found</h3>
                      <p className="text-gray-500">No production data available for the selected date range</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date & Time</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Work Order</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Equipment</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Produced</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Rejected</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Downtime</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Efficiency</th>
                            <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Shift</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productionData.map((entry, index) => (
                            <motion.tr 
                              key={entry.id || index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                            >
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">
                                  {new Date(entry.entry_datetime).toLocaleDateString()} 
                                  <span className="text-gray-400 block text-xs">
                                    {new Date(entry.entry_datetime).toLocaleTimeString()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">{entry.work_order_number || 'N/A'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">{entry.equipment_name || 'N/A'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm font-medium">{entry.quantity_produced}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-red-400 text-sm">{entry.quantity_rejected}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">{entry.downtime_minutes} min</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">
                                  <span className={`${entry.efficiency_percentage >= 90 ? 'text-emerald-400' : 
                                    entry.efficiency_percentage >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {entry.efficiency_percentage}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm capitalize">{entry.shift || 'N/A'}</div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Employees Component
const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Production History Modal states
  const [showProductionHistory, setShowProductionHistory] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState(null);
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    employee_code: '',
    full_name: '',
    department: '',
    designation: '',
    cost_center: '',
    hourly_rate: '',
    skill_level: '1',
    hire_date: new Date().toISOString().split('T')[0]
  });

  // Edit employee form state
  const [editEmployee, setEditEmployee] = useState({});
  
  // Data for dropdowns
  const [costCenters, setCostCenters] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  
  // Dashboard data
  const [employeeStats, setEmployeeStats] = useState({});

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department))].filter(dept => dept);

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch employees
      const employeesRes = await api.get('api/employees/');
      setEmployees(employeesRes.data.results || employeesRes.data);
      
      // Fetch productivity report
      try {
        const productivityRes = await api.get('api/employees/productivity_report/');
        setProductivityData(productivityRes.data.employee_productivity || []);
      } catch (err) {
        console.warn('Could not fetch productivity data:', err);
      }
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load employees data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch cost centers for dropdown
      const costCentersRes = await api.get('api/cost-centers/');
      setCostCenters(costCentersRes.data.results || costCentersRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  useEffect(() => {
    // Apply filters whenever filters or employees change
    let filtered = employees;
    
    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    // Skill level filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(emp => emp.skill_level.toString() === skillFilter);
    }
    
    // Cost center filter
    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(emp => emp.cost_center && emp.cost_center.toString() === costCenterFilter);
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employee_code.toLowerCase().includes(term) ||
        emp.full_name.toLowerCase().includes(term) ||
        (emp.department && emp.department.toLowerCase().includes(term)) ||
        (emp.designation && emp.designation.toLowerCase().includes(term))
      );
    }
    
    setFilteredEmployees(filtered);

    // Calculate stats
    calculateStats(filtered);
  }, [employees, departmentFilter, skillFilter, costCenterFilter, searchTerm]);

  const calculateStats = (employeesList) => {
    const total = employeesList.length;
    const byDepartment = {};
    const bySkill = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    employeesList.forEach(emp => {
      // Count by department
      if (emp.department) {
        byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
      }
      
      // Count by skill level
      if (emp.skill_level) {
        const level = Math.min(Math.max(1, Math.floor(emp.skill_level)), 5);
        bySkill[level] = (bySkill[level] || 0) + 1;
      }
    });
    
    setEmployeeStats({
      total,
      byDepartment,
      bySkill
    });
  };

  const handleViewDetails = async (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
    
    // Fetch additional productivity data for this employee
    try {
      const productivityRes = await api.get(`api/employees/productivity_report/?employee_id=${employee.id}`);
      if (productivityRes.data && productivityRes.data.employee_productivity) {
        const empProductivity = productivityRes.data.employee_productivity.find(
          item => item.employee_id === employee.id
        );
        setSelectedEmployee(prev => ({
          ...prev,
          productivity: empProductivity
        }));
      }
    } catch (err) {
      console.error('Failed to fetch employee productivity:', err);
    }
  };

  const handleViewProductionHistory = (employee) => {
    setSelectedEmployeeForHistory(employee);
    setShowProductionHistory(true);
    setShowDetailModal(false); // Close the detail modal
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('api/employees/', newEmployee);
      
      if (response.data) {
        // Add the new employee to the list
        setEmployees(prev => [...prev, response.data]);
        
        // Reset form and close modal
        setNewEmployee({
          employee_code: '',
          full_name: '',
          department: '',
          designation: '',
          cost_center: '',
          hourly_rate: '',
          skill_level: '1',
          hire_date: new Date().toISOString().split('T')[0]
        });
        
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Failed to create employee:', err);
      alert('Failed to create employee. Please try again.');
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`api/employees/${editEmployee.id}/`, editEmployee);
      
      if (response.data) {
        // Update the employee in the list
        setEmployees(prev => prev.map(emp => 
          emp.id === editEmployee.id ? response.data : emp
        ));
        
        // Update selected employee if it's the same
        if (selectedEmployee && selectedEmployee.id === editEmployee.id) {
          setSelectedEmployee(response.data);
        }
        
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Failed to update employee:', err);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      await api.delete(`api/employees/${employeeId}/`);
      
      // Remove the employee from the list
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      // Close detail modal if it's open for this employee
      if (selectedEmployee && selectedEmployee.id === employeeId) {
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const openEditModal = (employee) => {
    setEditEmployee({...employee});
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSkillLevelText = (level) => {
    switch(parseInt(level)) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getSkillLevelColor = (level) => {
    switch(parseInt(level)) {
      case 1: return 'text-red-400';
      case 2: return 'text-orange-400';
      case 3: return 'text-yellow-400';
      case 4: return 'text-blue-400';
      case 5: return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getCostCenterName = (costCenterId) => {
    if (!costCenterId) return 'N/A';
    const center = costCenters.find(cc => cc.id === costCenterId);
    return center ? `${center.cost_center_code} - ${center.name}` : 'N/A';
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
                Employee Management
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage workforce and productivity</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Employee</span>
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
                  <p className="text-sm text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-white">{employeeStats.total || 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <UsersIcon className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {Object.keys(employeeStats.byDepartment || {}).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg. Skill Level</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {employeeStats.total ? 
                      (Object.entries(employeeStats.bySkill || {}).reduce((sum, [level, count]) => 
                        sum + (parseInt(level) * count), 0) / employeeStats.total
                      ).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active This Week</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {productivityData.filter(emp => emp.hours_worked > 0).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              {/* Skill Level Filter */}
              <div>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Skill Levels</option>
                  <option value="1">Beginner (1)</option>
                  <option value="2">Basic (2)</option>
                  <option value="3">Intermediate (3)</option>
                  <option value="4">Advanced (4)</option>
                  <option value="5">Expert (5)</option>
                </select>
              </div>
              
              {/* Cost Center Filter */}
              <div>
                <select
                  value={costCenterFilter}
                  onChange={(e) => setCostCenterFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Cost Centers</option>
                  {costCenters.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.cost_center_code} - {center.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Options */}
              <div>
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => {
                    // Implement sorting logic here
                  }}
                >
                  <option value="employee_code">Sort by: Employee Code</option>
                  <option value="full_name">Sort by: Name</option>
                  <option value="department">Sort by: Department</option>
                  <option value="skill_level">Sort by: Skill Level</option>
                  <option value="hire_date">Sort by: Hire Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Employees
                <span className="ml-2 text-sm text-gray-400">({filteredEmployees.length} employees)</span>
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
            
            {filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No employees found</h3>
                <p className="text-gray-500">Create a new employee or try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Employee Code</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Designation</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Cost Center</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Skill Level</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Hourly Rate</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Hire Date</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee, index) => (
                      <motion.tr 
                        key={employee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{employee.employee_code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{employee.full_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{employee.department || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{employee.designation || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{getCostCenterName(employee.cost_center)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center ${getSkillLevelColor(employee.skill_level)}`}>
                            <Star className="w-3 h-3 mr-1" />
                            <span className="text-sm">
                              {getSkillLevelText(employee.skill_level)} ({employee.skill_level})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {employee.hourly_rate || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{formatDate(employee.hire_date)}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(employee)}
                              className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            <button
                              onClick={() => handleViewProductionHistory(employee)}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Production History"
                            >
                              <BarChart3 className="w-4 h-4 text-green-400" />
                            </button>
                            
                            <button
                              onClick={() => openEditModal(employee)}
                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Edit Employee"
                            >
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
                Department Distribution
              </h3>
              
              <div className="space-y-3">
                {Object.entries(employeeStats.byDepartment || {}).map(([dept, count]) => {
                  const percentage = employeeStats.total > 0 ? (count / employeeStats.total) * 100 : 0;
                  
                  return (
                    <div key={dept} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{dept}</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                            style={{ width: `${percentage}%` }}
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
                Skill Level Distribution
              </h3>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(level => {
                  const count = employeeStats.bySkill ? employeeStats.bySkill[level] || 0 : 0;
                  const percentage = employeeStats.total > 0 ? (count / employeeStats.total) * 100 : 0;
                  
                  return (
                    <div key={level} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getSkillLevelColor(level).replace('text', 'bg')}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{getSkillLevelText(level)}</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{ width: `${percentage}%` }}
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

      {/* Create Employee Modal */}
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
                <h3 className="text-xl font-semibold text-white">Create New Employee</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Employee Code</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.employee_code}
                      onChange={(e) => setNewEmployee({...newEmployee, employee_code: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.full_name}
                      onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Designation</label>
                    <input
                      type="text"
                      value={newEmployee.designation}
                      onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Cost Center */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cost Center</label>
                    <select
                      value={newEmployee.cost_center}
                      onChange={(e) => setNewEmployee({...newEmployee, cost_center: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Cost Center</option>
                      {costCenters.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.cost_center_code} - {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEmployee.hourly_rate}
                      onChange={(e) => setNewEmployee({...newEmployee, hourly_rate: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Skill Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Skill Level</label>
                    <select
                      value={newEmployee.skill_level}
                      onChange={(e) => setNewEmployee({...newEmployee, skill_level: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">Beginner (1)</option>
                      <option value="2">Basic (2)</option>
                      <option value="3">Intermediate (3)</option>
                      <option value="4">Advanced (4)</option>
                      <option value="5">Expert (5)</option>
                    </select>
                  </div>
                  
                  {/* Hire Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hire Date</label>
                    <input
                      type="date"
                      value={newEmployee.hire_date}
                      onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                  >
                    Create Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {showEditModal && (
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
                <h3 className="text-xl font-semibold text-white">Edit Employee</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleEditEmployee} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Employee Code</label>
                    <input
                      type="text"
                      required
                      value={editEmployee.employee_code || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, employee_code: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editEmployee.full_name || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, full_name: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={editEmployee.department || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, department: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editEmployee.designation || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, designation: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Cost Center */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cost Center</label>
                    <select
                      value={editEmployee.cost_center || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, cost_center: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a Cost Center</option>
                      {costCenters.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.cost_center_code} - {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editEmployee.hourly_rate || ''}
                      onChange={(e) => setEditEmployee({...editEmployee, hourly_rate: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Skill Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Skill Level</label>
                    <select
                      value={editEmployee.skill_level || '1'}
                      onChange={(e) => setEditEmployee({...editEmployee, skill_level: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">Beginner (1)</option>
                      <option value="2">Basic (2)</option>
                      <option value="3">Intermediate (3)</option>
                      <option value="4">Advanced (4)</option>
                      <option value="5">Expert (5)</option>
                    </select>
                  </div>
                  
                  {/* Hire Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hire Date</label>
                    <input
                      type="date"
                      value={editEmployee.hire_date ? new Date(editEmployee.hire_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditEmployee({...editEmployee, hire_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                  >
                    Update Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

   {/* Employee Detail Modal */}
   <AnimatePresence>
        {showDetailModal && selectedEmployee && (
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
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center sticky top-0 bg-gray-800/80 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white">Employee Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Employee Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedEmployee.full_name}</h2>
                        <p className="text-gray-400">{selectedEmployee.employee_code}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Department</p>
                        <p className="text-white font-medium">{selectedEmployee.department || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Designation</p>
                        <p className="text-white font-medium">{selectedEmployee.designation || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Cost Center</p>
                        <p className="text-white font-medium">{getCostCenterName(selectedEmployee.cost_center)}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Hire Date</p>
                        <p className="text-white font-medium">{formatDate(selectedEmployee.hire_date)}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Hourly Rate</p>
                        <p className="text-white font-medium flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {selectedEmployee.hourly_rate || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-400">Skill Level</p>
                        <p className={`font-medium flex items-center ${getSkillLevelColor(selectedEmployee.skill_level)}`}>
                          <Star className="w-4 h-4 mr-1" />
                          {getSkillLevelText(selectedEmployee.skill_level)} ({selectedEmployee.skill_level})
                        </p>
                      </div>
                    </div>
                    
                    {/* Productivity Data */}
                    {selectedEmployee.productivity && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-purple-400" />
                          Productivity Metrics
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                            <p className="text-sm text-blue-400">Total Hours Worked</p>
                            <p className="text-white font-medium text-xl">
                              {selectedEmployee.productivity.hours_worked || 0}
                              <span className="text-sm text-gray-400 ml-1">hours</span>
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                            <p className="text-sm text-purple-400">Work Orders Completed</p>
                            <p className="text-white font-medium text-xl">
                              {selectedEmployee.productivity.work_orders_completed || 0}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/20">
                            <p className="text-sm text-emerald-400">Average Efficiency</p>
                            <p className="text-white font-medium text-xl">
                              {selectedEmployee.productivity.avg_efficiency || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions and Stats */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Actions</h4>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            openEditModal(selectedEmployee);
                          }}
                          className="w-full flex items-center space-x-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                          <span className="text-white">Edit Employee</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                          className="w-full flex items-center space-x-2 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="text-white">Delete Employee</span>
                        </button>
                        
                        <button 
                          onClick={() => handleViewProductionHistory(selectedEmployee)}
                          className="w-full flex items-center space-x-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-white">View Production History</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                          <p className="text-sm text-gray-300">Employee created</p>
                          <p className="text-xs text-gray-500 ml-auto">{formatDate(selectedEmployee.created_at)}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                          <p className="text-sm text-gray-300">Last updated</p>
                          <p className="text-xs text-gray-500 ml-auto">{formatDate(selectedEmployee.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Production History Modal */}
      <ProductionHistoryModal 
        employee={selectedEmployeeForHistory}
        isOpen={showProductionHistory}
        onClose={() => setShowProductionHistory(false)}
      />
    </div>
  );
};

export default Employees;