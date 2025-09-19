import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Users,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  TrendingUp, AlertCircle, UserPlus, Building, Network, Target
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const CostCenters = () => {
  const [costCenters, setCostCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('all');
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch cost centers
      const costCentersRes = await api.get('api/cost-centers/');
      setCostCenters(costCentersRes.data.results || costCentersRes.data || []);
      
      // Fetch employees for manager assignment
      const employeesRes = await api.get('api/employees/');
      setEmployees(employeesRes.data.results || employeesRes.data || []);
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load cost centers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await api.post('api/cost-centers/', formData);
      setCostCenters(prev => [...prev, response.data]);
      setShowCreateModal(false);
      return { success: true };
    } catch (err) {
      console.error('Create error:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Failed to create cost center' 
      };
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const response = await api.put(`api/cost-centers/${id}/`, formData);
      setCostCenters(prev => prev.map(cc => 
        cc.id === id ? response.data : cc
      ));
      setShowEditModal(false);
      return { success: true };
    } catch (err) {
      console.error('Update error:', err);
      return { 
        success: false, 
        error: err.response?.data || 'Failed to update cost center' 
      };
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cost center?')) {
      return;
    }

    try {
      await api.delete(`cost-centers/${id}/`);
      setCostCenters(prev => prev.filter(cc => cc.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete cost center. It may have associated data.');
    }
  };

  const fetchCostAnalysis = async (id) => {
    setAnalysisLoading(true);
    try {
      const response = await api.get(`finance/cost-center-analysis/${id}/`);
      setAnalysisData(response.data);
      setShowAnalysisModal(true);
    } catch (err) {
      console.error('Analysis fetch error:', err);
      setError('Failed to load cost analysis');
    } finally {
      setAnalysisLoading(false);
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

  // Build hierarchy tree
  const buildHierarchy = (items) => {
    const itemMap = {};
    const roots = [];
    
    // First pass: create a map of all items
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });
    
    // Second pass: build the tree
    items.forEach(item => {
      if (item.parent_center) {
        if (itemMap[item.parent_center]) {
          itemMap[item.parent_center].children.push(itemMap[item.id]);
        }
      } else {
        roots.push(itemMap[item.id]);
      }
    });
    
    return roots;
  };

  // Filter cost centers
  const filteredCostCenters = costCenters.filter(cc => {
    const matchesSearch = cc.cost_center_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParent = parentFilter === 'all' || 
      (parentFilter === 'has_parent' && cc.parent_center) ||
      (parentFilter === 'no_parent' && !cc.parent_center);
    
    return matchesSearch && matchesParent;
  });

  const hierarchicalCenters = buildHierarchy(filteredCostCenters);

  // Get unique parent options
  const parentOptions = costCenters.filter(cc => !cc.parent_center);

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
                Cost Center Management
              </motion.h1>
              <p className="text-gray-400 mt-1">Organizational Structure & Cost Analysis</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Cost Center</span>
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
                  <p className="text-sm text-gray-400">Total Cost Centers</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(costCenters.length)}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Parent Centers</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatNumber(costCenters.filter(cc => !cc.parent_center).length)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Network className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Managed Centers</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatNumber(costCenters.filter(cc => cc.manager).length)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Employees/Center</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {costCenters.length > 0 
                      ? formatNumber(costCenters.reduce((sum, cc) => sum + (cc.employee_count || 0), 0) / costCenters.length)
                      : '0'
                    }
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cost centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Parent Filter */}
              <div>
                <select
                  value={parentFilter}
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Centers</option>
                  <option value="has_parent">With Parent</option>
                  <option value="no_parent">Without Parent</option>
                </select>
              </div>
              
              {/* View Options */}
              <div>
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="list">List View</option>
                  <option value="tree">Tree View</option>
                  <option value="table">Table View</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cost Centers List */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-400" />
                Cost Centers
                <span className="ml-2 text-sm text-gray-400">({filteredCostCenters.length} centers)</span>
              </h3>
            </div>
            
            {filteredCostCenters.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No cost centers found</h3>
                <p className="text-gray-500">Create your first cost center or try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Code</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Parent Center</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Manager</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Employees</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCostCenters.map((center, index) => (
                      <motion.tr 
                        key={center.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-white font-mono">{center.cost_center_code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{center.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400">
                            {center.parent_center 
                              ? (costCenters.find(cc => cc.id === center.parent_center)?.name || 'N/A')
                              : 'None'
                            }
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400">
                            {center.manager_name || center.manager 
                              ? (employees.find(e => e.id === center.manager)?.full_name || 'Unassigned')
                              : 'Unassigned'
                            }
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white">{formatNumber(center.employee_count || 0)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCostCenter(center);
                                setShowDetailModal(true);
                              }}
                              className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => fetchCostAnalysis(center.id)}
                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Cost Analysis"
                            >
                              <BarChart3 className="w-4 h-4 text-blue-400" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedCostCenter(center);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-amber-400" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(center.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
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

          {/* Hierarchy Visualization */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center mb-4">
              <Network className="w-5 h-5 mr-2 text-purple-400" />
              Organizational Hierarchy
            </h3>
            
            <div className="space-y-3">
              {hierarchicalCenters.length > 0 ? (
                hierarchicalCenters.map(root => (
                  <CostCenterNode 
                    key={root.id} 
                    node={root} 
                    allCenters={costCenters}
                    employees={employees}
                    onViewDetails={(center) => {
                      setSelectedCostCenter(center);
                      setShowDetailModal(true);
                    }}
                    onAnalyze={(center) => fetchCostAnalysis(center.id)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hierarchy data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Cost Center Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CostCenterFormModal
            title="Create Cost Center"
            employees={employees}
            parentOptions={parentOptions}
            onSubmit={handleCreate}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Cost Center Modal */}
      <AnimatePresence>
        {showEditModal && selectedCostCenter && (
          <CostCenterFormModal
            title="Edit Cost Center"
            employees={employees}
            parentOptions={parentOptions.filter(cc => cc.id !== selectedCostCenter.id)}
            initialData={selectedCostCenter}
            onSubmit={(data) => handleUpdate(selectedCostCenter.id, data)}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCostCenter && (
          <CostCenterDetailModal
            costCenter={selectedCostCenter}
            allCenters={costCenters}
            employees={employees}
            onClose={() => setShowDetailModal(false)}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cost Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && selectedCostCenter && (
          <CostAnalysisModal
            costCenter={selectedCostCenter}
            analysisData={analysisData}
            loading={analysisLoading}
            onClose={() => {
              setShowAnalysisModal(false);
              setAnalysisData(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Recursive component for hierarchy visualization
const CostCenterNode = ({ node, allCenters, employees, onViewDetails, onAnalyze, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2); // Auto-expand first two levels
  
  return (
    <div className="ml-4">
      <div className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="mr-2 p-1 hover:bg-gray-700 rounded"
        >
          {node.children.length > 0 ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">{node.cost_center_code}</span>
            <span className="text-gray-400">-</span>
            <span className="text-white truncate">{node.name}</span>
          </div>
          
          {node.manager && (
            <div className="text-sm text-gray-400 mt-1">
              Manager: {employees.find(e => e.id === node.manager)?.full_name || 'Unknown'}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {node.employee_count || 0} employees
          </span>
          
          <button
            onClick={() => onViewDetails(node)}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onAnalyze(node)}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Cost Analysis"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>
      
      {expanded && node.children.length > 0 && (
        <div className="mt-2 border-l-2 border-gray-700 ml-2 pl-4">
          {node.children.map(child => (
            <CostCenterNode
              key={child.id}
              node={child}
              allCenters={allCenters}
              employees={employees}
              onViewDetails={onViewDetails}
              onAnalyze={onAnalyze}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Form Modal Component
const CostCenterFormModal = ({ title, employees, parentOptions, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    cost_center_code: initialData?.cost_center_code || '',
    name: initialData?.name || '',
    parent_center: initialData?.parent_center || '',
    manager: initialData?.manager || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const result = await onSubmit(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
            <Building className="w-5 h-5 mr-2 text-blue-400" />
            {title}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 text-sm">
              {typeof error === 'object' ? JSON.stringify(error) : error}
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cost Center Code *</label>
            <input
              type="text"
              required
              value={formData.cost_center_code}
              onChange={(e) => handleChange('cost_center_code', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g., PROD-001"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g., Production Floor"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Parent Center</label>
            <select
              value={formData.parent_center}
              onChange={(e) => handleChange('parent_center', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">None (Top Level)</option>
              {parentOptions.map(center => (
                <option key={center.id} value={center.id}>
                  {center.cost_center_code} - {center.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Manager</label>
            <select
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Unassigned</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.employee_code} - {employee.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Cost Center'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Detail View Modal Component
const CostCenterDetailModal = ({ costCenter, allCenters, employees, onClose, onEdit }) => {
  const parentCenter = allCenters.find(cc => cc.id === costCenter.parent_center);
  const manager = employees.find(e => e.id === costCenter.manager);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-400" />
            Cost Center Details
          </h3>
          <button
            onClick={onEdit}
            className="flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg text-sm transition-all"
          >
            <Edit className="w-4 h-4 text-amber-400" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-medium text-white mb-3 border-b border-gray-700 pb-2">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Code:</span>
                  <div className="text-white font-mono">{costCenter.cost_center_code}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Name:</span>
                  <div className="text-white">{costCenter.name}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Parent Center:</span>
                  <div className="text-white">
                    {parentCenter 
                      ? `${parentCenter.cost_center_code} - ${parentCenter.name}`
                      : 'None (Top Level)'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-medium text-white mb-3 border-b border-gray-700 pb-2">Management</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Manager:</span>
                  <div className="text-white">
                    {manager 
                      ? `${manager.full_name} (${manager.employee_code})`
                      : 'Unassigned'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Employee Count:</span>
                  <div className="text-white">{costCenter.employee_count || 0}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Created:</span>
                  <div className="text-white">
                    {new Date(costCenter.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3 border-b border-gray-700 pb-2">Description & Notes</h4>
            <p className="text-gray-400 text-sm">
              {costCenter.description || 'No description provided.'}
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Cost Analysis Modal Component
const CostAnalysisModal = ({ costCenter, analysisData, loading, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Cost Analysis - {costCenter.name}
          </h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
              />
            </div>
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-700/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">Total Costs</p>
                      <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(analysisData.total_cost || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400/50" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl border border-purple-700/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">Cost per Employee</p>
                      <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(analysisData.cost_per_employee || 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-400/50" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl border border-green-700/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">Budget Utilization</p>
                      <p className="text-2xl font-bold text-white">
                        {analysisData.budget_utilization !== undefined 
                          ? `${(analysisData.budget_utilization * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-green-400/50" />
                  </div>
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-4 border-b border-gray-700 pb-2">Cost Breakdown</h4>
                
                {analysisData.cost_breakdown && Object.keys(analysisData.cost_breakdown).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analysisData.cost_breakdown).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
                        <span className="text-gray-300 capitalize">{category.replace(/_/g, ' ')}</span>
                        <span className="text-white font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No cost breakdown data available</p>
                )}
              </div>
              
              {/* Trends and Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-4 border-b border-gray-700 pb-2">Monthly Trend</h4>
                  {analysisData.monthly_trend && analysisData.monthly_trend.length > 0 ? (
                    <div className="space-y-2">
                      {analysisData.monthly_trend.map((month, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-20 text-sm text-gray-400">{month.month}</div>
                          <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (month.amount / (analysisData.max_monthly || 1)) * 100)}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm text-white">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(month.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No trend data available</p>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-4 border-b border-gray-700 pb-2">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost Variance</span>
                      <span className={analysisData.cost_variance >= 0 ? 'text-red-400' : 'text-green-400'}>
                        {analysisData.cost_variance !== undefined 
                          ? `${analysisData.cost_variance >= 0 ? '+' : ''}${(analysisData.cost_variance * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">YoY Change</span>
                      <span className={analysisData.yoy_change >= 0 ? 'text-red-400' : 'text-green-400'}>
                        {analysisData.yoy_change !== undefined 
                          ? `${analysisData.yoy_change >= 0 ? '+' : ''}${(analysisData.yoy_change * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency Score</span>
                      <span className="text-white">
                        {analysisData.efficiency_score !== undefined 
                          ? analysisData.efficiency_score.toFixed(1)
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h4 className="text-lg font-medium text-gray-400 mb-2">No Analysis Data</h4>
              <p className="text-gray-500">Cost analysis data is not available for this center</p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CostCenters;