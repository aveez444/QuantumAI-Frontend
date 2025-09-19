import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  TrendingUp, AlertCircle, ShoppingCart, Box, Zap, Clock
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const ReorderSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [abcAnalysis, setAbcAnalysis] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch reorder suggestions
      const suggestionsRes = await api.get('inventory/reorder-suggestions/');
      setSuggestions(suggestionsRes.data.suggestions || []);
      
      // Fetch inventory valuation
      const inventoryRes = await api.get('inventory/valuation/');
      setInventoryData(inventoryRes.data);
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load reorder suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateOrder = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowCreateOrderModal(true);
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

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-500/10';
      case 'MEDIUM': return 'bg-amber-500/10';
      case 'LOW': return 'bg-blue-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'HIGH': return <AlertCircle className="w-4 h-4" />;
      case 'MEDIUM': return <Clock className="w-4 h-4" />;
      case 'LOW': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Filter suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => {
      const matchesSearch = suggestion.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUrgency = urgencyFilter === 'all' || suggestion.urgency === urgencyFilter;
      
      const matchesCategory = categoryFilter === 'all' || 
        (suggestion.category && suggestion.category === categoryFilter);
      
      return matchesSearch && matchesUrgency && matchesCategory;
    });

  // Get unique categories from suggestions
  const categories = [...new Set(suggestions.map(s => s.category).filter(Boolean))];

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
                Inventory Intelligence
              </motion.h1>
              <p className="text-gray-400 mt-1">Reorder Suggestions & Inventory Analytics</p>
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
                  <p className="text-sm text-gray-400">Total Suggestions</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(suggestions.length)}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Box className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Critical Items</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatNumber(suggestions.filter(s => s.urgency === 'HIGH').length)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Investment</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(suggestions.reduce((sum, s) => sum + (s.estimated_cost || 0), 0))}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Inventory Value</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(inventoryData.total_inventory_value || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Urgency Filter */}
              <div>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Urgency Levels</option>
                  <option value="HIGH">Critical</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort Options */}
              <div>
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="urgency">Sort by: Urgency</option>
                  <option value="cost">Sort by: Cost</option>
                  <option value="shortage">Sort by: Shortage</option>
                  <option value="name">Sort by: Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reorder Suggestions */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-400" />
                Reorder Suggestions
                <span className="ml-2 text-sm text-gray-400">({filteredSuggestions.length} items)</span>
              </h3>
            </div>
            
            {filteredSuggestions.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No reorder suggestions</h3>
                <p className="text-gray-500">Inventory levels are optimal or try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Current Stock</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Reorder Point</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Shortage</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Suggested Qty</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Estimated Cost</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Urgency</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuggestions.map((suggestion, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-white">{suggestion.product_name}</div>
                            <div className="text-sm text-gray-400 font-mono">{suggestion.product_sku}</div>
                            {suggestion.category && (
                              <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                                {suggestion.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white">{formatNumber(suggestion.current_stock)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white">{formatNumber(suggestion.reorder_point)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-red-400">{formatNumber(suggestion.shortage)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white">{formatNumber(suggestion.suggested_order_qty)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-400">{formatCurrency(suggestion.estimated_cost)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBg(suggestion.urgency)} ${getUrgencyColor(suggestion.urgency)}`}>
                            {getUrgencyIcon(suggestion.urgency)}
                            <span className="ml-1">{suggestion.urgency}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleCreateOrder(suggestion)}
                              className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3 py-1.5 rounded-lg text-sm transition-all"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Create PO</span>
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

          {/* Inventory Health Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-400" />
                Inventory Health
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Total Inventory Value</span>
                    <span className="text-white font-medium">{formatCurrency(inventoryData.total_inventory_value || 0)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Total Items</span>
                    <span className="text-white font-medium">{formatNumber(inventoryData.item_count || 0)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                {inventoryData.category_breakdown && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Value by Category</div>
                    {Object.entries(inventoryData.category_breakdown).map(([category, data], index) => (
                      <div key={category} className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-400">{category}</span>
                          <span className="text-xs text-white">{formatCurrency(data.value)}</span>
                        </div>
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                            style={{ width: `${(data.value / (inventoryData.total_inventory_value || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                Recommendation Summary
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-xl border border-red-700/30">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-300">Immediate Action Needed</h4>
                      <p className="text-sm text-red-400/80 mt-1">
                        {suggestions.filter(s => s.urgency === 'HIGH').length} critical items need immediate reordering to prevent stockouts.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-900/20 to-amber-800/10 rounded-xl border border-amber-700/30">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-amber-300">Plan for Next Week</h4>
                      <p className="text-sm text-amber-400/80 mt-1">
                        {suggestions.filter(s => s.urgency === 'MEDIUM').length} items should be reordered in the next 7 days.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-700/30">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-300">Inventory Optimization</h4>
                      <p className="text-sm text-blue-400/80 mt-1">
                        Consider reviewing reorder points for {suggestions.length} items to optimize inventory carrying costs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateOrderModal && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateOrderModal(false)}
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
                  <ShoppingCart className="w-5 h-5 mr-2 text-purple-400" />
                  Create Purchase Order
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">Product Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">SKU:</span>
                      <div className="text-white font-mono">{selectedSuggestion.product_sku}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <div className="text-white">{selectedSuggestion.product_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Current Stock:</span>
                      <div className="text-white">{formatNumber(selectedSuggestion.current_stock)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Reorder Point:</span>
                      <div className="text-white">{formatNumber(selectedSuggestion.reorder_point)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    defaultValue={selectedSuggestion.suggested_order_qty}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Supplier</label>
                  <select className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>{selectedSuggestion.preferred_supplier || 'Select supplier'}</option>
                    <option>Supplier A</option>
                    <option>Supplier B</option>
                    <option>Supplier C</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateOrderModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle create purchase order logic
                      setShowCreateOrderModal(false);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                  >
                    Create Purchase Order
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

export default ReorderSuggestions;