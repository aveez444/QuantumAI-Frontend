import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  MapPin, User, Building, Box, Palette, XCircle as XIcon
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stockData, setStockData] = useState({});
  const [stockLoading, setStockLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    warehouse_code: '',
    warehouse_name: '',
    location: '',
    manager: ''
  });

  useEffect(() => {
    fetchWarehouses();
    fetchEmployees();
  }, []);

  const fetchWarehouses = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('api/warehouses/');
      setWarehouses(res.data);
      setError(null);
    } catch (err) {
      console.error('Warehouses fetch error:', err);
      setError('Failed to load warehouses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('api/employees/');
      setEmployees(res.data);
    } catch (err) {
      console.error('Employees fetch error:', err);
    }
  };

  const fetchWarehouseStock = async (warehouseId) => {
    setStockLoading(true);
    try {
      const res = await api.get(`stock-movements/warehouse-stock/?warehouse_id=${warehouseId}`);
      setStockData(prev => ({ ...prev, [warehouseId]: res.data }));
    } catch (err) {
      console.error('Stock data fetch error:', err);
      setStockData(prev => ({ ...prev, [warehouseId]: [] }));
    } finally {
      setStockLoading(false);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await api.put(`api/warehouses/${editingWarehouse.id}/`, formData);
      } else {
        await api.post('api/warehouses/', formData);
      }
      setShowWarehouseModal(false);
      setEditingWarehouse(null);
      setFormData({
        warehouse_code: '',
        warehouse_name: '',
        location: '',
        manager: ''
      });
      fetchWarehouses();
    } catch (err) {
      console.error('Warehouse save error:', err);
      setError('Failed to save warehouse');
    }
  };

  const handleEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      warehouse_code: warehouse.warehouse_code,
      warehouse_name: warehouse.warehouse_name,
      location: warehouse.location,
      manager: warehouse.manager
    });
    setShowWarehouseModal(true);
  };

  const handleDeleteWarehouse = async () => {
    try {
      await api.delete(`api/warehouses/${editingWarehouse.id}/`);
      setShowDeleteConfirm(false);
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      console.error('Warehouse delete error:', err);
      setError('Failed to delete warehouse');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Filter and sort warehouses
  const filteredWarehouses = warehouses
    .filter(warehouse => {
      const matchesSearch = warehouse.warehouse_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'code') {
        aValue = a.warehouse_code;
        bValue = b.warehouse_code;
      } else if (sortBy === 'name') {
        aValue = a.warehouse_name;
        bValue = b.warehouse_name;
      } else if (sortBy === 'location') {
        aValue = a.location;
        bValue = b.location;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

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
                Warehouse Management
              </motion.h1>
              <p className="text-gray-400 mt-1">Storage Locations & Inventory</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchWarehouses}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWarehouseModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Warehouse</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-sm text-gray-400">Sort by:</span>
              {[
                { key: 'code', label: 'Code', icon: Hash },
                { key: 'name', label: 'Name', icon: Building },
                { key: 'location', label: 'Location', icon: MapPin }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (sortBy === key) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(key);
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all ${sortBy === key ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                  {sortBy === key && (
                    <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Warehouses Grid/List */}
          {filteredWarehouses.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
              <Building className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No warehouses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or create your first warehouse</p>
              <button
                onClick={() => setShowWarehouseModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                Add Your First Warehouse
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWarehouses.map(warehouse => {
                const manager = employees.find(e => e.id === warehouse.manager);
                
                return (
                  <motion.div
                    key={warehouse.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-5 group hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Building className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedWarehouse(warehouse);
                            fetchWarehouseStock(warehouse.id);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Eye className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => handleEditWarehouse(warehouse)}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-1 truncate">{warehouse.warehouse_name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{warehouse.warehouse_code}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{warehouse.location}</span>
                      </div>
                      
                      {manager && (
                        <div className="flex items-center text-sm text-gray-400">
                          <User className="w-4 h-4 mr-2" />
                          <span>{manager.full_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedWarehouse(warehouse);
                        fetchWarehouseStock(warehouse.id);
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center"
                    >
                      <Box className="w-4 h-4 mr-2" />
                      View Inventory
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Code</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Warehouse Name</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Location</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Manager</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map(warehouse => {
                    const manager = employees.find(e => e.id === warehouse.manager);
                    
                    return (
                      <motion.tr 
                        key={warehouse.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4 text-white font-mono">{warehouse.warehouse_code}</td>
                        <td className="py-3 px-4 text-white">{warehouse.warehouse_name}</td>
                        <td className="py-3 px-4 text-gray-400">{warehouse.location}</td>
                        <td className="py-3 px-4 text-gray-400">{manager ? manager.full_name : '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                fetchWarehouseStock(warehouse.id);
                              }}
                              className="p-1 hover:bg-gray-700/50 rounded text-green-400"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditWarehouse(warehouse)}
                              className="p-1 hover:bg-gray-700/50 rounded text-blue-400"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingWarehouse(warehouse);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1 hover:bg-gray-700/50 rounded text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Summary Stats */}
          {filteredWarehouses.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Warehouses</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(filteredWarehouses.length)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Managed Warehouses</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatNumber(filteredWarehouses.filter(w => w.manager).length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Locations</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {formatNumber([...new Set(filteredWarehouses.map(w => w.location))].length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Detail Modal */}
      <AnimatePresence>
        {selectedWarehouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWarehouse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">
                  {selectedWarehouse.warehouse_name} - Inventory
                </h3>
                <button
                  onClick={() => setSelectedWarehouse(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Hash className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Code</span>
                    </div>
                    <p className="text-white font-medium">{selectedWarehouse.warehouse_code}</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Location</span>
                    </div>
                    <p className="text-white font-medium">{selectedWarehouse.location}</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Manager</span>
                    </div>
                    <p className="text-white font-medium">
                      {employees.find(e => e.id === selectedWarehouse.manager)?.full_name || 'Not assigned'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                    <h4 className="font-semibold text-white">Current Inventory</h4>
                    <button
                      onClick={() => fetchWarehouseStock(selectedWarehouse.id)}
                      className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${stockLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  
                  {stockData[selectedWarehouse.id] ? (
                    stockData[selectedWarehouse.id].length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-700/50">
                              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product SKU</th>
                              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product Name</th>
                              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Current Stock</th>
                              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">UOM</th>
                              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Last Movement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stockData[selectedWarehouse.id].map((item, index) => (
                              <tr key={index} className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30">
                                <td className="py-3 px-4 text-white font-mono">{item.product__sku}</td>
                                <td className="py-3 px-4 text-white">{item.product__product_name}</td>
                                <td className="py-3 px-4 text-white">{formatNumber(item.current_stock)}</td>
                                <td className="py-3 px-4 text-gray-400">{item.product__uom}</td>
                                <td className="py-3 px-4 text-gray-400">
                                  {item.last_movement ? new Date(item.last_movement).toLocaleDateString() : 'Never'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400">No inventory found in this warehouse</p>
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">Inventory data not loaded yet</p>
                      <button
                        onClick={() => fetchWarehouseStock(selectedWarehouse.id)}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                      >
                        Load Inventory Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Warehouse Modal */}
      <AnimatePresence>
        {showWarehouseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWarehouseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white">
                  {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
                </h3>
              </div>
              
              <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warehouse Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.warehouse_code}
                    onChange={e => setFormData({...formData, warehouse_code: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.warehouse_name}
                    onChange={e => setFormData({...formData, warehouse_name: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Manager</label>
                  <select
                    value={formData.manager}
                    onChange={e => setFormData({...formData, manager: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Manager</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWarehouseModal(false);
                      setEditingWarehouse(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                  >
                    {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
                  Confirm Deletion
                </h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete <span className="text-white font-medium">{editingWarehouse?.warehouse_name}</span>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteWarehouse}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all"
                  >
                    Delete Warehouse
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

export default Warehouses;