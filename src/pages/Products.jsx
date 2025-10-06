import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3,RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    product_name: '',
    product_type: 'finished_good', // Changed from 'finished_goods'
    uom: 'pcs',
    category: '',
    standard_cost: '',
    reorder_point: '',
    specifications: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('api/products/');
      setProducts(res.data);
      setError(null);
    } catch (err) {
      console.error('Products fetch error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`api/products/${editingProduct.id}/`, formData);
      } else {
        await api.post('api/products/', formData);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      // Reset to correct default values
      setFormData({
        sku: '',
        product_name: '',
        product_type: 'finished_good', // Changed from 'finished_goods'
        uom: 'pcs',
        category: '',
        standard_cost: '',
        reorder_point: '',
        specifications: ''
      });
      fetchProducts();
    } catch (err) {
      console.error('Product save error:', err);
      setError('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    console.log('Editing product:', product); // Debug log
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      product_name: product.product_name,
      product_type: product.product_type, // This should match your Django choices
      uom: product.uom,
      category: product.category,
      standard_cost: product.standard_cost,
      reorder_point: product.reorder_point,
      specifications: product.specifications
    });
    setShowProductModal(true);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowDetailModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await api.delete(`api/products/${editingProduct.id}/`);
      setShowDeleteConfirm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Product delete error:', err);
      setError('Failed to delete product');
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

  const getStockStatus = (currentStock, reorderPoint) => {
    if (currentStock <= 0) return { status: 'out-of-stock', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (currentStock <= reorderPoint) return { status: 'low-stock', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { status: 'in-stock', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const stockStatus = getStockStatus(product.current_stock, product.reorder_point);
      const matchesStockStatus = stockStatusFilter === 'all' || stockStatus.status === stockStatusFilter;
      
      return matchesSearch && matchesCategory && matchesStockStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'sku') {
        aValue = a.sku;
        bValue = b.sku;
      } else if (sortBy === 'name') {
        aValue = a.product_name;
        bValue = b.product_name;
      } else if (sortBy === 'stock') {
        aValue = a.current_stock;
        bValue = b.current_stock;
      } else if (sortBy === 'value') {
        aValue = a.stock_value;
        bValue = b.stock_value;
      } else if (sortBy === 'cost') {
        aValue = a.standard_cost;
        bValue = b.standard_cost;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

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
                Inventory Management
              </motion.h1>
              <p className="text-gray-400 mt-1">Products & Stock Items</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProductModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Product</span>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
              
              {/* Stock Status Filter */}
              <div>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
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
                { key: 'sku', label: 'SKU', icon: Hash },
                { key: 'name', label: 'Name', icon: Tag },
                { key: 'stock', label: 'Stock', icon: Package },
                { key: 'value', label: 'Value', icon: DollarSign },
                { key: 'cost', label: 'Cost', icon: DollarSign }
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

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                Add Your First Product
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.current_stock, product.reorder_point);
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-5 group hover:border-purple-500/30 transition-all"
                    onClick={() => handleViewProduct(product)} // ADD THIS LINE
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${stockStatus.bg}`}>
                        <Package className={`w-5 h-5 ${stockStatus.color}`} />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(product);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Eye className="w-4 h-4 text-green-400" /> {/* ADD THIS BUTTON */}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(product);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-1 truncate">{product.product_name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{product.sku}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Current Stock</span>
                        <span className={`font-medium ${stockStatus.color}`}>
                          {formatNumber(product.current_stock)} {product.uom}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Reorder Point</span>
                        <span className="font-medium text-white">{formatNumber(product.reorder_point)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Unit Cost</span>
                        <span className="font-medium text-white">{formatCurrency(product.standard_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Stock Value</span>
                        <span className="font-medium text-emerald-400">{formatCurrency(product.stock_value)}</span>
                      </div>
                    </div>
                    
                    {product.category && (
                      <div className="mt-4 pt-3 border-t border-gray-700/50">
                        <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">SKU</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Product Name</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Stock</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Unit Cost</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Stock Value</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const stockStatus = getStockStatus(product.current_stock, product.reorder_point);
                    
                    return (
                      <motion.tr 
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4 text-white font-mono">{product.sku}</td>
                        <td className="py-3 px-4 text-white">{product.product_name}</td>
                        <td className="py-3 px-4 text-gray-400">{product.category || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={stockStatus.color}>
                            {formatNumber(product.current_stock)} {product.uom}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">{formatCurrency(product.standard_cost)}</td>
                        <td className="py-3 px-4 text-emerald-400">{formatCurrency(product.stock_value)}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-1 hover:bg-gray-700/50 rounded text-green-400"
                          >
                            <Eye className="w-4 h-4" /> {/* ADD THIS BUTTON */}
                          </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-1 hover:bg-gray-700/50 rounded text-blue-400"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
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
          {filteredProducts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Products</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(filteredProducts.length)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Stock Value</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.stock_value || 0), 0))}
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
                    <p className="text-sm text-gray-400">Low Stock Items</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {formatNumber(filteredProducts.filter(p => 
                        getStockStatus(p.current_stock, p.reorder_point).status === 'low-stock'
                      ).length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatNumber(filteredProducts.filter(p => 
                        getStockStatus(p.current_stock, p.reorder_point).status === 'out-of-stock'
                      ).length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProductModal(false)}
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
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              
              <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={e => setFormData({...formData, product_name: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Product Type</label>
                    <select
                      value={formData.product_type}
                      onChange={e => setFormData({...formData, product_type: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="raw_material">Raw Material</option>
                      <option value="semi_finished">Semi-Finished</option>
                      <option value="finished_good">Finished Good</option> {/* Changed from 'finished_goods' */}
                      <option value="consumable">Consumable</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Unit of Measure</label>
                    <select
                      value={formData.uom}
                      onChange={e => setFormData({...formData, uom: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="mtr">Meters</option>     
                      <option value="ltr">Liters</option>   
                      <option value="set">Set</option>        
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Standard Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.standard_cost}
                      onChange={e => setFormData({...formData, standard_cost: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Reorder Point</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reorder_point}
                      onChange={e => setFormData({...formData, reorder_point: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Specifications</label>
                  <textarea
                    value={formData.specifications}
                    onChange={e => setFormData({...formData, specifications: e.target.value})}
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
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
                  Are you sure you want to delete <span className="text-white font-medium">{editingProduct?.product_name}</span>? 
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
                    onClick={handleDeleteProduct}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Product Detail Modal */}
      <AnimatePresence>
        {showDetailModal && viewingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                      <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Product Details</h3>
                      <p className="text-sm text-gray-400">Complete product information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Product Header */}
                <div className="flex items-start space-x-4 mb-8 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                    <Package className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{viewingProduct.product_name}</h2>
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-400 font-mono text-sm bg-gray-900/50 px-2 py-1 rounded-lg">SKU: {viewingProduct.sku}</p>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        getStockStatus(viewingProduct.current_stock, viewingProduct.reorder_point).bg
                      } ${getStockStatus(viewingProduct.current_stock, viewingProduct.reorder_point).color}`}>
                        {getStockStatus(viewingProduct.current_stock, viewingProduct.reorder_point).status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Product Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Basic Information</label>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Product Type</p>
                          <p className="text-white font-medium capitalize mt-1">{viewingProduct.product_type?.replace(/_/g, ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Category</p>
                          <p className="text-white font-medium mt-1">{viewingProduct.category || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Unit of Measure</p>
                          <p className="text-white font-medium mt-1">{viewingProduct.uom.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Inventory Details</label>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Current Stock</p>
                          <p className="text-white font-medium text-lg mt-1">
                            {formatNumber(viewingProduct.current_stock)} {viewingProduct.uom}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Reorder Point</p>
                          <p className="text-white font-medium mt-1">{formatNumber(viewingProduct.reorder_point)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Standard Cost</p>
                          <p className="text-emerald-400 font-medium text-lg mt-1">{formatCurrency(viewingProduct.standard_cost)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Stock Value</p>
                          <p className="text-purple-400 font-medium text-lg mt-1">{formatCurrency(viewingProduct.stock_value)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Specifications */}
                <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="w-4 h-4 text-blue-400" />
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Specifications</label>
                  </div>
                  <div className="bg-gray-900/30 rounded-xl p-4 min-h-[120px] border border-gray-700/20">
                    {viewingProduct.specifications ? (
                      <p className="text-white whitespace-pre-wrap leading-relaxed">
                        {viewingProduct.specifications}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Info className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No specifications provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-800 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEditProduct(viewingProduct);
                      }}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Product</span>
                    </button>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-2 rounded-xl transition-all duration-200"
                    >
                      Close
                    </button>
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

export default Products;