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
  User, Settings, ClipboardList, TrendingUp as TrendingUpIcon,
  MapPin, HardDrive, Hammer, AlertCircle as AlertCircleIcon
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    equipment_code: '',
    equipment_name: '',
    location: '',
    capacity_per_hour: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    last_maintenance: '',
    next_maintenance: ''
  });
  
  // Maintenance form state
  const [maintenanceData, setMaintenanceData] = useState({
    maintenance_date: new Date().toISOString().split('T')[0],
    next_maintenance_date: '',
    maintenance_type: 'routine',
    description: '',
    cost: ''
  });
  
  // Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dashboard data
  const [equipmentStats, setEquipmentStats] = useState({});
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch equipment
      const equipmentRes = await api.get('api/equipment/');
      setEquipment(equipmentRes.data.results || equipmentRes.data);
      
      // Fetch maintenance schedule
      const maintenanceRes = await api.get('api/equipment/maintenance_schedule/');
      setMaintenanceSchedule(maintenanceRes.data);
      
      // Calculate equipment stats
      calculateEquipmentStats(equipmentRes.data.results || equipmentRes.data);
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEquipmentStats = (equipmentList) => {
    const today = new Date();
    const overdueMaintenance = equipmentList.filter(eq => 
      eq.next_maintenance && new Date(eq.next_maintenance) < today
    ).length;
    
    const maintenanceDueSoon = equipmentList.filter(eq => 
      eq.next_maintenance && 
      new Date(eq.next_maintenance) >= today && 
      new Date(eq.next_maintenance) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const activeEquipment = equipmentList.filter(eq => eq.is_active).length;
    
    setEquipmentStats({
      total_equipment: equipmentList.length,
      active_equipment: activeEquipment,
      overdue_maintenance: overdueMaintenance,
      maintenance_due_soon: maintenanceDueSoon,
      maintenance_compliance: equipmentList.length > 0 ? 
        ((equipmentList.length - overdueMaintenance) / equipmentList.length) * 100 : 0
    });
  };

  useEffect(() => {
    // Apply filters whenever filters or equipment change
    let filtered = equipment;
    
    // Search filter
    if (searchFilter) {
      filtered = filtered.filter(eq => 
        eq.equipment_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
        eq.equipment_name.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    
    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(eq => eq.location === locationFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      const today = new Date();
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(eq => 
          eq.next_maintenance && new Date(eq.next_maintenance) < today
        );
      } else if (statusFilter === 'due_soon') {
        filtered = filtered.filter(eq => 
          eq.next_maintenance && 
          new Date(eq.next_maintenance) >= today && 
          new Date(eq.next_maintenance) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        );
      } 
    }
    
    setFilteredEquipment(filtered);
  }, [equipment, searchFilter, locationFilter, statusFilter]);

  const handleViewDetails = (equip) => {
    setSelectedEquipment(equip);
    setShowDetailModal(true);
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('api/equipment/', newEquipment);
      
      if (response.data) {
        // Add the new equipment to the list
        setEquipment(prev => [...prev, response.data]);
        
        // Reset form and close modal
        setNewEquipment({
          equipment_code: '',
          equipment_name: '',
          location: '',
          capacity_per_hour: '',
          acquisition_date: new Date().toISOString().split('T')[0],
          last_maintenance: '',
          next_maintenance: ''
        });
        
        setShowCreateModal(false);
        
        // Refresh data
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create equipment:', err);
      alert('Failed to create equipment. Please try again.');
    }
  };

  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.patch(`api/equipment/${selectedEquipment.id}/`, {
        last_maintenance: maintenanceData.maintenance_date,
        next_maintenance: maintenanceData.next_maintenance_date
      });
      
      if (response.data) {
        // Update the equipment in the list
        setEquipment(prev => 
          prev.map(eq => eq.id === selectedEquipment.id ? response.data : eq)
        );
        
        // Reset form and close modal
        setMaintenanceData({
          maintenance_date: new Date().toISOString().split('T')[0],
          next_maintenance_date: '',
          maintenance_type: 'routine',
          description: '',
          cost: ''
        });
        
        setShowMaintenanceModal(false);
        setShowDetailModal(false);
        
        // Refresh data
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update maintenance:', err);
      alert('Failed to update maintenance. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMaintenanceStatus = (nextMaintenance) => {
    if (!nextMaintenance) return { status: 'unknown', color: 'text-gray-400 bg-gray-400/10', label: 'No Schedule' };
    
    const today = new Date();
    const nextDate = new Date(nextMaintenance);
    
    if (nextDate < today) {
      return { status: 'overdue', color: 'text-red-400 bg-red-400/10', label: 'Overdue' };
    } else if (nextDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      return { status: 'due_soon', color: 'text-amber-400 bg-amber-400/10', label: 'Due Soon' };
    } else {
      return { status: 'scheduled', color: 'text-emerald-400 bg-emerald-400/10', label: 'Scheduled' };
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'text-emerald-400 bg-emerald-400/10' 
      : 'text-gray-400 bg-gray-400/10';
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
                Equipment Management
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage production equipment and maintenance schedules</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Equipment</span>
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
                  <p className="text-sm text-gray-400">Total Equipment</p>
                  <p className="text-2xl font-bold text-white">{equipmentStats.total_equipment || 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Equipment</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {equipmentStats.active_equipment || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overdue Maintenance</p>
                  <p className="text-2xl font-bold text-red-400">
                    {equipmentStats.overdue_maintenance || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircleIcon className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Maintenance Compliance</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {equipmentStats.maintenance_compliance ? `${equipmentStats.maintenance_compliance.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Hammer className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          {maintenanceSchedule.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-400" />
                Maintenance Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenanceSchedule.slice(0, 6).map((equip, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{equip.equipment_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getMaintenanceStatus(equip.next_maintenance).color}`}>
                        {getMaintenanceStatus(equip.next_maintenance).label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {equip.location || 'No location specified'}
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Maintenance</span>
                        <span className="text-white">{formatDate(equip.last_maintenance)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Next Maintenance</span>
                        <span className="text-white">{formatDate(equip.next_maintenance)}</span>
                      </div>
                      
                      {equip.next_maintenance && (
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              getMaintenanceStatus(equip.next_maintenance).status === 'overdue' ? 'bg-red-500' :
                              getMaintenanceStatus(equip.next_maintenance).status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} 
                            style={{ 
                              width: `${Math.min(
                                (new Date() - new Date(equip.last_maintenance || equip.acquisition_date)) / 
                                (new Date(equip.next_maintenance) - new Date(equip.last_maintenance || equip.acquisition_date)) * 100, 
                                100
                              )}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search equipment by code or name..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Location Filter */}
              <div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Locations</option>
                  {[...new Set(equipment.map(eq => eq.location).filter(Boolean))].map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="overdue">Maintenance Overdue</option>
                  <option value="due_soon">Maintenance Due Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <HardDrive className="w-5 h-5 mr-2 text-blue-400" />
                Equipment List
                <span className="ml-2 text-sm text-gray-400">({filteredEquipment.length} equipment)</span>
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
            
            {filteredEquipment.length === 0 ? (
              <div className="p-12 text-center">
                <HardDrive className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No equipment found</h3>
                <p className="text-gray-500">Add new equipment or try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Code</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Location</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Capacity</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Last Maintenance</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Next Maintenance</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((equip, index) => {
                      const maintenanceStatus = getMaintenanceStatus(equip.next_maintenance);
                      const statusColor = getStatusColor(equip.is_active);
                      
                      return (
                        <motion.tr 
                          key={equip.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4">
                            <div className="font-mono text-blue-400">{equip.equipment_code}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{equip.equipment_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{equip.location || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{equip.capacity_per_hour || 'N/A'} units/hr</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-400">{formatDate(equip.last_maintenance)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{formatDate(equip.next_maintenance)}</div>
                            {equip.next_maintenance && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${maintenanceStatus.color}`}>
                                {maintenanceStatus.label}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewDetails(equip)}
                                className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              
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

          {/* Equipment Utilization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Equipment Utilization
              </h3>
              
              <div className="space-y-4">
                {filteredEquipment.slice(0, 5).map(equip => (
                  <div key={equip.id} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{equip.equipment_name}</span>
                        <span className="text-white">{equip.capacity_per_hour || 0} units/hr</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                          style={{ width: `${Math.min((equip.capacity_per_hour / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertCircleIcon className="w-5 h-5 mr-2 text-red-400" />
                Maintenance Alerts
              </h3>
              
              <div className="space-y-4">
                {maintenanceSchedule
                  .filter(equip => getMaintenanceStatus(equip.next_maintenance).status === 'overdue')
                  .slice(0, 3)
                  .map(equip => (
                    <div key={equip.id} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{equip.equipment_name}</span>
                          <span className="text-red-400">Overdue</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Due since {formatDate(equip.next_maintenance)}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {maintenanceSchedule
                  .filter(equip => getMaintenanceStatus(equip.next_maintenance).status === 'due_soon')
                  .slice(0, 3)
                  .map(equip => (
                    <div key={equip.id} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-amber-500"></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{equip.equipment_name}</span>
                          <span className="text-amber-400">Due Soon</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Due on {formatDate(equip.next_maintenance)}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {maintenanceSchedule
                  .filter(equip => getMaintenanceStatus(equip.next_maintenance).status === 'overdue' || 
                                 getMaintenanceStatus(equip.next_maintenance).status === 'due_soon')
                  .length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                      <p>No maintenance alerts</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Equipment Modal */}
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
                <h3 className="text-xl font-semibold text-white">Add New Equipment</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateEquipment} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Equipment Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Equipment Code</label>
                    <input
                      required
                      value={newEquipment.equipment_code}
                      onChange={(e) => setNewEquipment({...newEquipment, equipment_code: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Equipment Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Equipment Name</label>
                    <input
                      required
                      value={newEquipment.equipment_name}
                      onChange={(e) => setNewEquipment({...newEquipment, equipment_name: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Capacity Per Hour */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Capacity (units/hour)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newEquipment.capacity_per_hour}
                      onChange={(e) => setNewEquipment({...newEquipment, capacity_per_hour: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Acquisition Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Acquisition Date</label>
                    <input
                      type="date"
                      value={newEquipment.acquisition_date}
                      onChange={(e) => setNewEquipment({...newEquipment, acquisition_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Last Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Maintenance Date</label>
                    <input
                      type="date"
                      value={newEquipment.last_maintenance}
                      onChange={(e) => setNewEquipment({...newEquipment, last_maintenance: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Next Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Next Maintenance Date</label>
                    <input
                      type="date"
                      value={newEquipment.next_maintenance}
                      onChange={(e) => setNewEquipment({...newEquipment, next_maintenance: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
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
                    Create Equipment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equipment Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedEquipment && (
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
                <h3 className="text-xl font-semibold text-white">
                  Equipment Details: {selectedEquipment.equipment_name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Equipment Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                      Equipment Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Code:</span>
                        <span className="text-white font-mono">{selectedEquipment.equipment_code}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{selectedEquipment.equipment_name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">{selectedEquipment.location || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Capacity:</span>
                        <span className="text-white">{selectedEquipment.capacity_per_hour || 'N/A'} units/hour</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Acquisition Date:</span>
                        <span className="text-white">{formatDate(selectedEquipment.acquisition_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Maintenance Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                      Maintenance Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Maintenance:</span>
                        <span className="text-white">{formatDate(selectedEquipment.last_maintenance)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Maintenance:</span>
                        <span className="text-white">{formatDate(selectedEquipment.next_maintenance)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maintenance Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceStatus(selectedEquipment.next_maintenance).color}`}>
                          {getMaintenanceStatus(selectedEquipment.next_maintenance).label}
                        </span>
                      </div>
                      
                      {selectedEquipment.next_maintenance && (
                        <div className="pt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Maintenance Progress:</span>
                            <span className="text-white">
                              {selectedEquipment.last_maintenance ? 
                                `${Math.round(
                                  (new Date() - new Date(selectedEquipment.last_maintenance)) / 
                                  (new Date(selectedEquipment.next_maintenance) - new Date(selectedEquipment.last_maintenance)) * 100
                                )}%` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                              style={{ 
                                width: `${Math.min(
                                  (new Date() - new Date(selectedEquipment.last_maintenance || selectedEquipment.acquisition_date)) / 
                                  (new Date(selectedEquipment.next_maintenance) - new Date(selectedEquipment.last_maintenance || selectedEquipment.acquisition_date)) * 100, 
                                  100
                                )}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowMaintenanceModal(true)}
                      className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Update Maintenance</span>
                    </button>
                  </div>
                </div>
                
                {/* Production History */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2 mb-4">
                    Production History
                  </h4>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400">Production history data will be displayed here</p>
                    <p className="text-sm text-gray-500">Connected to ProductionEntries API</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Update Modal */}
      <AnimatePresence>
        {showMaintenanceModal && selectedEquipment && (
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
                <h3 className="text-xl font-semibold text-white">
                  Update Maintenance: {selectedEquipment.equipment_name}
                </h3>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateMaintenance} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Maintenance Date</label>
                    <input
                      type="date"
                      required
                      value={maintenanceData.maintenance_date}
                      onChange={(e) => setMaintenanceData({...maintenanceData, maintenance_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Next Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Next Maintenance Date</label>
                    <input
                      type="date"
                      required
                      value={maintenanceData.next_maintenance_date}
                      onChange={(e) => setMaintenanceData({...maintenanceData, next_maintenance_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Maintenance Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Maintenance Type</label>
                    <select
                      value={maintenanceData.maintenance_type}
                      onChange={(e) => setMaintenanceData({...maintenanceData, maintenance_type: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="routine">Routine Maintenance</option>
                      <option value="preventive">Preventive Maintenance</option>
                      <option value="corrective">Corrective Maintenance</option>
                      <option value="emergency">Emergency Repair</option>
                    </select>
                  </div>
                  
                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maintenanceData.cost}
                      onChange={(e) => setMaintenanceData({...maintenanceData, cost: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={maintenanceData.description}
                      onChange={(e) => setMaintenanceData({...maintenanceData, description: e.target.value})}
                      rows="3"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all"
                  >
                    Update Maintenance
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentManagement;
