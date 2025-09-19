// InventoryValuation.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, PieChart, Download, Filter, Calendar, Warehouse, Package,
  TrendingUp, TrendingDown, DollarSign, Box, AlertTriangle, Info,
  ChevronDown, ChevronRight, Search, Grid, List, FileText, X
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { RefreshCw } from 'lucide-react';

const InventoryValuation = () => {
  const [valuationData, setValuationData] = useState(null);
  const [abcAnalysisData, setAbcAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('valuation');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedABC, setSelectedABC] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [categoryDetailData, setCategoryDetailData] = useState(null);
  const [abcDetailData, setAbcDetailData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showAllItemsModal, setShowAllItemsModal] = useState(false);
  
  // Generate proper pie chart data
  const generatePieChartData = (categoryBreakdown) => {
    if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
      return [];
    }
    
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    
    return Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].value - a[1].value)
      .map(([category, data], index) => ({
        category,
        value: data.value,
        color: colors[index % colors.length],
        percentage: (data.value / valuationData.total_inventory_value) * 100
      }));
  };

  // Generate CSS for pie chart
  const generatePieChartCSS = (pieData) => {
    if (!pieData || pieData.length === 0) {
      return 'conic-gradient(gray 0% 100%)';
    }
    
    let currentPercentage = 0;
    let gradientParts = [];
    
    pieData.forEach((item) => {
      gradientParts.push(`${item.color} ${currentPercentage}% ${currentPercentage + item.percentage}%`);
      currentPercentage += item.percentage;
    });
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  useEffect(() => {
    if (valuationData && valuationData.detailed_valuation) {
      sortValuationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig]);

  const sortValuationData = () => {
    if (!sortConfig.key || !valuationData?.detailed_valuation) return;

    const sortedData = Object.entries(valuationData.detailed_valuation).sort((a, b) => {
      const [skuA, dataA] = a;
      const [skuB, dataB] = b;

      if (sortConfig.key === 'sku') {
        return sortConfig.direction === 'ascending'
          ? skuA.localeCompare(skuB)
          : skuB.localeCompare(skuA);
      }

      if (sortConfig.key === 'value') {
        return sortConfig.direction === 'ascending'
          ? dataA.total_value - dataB.total_value
          : dataB.total_value - dataA.total_value;
      }

      if (sortConfig.key === 'quantity') {
        return sortConfig.direction === 'ascending'
          ? dataA.quantity - dataB.quantity
          : dataB.quantity - dataA.quantity;
      }

      return 0;
    });

    setValuationData(prev => ({
      ...prev,
      detailed_valuation: Object.fromEntries(sortedData)
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const fetchCategoryDetails = async (category) => {
    try {
      const res = await api.get(`inventory/valuation/category/${category}/?as_of_date=${dateFilter}`);
      setCategoryDetailData(res.data);
    } catch (err) {
      console.error('Category details fetch error:', err);
      setError('Failed to load category details');
    }
  };
  
  const fetchABCClassDetails = async (classification) => {
    try {
      const res = await api.get(`inventory/abc-analysis/class/${classification}/`);
      setAbcDetailData(res.data);
    } catch (err) {
      console.error('ABC class details fetch error:', err);
      setError('Failed to load ABC class details');
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryDetails(selectedCategory);
    }
  }, [selectedCategory, dateFilter]);

  useEffect(() => {
    if (selectedABC) {
      fetchABCClassDetails(selectedABC);
    }
  }, [selectedABC]);

  const filteredValuationData = valuationData?.detailed_valuation ?
    Object.entries(valuationData.detailed_valuation).filter(([sku, data]) => {
      const matchesSearch = sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (data.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || data.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }) : [];

  const filteredABCData = abcAnalysisData?.abc_analysis?.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'valuation') {
      fetchValuationData();
    } else {
      fetchABCAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateFilter, warehouseFilter, categoryFilter]);

  const fetchInitialData = async () => {
    try {
      const warehousesRes = await api.get('api/warehouses/');
      setWarehouses(warehousesRes.data.results || warehousesRes.data);

      const productsRes = await api.get('api/products/');
      const uniqueCategories = [...new Set((productsRes.data.results || productsRes.data)
        .map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      await fetchValuationData();
    } catch (err) {
      console.error('Initial data fetch error:', err);
      setError('Failed to load initial data');
      setLoading(false);
    }
  };

  const fetchValuationData = async () => {
    setRefreshing(true);
    try {
      let url = `inventory/valuation/?as_of_date=${dateFilter}`;
      if (warehouseFilter !== 'all') {
        url += `&warehouse_id=${warehouseFilter}`;
      }

      const res = await api.get(url);
      setValuationData(res.data);
      setError(null);
    } catch (err) {
      console.error('Valuation fetch error:', err);
      setError('Failed to load valuation data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchABCAnalysis = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('inventory/abc-analysis/');
      setAbcAnalysisData(res.data);
      setError(null);
    } catch (err) {
      console.error('ABC analysis fetch error:', err);
      setError('Failed to load ABC analysis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  const exportData = async (type) => {
    try {
      let url;
      if (type === 'valuation') {
        url = `inventory/valuation/export/?as_of_date=${dateFilter}`;
        if (warehouseFilter !== 'all') {
          url += `&warehouse_id=${warehouseFilter}`;
        }
      } else {
        url = 'api/inventory/abc-analysis/export/';
      }

      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  const getABCColor = (classification) => {
    switch (classification) {
      case 'A': return 'from-red-500 to-orange-500';
      case 'B': return 'from-blue-500 to-purple-500';
      case 'C': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getABCDescription = (classification) => {
    switch (classification) {
      case 'A': return 'High-value items (20% of items, 80% of value)';
      case 'B': return 'Medium-value items (30% of items, 15% of value)';
      case 'C': return 'Low-value items (50% of items, 5% of value)';
      default: return '';
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

  const pieData = valuationData ? generatePieChartData(valuationData.category_breakdown) : [];
  const pieChartCSS = generatePieChartCSS(pieData);

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
              <p className="text-gray-400 mt-1">Valuation, ABC Analysis & Stock Optimization</p>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => activeTab === 'valuation' ? fetchValuationData() : fetchABCAnalysis()}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => exportData(activeTab)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-2">
            <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
              <button
                onClick={() => setActiveTab('valuation')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeTab === 'valuation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Valuation Report</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('abc')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeTab === 'abc' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>ABC Analysis</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {activeTab === 'valuation' ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valuation Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Warehouse</label>
                    <select
                      value={warehouseFilter}
                      onChange={(e) => setWarehouseFilter(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Warehouses</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>{wh.warehouse_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="md:col-span-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-300">ABC Analysis</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Inventory items are classified into A, B, and C categories based on their value contribution.
                          This helps prioritize inventory management efforts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-end">
                <div className="flex items-center bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 ml-auto">
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
            </div>
          </div>

          {/* Content */}
          {activeTab === 'valuation' ? (
            valuationData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(valuationData.total_inventory_value)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Items</p>
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(valuationData.total_quantity)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Package className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Unique SKUs</p>
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(valuationData.item_count)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Box className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg. Value per Item</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(valuationData.total_inventory_value / Math.max(valuationData.item_count, 1))}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown Pie Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Value by Category</h3>
                      <PieChart className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="h-64 flex flex-col items-center justify-center">
                      {pieData.length > 0 ? (
                        <>
                          <div className="w-40 h-40 rounded-full mb-4" style={{ background: pieChartCSS }}></div>
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {pieData.slice(0, 4).map((item, index) => (
                              <div 
                                key={item.category} 
                                className="flex items-center p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                                onClick={() => setSelectedCategory(item.category)}
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="text-sm text-gray-300 truncate flex-1">
                                    {item.category || 'Uncategorized'}
                                  </span>
                                  <span className="text-sm font-medium text-white">
                                    {formatCurrency(item.value)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">No category data available</p>
                        </div>
                      )}
                    </div>

                    {pieData.length > 0 && (
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {/* View all categories → */}
                      </button>
                    )}
                  </motion.div>

                {/* Value Distribution Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Top Valued Items</h3>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>

                  <div className="h-64 space-y-4">
                    {valuationData.detailed_valuation && Object.entries(valuationData.detailed_valuation)
                      .sort((a, b) => b[1].total_value - a[1].total_value)
                      .slice(0, 5)
                      .map(([sku, data], index) => {
                        const percentage = (data.total_value / Math.max(valuationData.total_inventory_value, 1)) * 100;
                        return (
                          <div key={sku} className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/30 p-2 rounded-lg transition-all">
                            <div className="w-16 text-sm text-blue-400 font-mono truncate" title={sku}>
                              {sku}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-300 truncate max-w-[120px]" title={data.product_name}>
                                  {data.product_name}
                                </span>
                                <span className="text-sm font-semibold text-green-400">
                                  {formatCurrency(data.total_value)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
                                >
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-bold">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setShowAllItemsModal(true)}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center group"
                  >
                    View all items
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
                                {/* All Items Modal */}
                <AnimatePresence>
                  {showAllItemsModal && valuationData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                      onClick={() => setShowAllItemsModal(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-semibold text-white">All Inventory Items</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Complete inventory valuation as of {new Date(dateFilter).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAllItemsModal(false)}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                              <p className="text-sm text-blue-400">Total Value</p>
                              <p className="text-2xl font-bold text-white">{formatCurrency(valuationData.total_inventory_value)}</p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <p className="text-sm text-green-400">Total Items</p>
                              <p className="text-2xl font-bold text-white">{formatNumber(valuationData.total_quantity)}</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <p className="text-sm text-purple-400">Unique SKUs</p>
                              <p className="text-2xl font-bold text-white">{formatNumber(valuationData.item_count)}</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                              <p className="text-sm text-amber-400">Avg. Value/Item</p>
                              <p className="text-2xl font-bold text-white">
                                {formatCurrency(valuationData.total_inventory_value / Math.max(valuationData.item_count, 1))}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-800/30 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-semibold text-white">All Inventory Items</h4>
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search products..."
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-700/50">
                                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">SKU</th>
                                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product Name</th>
                                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Category</th>
                                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Quantity</th>
                                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Unit Cost</th>
                                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Total Value</th>
                                    <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(valuationData.detailed_valuation)
                                    .filter(([sku, data]) => 
                                      sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (data.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .sort((a, b) => b[1].total_value - a[1].total_value)
                                    .map(([sku, data]) => (
                                      <tr key={sku} className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/50">
                                        <td className="py-3 px-4 font-mono text-blue-400">{sku}</td>
                                        <td className="py-3 px-4 text-white">{data.product_name}</td>
                                        <td className="py-3 px-4">
                                          <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                                            {data.category || 'Uncategorized'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300 text-right">{formatNumber(data.current_qty)}</td>
                                        <td className="py-3 px-4 text-gray-300 text-right">{formatCurrency(data.average_cost)}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-green-400">
                                          {formatCurrency(data.total_value)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {data.current_qty <= 0 ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              Out
                                            </span>
                                          ) : data.current_qty <= data.reorder_point ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              Low
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                              OK
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                {/* Detailed Valuation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Detailed Inventory Valuation</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search products..."
                          className="bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th
                            className="text-left py-3 px-4 text-sm text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('sku')}
                          >
                            <div className="flex items-center">
                              SKU
                              {sortConfig.key === 'sku' && (
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product Name</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Category</th>
                          <th
                            className="text-left py-3 px-4 text-sm text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('quantity')}
                          >
                            <div className="flex items-center">
                              Quantity
                              {sortConfig.key === 'quantity' && (
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Unit Cost</th>
                          <th
                            className="text-right py-3 px-4 text-sm text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort('value')}
                          >
                            <div className="flex items-center justify-end">
                              Total Value
                              {sortConfig.key === 'value' && (
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                          <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredValuationData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-500"> 
                            No items found</td>
                          </tr>
                        ) : (
                          filteredValuationData.map(([sku, data]) => (
                            <tr key={sku} className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30">
                              <td className="py-3 px-4 font-mono text-blue-400">{sku}</td>
                              <td className="py-3 px-4 text-white">{data.product_name}</td>
                              <td className="py-3 px-4">
                                <span
                                  className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs cursor-pointer hover:bg-gray-600/50"
                                  onClick={() => setSelectedCategory(data.category || 'Uncategorized')}
                                >
                                  {data.category || 'Uncategorized'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{formatNumber(data.current_qty)}</td>
                              <td className="py-3 px-4 text-gray-300">{formatCurrency(data.average_cost)}</td>
                              <td className="py-3 px-4 text-right font-semibold text-green-400">
                                {formatCurrency(data.total_value)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {data.current_qty <= 0 ? (
                                  <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Out of Stock
                                  </span>
                                ) : data.current_qty <= data.reorder_point ? (
                                  <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                    OK
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                  <FileText className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No valuation data</h3>
                <p className="text-gray-500">Try adjusting your filters or check your inventory data</p>
              </div>
            )
          ) : (
            abcAnalysisData ? (
              <div className="space-y-6">
                {/* ABC Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['A', 'B', 'C'].map((classification, index) => {
                    const classData = abcAnalysisData.classification_summary[classification] || { items: 0, value: 0 };
                    return (
                      <motion.div
                        key={classification}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-br ${getABCColor(classification)} rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl font-bold text-white bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                            {classification}
                          </div>
                          <button
                            onClick={() => setSelectedABC(classification)}
                            className="text-white/80 hover:text-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">
                          Class {classification} Items
                        </h3>

                        <p className="text-sm text-white/80 mb-4">
                          {getABCDescription(classification)}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white/70">Items</span>
                            <span className="font-semibold text-white">{classData.items}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white/70">Total Value</span>
                            <span className="font-semibold text-white">{formatCurrency(classData.value)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white/70">% of Total Value</span>
                            <span className="font-semibold text-white">
                              {abcAnalysisData.total_value ? ((classData.value / abcAnalysisData.total_value) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ABC Analysis Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">ABC Analysis Details</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Total Value: {formatCurrency(abcAnalysisData.total_value)}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">SKU</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product Name</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Classification</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Inventory Value</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Quantity</th>
                          <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Cumulative %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abcAnalysisData.abc_analysis.map((item) => (
                          <tr key={item.sku} className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30">
                            <td className="py-3 px-4 font-mono text-blue-400">{item.sku}</td>
                            <td className="py-3 px-4 text-white">{item.product_name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.classification === 'A' ? 'bg-red-500/10 text-red-400' :
                                  item.classification === 'B' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-green-500/10 text-green-400'
                              }`}>
                                Class {item.classification}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-green-400 font-medium">{formatCurrency(item.inventory_value)}</td>
                            <td className="py-3 px-4 text-gray-300">{formatNumber(item.quantity)}</td>
                            <td className="py-3 px-4 text-right text-gray-400">{item.cumulative_value_pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No ABC analysis data</h3>
                <p className="text-gray-500">Unable to load ABC analysis at this time</p>
              </div>
            )
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-300">Error</h4>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Detail Modal */}
      <AnimatePresence>
        {selectedCategory && categoryDetailData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory} - Inventory Analysis
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Detailed breakdown of inventory value and items in this category
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-400">Total Value</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(categoryDetailData.total_value)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-400 opacity-50" />
                    </div>
                    <p className="text-xs text-blue-300 mt-2">
                      {((categoryDetailData.total_value / Math.max(valuationData?.total_inventory_value || 1, 1)) * 100).toFixed(1)}% of total inventory
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-400">Total Items</p>
                        <p className="text-2xl font-bold text-white">
                          {formatNumber(categoryDetailData.total_quantity)}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-green-400 opacity-50" />
                    </div>
                    <p className="text-xs text-green-300 mt-2">
                      {((categoryDetailData.total_quantity / Math.max(valuationData?.total_quantity || 1, 1)) * 100).toFixed(1)}% of total items
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-400">Avg. Value/Item</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(categoryDetailData.avg_value_per_item)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
                    </div>
                    <p className="text-xs text-purple-300 mt-2">
                      {categoryDetailData.avg_value_per_item > (valuationData?.total_inventory_value / Math.max(valuationData?.item_count || 1, 1)) ?
                        'Above average' : 'Below average'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-400">Low Stock Items</p>
                        <p className="text-2xl font-bold text-white">
                          {categoryDetailData.low_stock_count}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-amber-400 opacity-50" />
                    </div>
                    <p className="text-xs text-amber-300 mt-2">
                      {categoryDetailData.product_count ? ((categoryDetailData.low_stock_count / categoryDetailData.product_count) * 100).toFixed(1) : '0'}% of category
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Value Distribution</h4>
                    <div className="space-y-2">
                      {categoryDetailData.top_products && categoryDetailData.top_products.slice(0, 5).map((product) => (
                        <div key={product.sku} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 truncate">{product.sku}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                style={{ width: `${(product.total_value / Math.max(categoryDetailData.total_value, 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-white font-medium w-16 text-right">
                              {formatCurrency(product.total_value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Stock Health</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Well-Stocked Items</span>
                        <span className="text-sm text-green-400 font-medium">
                          {categoryDetailData.product_count ? (categoryDetailData.product_count - categoryDetailData.low_stock_count) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Low Stock Items</span>
                        <span className="text-sm text-amber-400 font-medium">
                          {categoryDetailData.low_stock_count}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Out of Stock Items</span>
                        <span className="text-sm text-red-400 font-medium">
                          {categoryDetailData.out_of_stock_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Products in this Category</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-2 px-3 text-sm text-gray-400">SKU</th>
                          <th className="text-left py-2 px-3 text-sm text-gray-400">Product Name</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Quantity</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Unit Cost</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Total Value</th>
                          <th className="text-center py-2 px-3 text-sm text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryDetailData.products && categoryDetailData.products.map(product => (
                          <tr key={product.sku} className="border-b border-gray-700/30 last:border-0">
                            <td className="py-2 px-3 font-mono text-blue-400 text-sm">{product.sku}</td>
                            <td className="py-2 px-3 text-white text-sm">{product.product_name}</td>
                            <td className="py-2 px-3 text-gray-300 text-sm text-right">{formatNumber(product.quantity)}</td>
                            <td className="py-2 px-3 text-gray-300 text-sm text-right">{formatCurrency(product.unit_cost)}</td>
                            <td className="py-2 px-3 text-green-400 text-sm text-right font-medium">
                              {formatCurrency(product.total_value)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {product.quantity <= 0 ? (
                                <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Out
                                </span>
                              ) : product.quantity <= product.reorder_point ? (
                                <span className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Low
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ABC Class Detail Modal - keeping existing implementation */}
      <AnimatePresence>
        {selectedABC && abcDetailData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedABC(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Class {selectedABC} Items - Strategic Analysis
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {getABCDescription(selectedABC)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedABC(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`bg-gradient-to-br ${getABCColor(selectedABC)}/20 rounded-xl p-4 border ${getABCColor(selectedABC)}/30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Total Value</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(abcDetailData.total_value)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-white opacity-50" />
                    </div>
                    <p className="text-xs text-white/70 mt-2">
                      {((abcDetailData.total_value / Math.max(abcAnalysisData?.total_value || 1, 1)) * 100).toFixed(1)}% of total inventory value
                    </p>
                  </div>

                  <div className={`bg-gradient-to-br ${getABCColor(selectedABC)}/20 rounded-xl p-4 border ${getABCColor(selectedABC)}/30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Number of Items</p>
                        <p className="text-2xl font-bold text-white">
                          {abcDetailData.item_count}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-white opacity-50" />
                    </div>
                    <p className="text-xs text-white/70 mt-2">
                      {((abcDetailData.item_count / Math.max(abcAnalysisData?.total_items || 1, 1)) * 100).toFixed(1)}% of total items
                    </p>
                  </div>

                  <div className={`bg-gradient-to-br ${getABCColor(selectedABC)}/20 rounded-xl p-4 border ${getABCColor(selectedABC)}/30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Avg. Value/Item</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(abcDetailData.avg_value_per_item)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-white opacity-50" />
                    </div>
                    <p className="text-xs text-white/70 mt-2">
                      {selectedABC === 'A' ? 'High-value items' : selectedABC === 'B' ? 'Medium-value items' : 'Low-value items'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Class {selectedABC} Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-2 px-3 text-sm text-gray-400">SKU</th>
                          <th className="text-left py-2 px-3 text-sm text-gray-400">Product Name</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Quantity</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Unit Cost</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">Total Value</th>
                          <th className="text-right py-2 px-3 text-sm text-gray-400">% of Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abcDetailData.items && abcDetailData.items.map(item => (
                          <tr key={item.sku} className="border-b border-gray-700/30 last:border-0">
                            <td className="py-2 px-3 font-mono text-blue-400 text-sm">{item.sku}</td>
                            <td className="py-2 px-3 text-white text-sm">{item.product_name}</td>
                            <td className="py-2 px-3 text-gray-300 text-sm text-right">{formatNumber(item.quantity)}</td>
                            <td className="py-2 px-3 text-gray-300 text-sm text-right">{formatCurrency(item.unit_cost)}</td>
                            <td className="py-2 px-3 text-green-400 text-sm text-right font-medium">
                              {formatCurrency(item.total_value)}
                            </td>
                            <td className="py-2 px-3 text-gray-400 text-sm text-right">
                              {((item.total_value / Math.max(abcDetailData.total_value, 1)) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
 };
export default InventoryValuation;

