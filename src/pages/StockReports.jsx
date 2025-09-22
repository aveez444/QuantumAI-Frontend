import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Download, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, MoreHorizontal, CheckCircle,
  XCircle, AlertTriangle, DollarSign, Calendar, Hash,
  Tag, Grid, List, FileText, ShoppingCart, RefreshCw,
  Filter, BarChart3, ArrowUpDown
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const StockReports = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [stockData, setStockData] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // grid or list
  const [sortBy, setSortBy] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state for PO
  const [formData, setFormData] = useState({
    supplier: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    delivery_address: '',
    terms_conditions: '',
    lines: [{ line_number: 1, product: '', quantity: '', unit_price: '' }]
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchStockReport();
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchProducts();
  };

  const fetchStockReport = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('api/products/stock-report/');
      setStockData(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load stock report');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const res = await api.get('api/purchase-orders/');
      setPurchaseOrders(res.data);
    } catch (err) {
      setError('Failed to load purchase orders');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('api/parties/?party_type=supplier');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to load suppliers');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('api/products/');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products');
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      const poData = {
        ...formData,
        supplier: suppliers.find(s => s.id === parseInt(formData.supplier))?.party_code || formData.supplier,
        lines: formData.lines.map(line => ({
          ...line,
          product: products.find(p => p.id === parseInt(line.product))?.sku || line.product
        }))
      };
      if (editingPO) {
        await api.put(`api/purchase-orders/${editingPO.id}/`, poData);
      } else {
        await api.post('api/purchase-orders/', poData);
      }
      setShowPOModal(false);
      setEditingPO(null);
      resetForm();
      fetchPurchaseOrders();
    } catch (err) {
      setError('Failed to save purchase order');
    }
  };

  const handleEditPO = (po) => {
    setEditingPO(po);
    setFormData({
      supplier: po.supplier.id,
      order_date: po.order_date,
      expected_delivery: po.expected_delivery,
      delivery_address: po.delivery_address,
      terms_conditions: po.terms_conditions,
      lines: po.lines.map(line => ({
        line_number: line.line_number,
        product: line.product.id,
        quantity: line.quantity,
        unit_price: line.unit_price
      }))
    });
    setShowPOModal(true);
  };

  const handleDeletePO = async () => {
    try {
      await api.delete(`api/purchase-orders/${editingPO.id}/`);
      setShowDeleteConfirm(false);
      setEditingPO(null);
      fetchPurchaseOrders();
    } catch (err) {
      setError('Failed to delete purchase order');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: '',
      delivery_address: '',
      terms_conditions: '',
      lines: [{ line_number: 1, product: '', quantity: '', unit_price: '' }]
    });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { line_number: formData.lines.length + 1, product: '', quantity: '', unit_price: '' }]
    });
  };

  const removeLine = (index) => {
    const newLines = formData.lines.filter((_, i) => i !== index).map((line, i) => ({ ...line, line_number: i + 1 }));
    setFormData({ ...formData, lines: newLines });
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const handleDownloadStockPDF = async () => {
    try {
      const res = await api.get('api/products/stock-report-pdf/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stock_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download stock report PDF');
    }
  };

  const handleDownloadPOPDF = async (poId) => {
    try {
      const res = await api.get(`api/purchase-orders/${poId}/download_pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${poId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download PO PDF');
    }
  };

  // Filter and sort data
  const filteredStock = stockData
    .filter(item =>
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy], bValue = b[sortBy];
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  const filteredPOs = purchaseOrders
    .filter(po =>
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy], bValue = b[sortBy];
      if (sortBy === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  // Stats calculations
  const totalStockValue = filteredStock.reduce((sum, item) => sum + item.stock_value, 0);
  const lowStockCount = filteredStock.filter(item => item.current_stock > 0 && item.current_stock <= item.reorder_point).length;
  const outOfStockCount = filteredStock.filter(item => item.current_stock <= 0).length;

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

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
                Stock Reports
              </motion.h1>
              <p className="text-gray-400 mt-1">Inventory Insights & Purchase Orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAllData}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
              {activeTab === 'po' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPOModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Purchase Order</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Stock Value</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalStockValue)}</p>
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
                  <p className="text-2xl font-bold text-amber-400">{formatNumber(lowStockCount)}</p>
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
                  <p className="text-2xl font-bold text-red-400">{formatNumber(outOfStockCount)}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="w-5 h-5 text-red-400" />
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('stock')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'stock' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Stock Summary
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('po')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'po' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Purchase Orders
                </motion.button>
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
          </div>

          {/* Content */}
          {error && <p className="text-red-400 mb-4">{error}</p>}

          {activeTab === 'stock' ? (
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadStockPDF}
                className="mb-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Stock PDF</span>
              </motion.button>

              {/* Stock Table/Grid */}
              {viewMode === 'list' ? (
                <div className="overflow-x-auto bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('sku'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          SKU <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('product_name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Name <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('current_stock'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Stock <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('stock_value'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Value <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('reorder_point'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Reorder Point <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStock.map(item => (
                        <tr key={item.sku} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-all">
                          <td className="p-4">{item.sku}</td>
                          <td className="p-4">{item.product_name}</td>
                          <td className="p-4">{formatNumber(item.current_stock)}</td>
                          <td className="p-4">{formatCurrency(item.stock_value)}</td>
                          <td className="p-4">{item.reorder_point}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStock.map(item => (
                    <motion.div
                      key={item.sku}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-4"
                    >
                      <h3 className="font-semibold">{item.product_name}</h3>
                      <p className="text-gray-400">SKU: {item.sku}</p>
                      <p>Stock: {formatNumber(item.current_stock)}</p>
                      <p>Value: {formatCurrency(item.stock_value)}</p>
                      <p>Reorder: {item.reorder_point}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* PO Table/Grid */}
              {viewMode === 'list' ? (
                <div className="overflow-x-auto bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('po_number'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          PO Number <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left">Supplier</th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('order_date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Date <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => { setSortBy('amount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          Amount <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPOs.map(po => (
                        <tr key={po.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-all">
                          <td className="p-4">{po.po_number}</td>
                          <td className="p-4">{po.supplier.display_name}</td>
                          <td className="p-4">{po.order_date}</td>
                          <td className="p-4">{formatCurrency(po.amount)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${po.status === 'received' ? 'bg-emerald-500/20 text-emerald-400' : po.status === 'sent' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {po.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 flex space-x-2">
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEditPO(po)}><Edit className="w-4 h-4 text-blue-400" /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditingPO(po); setShowDeleteConfirm(true); }}><Trash2 className="w-4 h-4 text-red-400" /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDownloadPOPDF(po.id)}><Download className="w-4 h-4 text-green-400" /></motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPOs.map(po => (
                    <motion.div
                      key={po.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-4"
                    >
                      <h3 className="font-semibold">{po.po_number}</h3>
                      <p className="text-gray-400">Supplier: {po.supplier.display_name}</p>
                      <p>Date: {po.order_date}</p>
                      <p>Amount: {formatCurrency(po.amount)}</p>
                      <p>Status: {po.status.toUpperCase()}</p>
                      <div className="flex space-x-2 mt-2">
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEditPO(po)}><Edit className="w-4 h-4 text-blue-400" /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditingPO(po); setShowDeleteConfirm(true); }}><Trash2 className="w-4 h-4 text-red-400" /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDownloadPOPDF(po.id)}><Download className="w-4 h-4 text-green-400" /></motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PO Modal */}
      <AnimatePresence>
        {showPOModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPOModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white">
                  {editingPO ? 'Edit Purchase Order' : 'New Purchase Order'}
                </h3>
              </div>
              <form onSubmit={handleCreatePO} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Supplier *</label>
                  <select
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Order Date *</label>
                    <input
                      type="date"
                      value={formData.order_date}
                      onChange={e => setFormData({ ...formData, order_date: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Expected Delivery</label>
                    <input
                      type="date"
                      value={formData.expected_delivery}
                      onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={formData.delivery_address}
                    onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.terms_conditions}
                    onChange={e => setFormData({ ...formData, terms_conditions: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Order Lines</h4>
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <select
                        value={line.product}
                        onChange={e => updateLine(index, 'product', e.target.value)}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl px-2 py-1 text-sm"
                        required
                      >
                        <option value="">Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                      </select>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={e => updateLine(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="bg-gray-800/50 border border-gray-700 rounded-xl px-2 py-1 text-sm"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={line.unit_price}
                        onChange={e => updateLine(index, 'unit_price', e.target.value)}
                        placeholder="Price"
                        className="bg-gray-800/50 border border-gray-700 rounded-xl px-2 py-1 text-sm"
                        required
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => removeLine(index)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    onClick={addLine}
                    className="flex items-center space-x-1 text-purple-400"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Line</span>
                  </motion.button>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowPOModal(false); setEditingPO(null); resetForm(); }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
                  >
                    {editingPO ? 'Update' : 'Create'}
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
                  Are you sure you want to delete PO <span className="text-white font-medium">{editingPO?.po_number}</span>? 
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
                    onClick={handleDeletePO}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all"
                  >
                    Delete
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

export default StockReports;