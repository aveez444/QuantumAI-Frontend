// CustomerPurchaseOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Download, Search, Filter, Plus, Edit, Trash2,
  Eye, CheckCircle, XCircle, Clock, Calendar, User, DollarSign,
  Package, Truck, FileCheck, AlertCircle, MoreVertical, RefreshCw,
  ChevronDown, ChevronRight, FileUp, FileX, ArrowLeft, ArrowRight,
  FileIcon, Check, X, Loader
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const CustomerPurchaseOrders = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [customers, setCustomers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Status options with better colors
  const statusOptions = [
    { value: 'received', label: 'Received', color: 'blue', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { value: 'acknowledged', label: 'Acknowledged', color: 'purple', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
    { value: 'in_progress', label: 'In Progress', color: 'orange', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400' },
    { value: 'completed', label: 'Completed', color: 'green', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'red', bgColor: 'bg-red-500/10', textColor: 'text-red-400' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCustomers(),
        fetchPurchaseOrders()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('api/parties/?party_type=customer');
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setRefreshing(true);
      let url = 'api/customer-pos/';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (customerFilter !== 'all') params.append('customer_id', customerFilter);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      console.log('Fetched purchase orders:', response.data);
      setPurchaseOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
  
    try {
      const formDataToSend = new FormData();
      const documentFile = formData.document;
      
      // Add all form data except document first
      Object.keys(formData).forEach(key => {
        if (key !== 'document' && formData[key]) {
          const apiKey = key === 'customer_id' ? 'customer' : key;
          if (key === 'po_amount') {
            formDataToSend.append('amount', formData[key]); // Use write-only field
          } else {
            formDataToSend.append(apiKey, formData[key]);
          }
        }
      });
  
      console.log('Creating purchase order without document...');
  
      // Step 1: Create the purchase order first
      const response = await api.post('api/customer-pos/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const createdOrder = response.data;
      console.log('Purchase order created:', createdOrder);
  
      // Step 2: If there's a document, upload it separately
      if (documentFile) {
        console.log('Uploading document separately...');
        const documentFormData = new FormData();
        documentFormData.append('document', documentFile);
  
        await api.post(`api/customer-pos/${createdOrder.id}/upload_document/`, documentFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
  
        console.log('Document uploaded successfully');
        
        // Refresh the order data to get the document URL
        const updatedResponse = await api.get(`api/customer-pos/${createdOrder.id}/`);
        setPurchaseOrders(prev => [updatedResponse.data, ...prev]);
      } else {
        setPurchaseOrders(prev => [createdOrder, ...prev]);
      }
  
      setShowCreateModal(false);
      setFormData({});
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      let url;
      switch (newStatus) {
        case 'acknowledged':
          url = `api/customer-pos/${order.id}/acknowledge/`;
          break;
        case 'in_progress':
          url = `api/customer-pos/${order.id}/start_processing/`;
          break;
        case 'completed':
          url = `api/customer-pos/${order.id}/complete/`;
          break;
        default:
          return;
      }

      const response = await api.post(url);
      setPurchaseOrders(prev => prev.map(po => 
        po.id === order.id ? { ...po, status: newStatus } : po
      ));
      
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDocumentUpload = async (order, file) => {
    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('document', file);
  
      await api.post(`api/customer-pos/${order.id}/upload_document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      // Immediately update the local state instead of refetching everything
      const updatedOrder = { ...order, po_document: URL.createObjectURL(file) };
      
      setPurchaseOrders(prev => prev.map(po => 
        po.id === order.id ? updatedOrder : po
      ));
      
      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(updatedOrder);
      }
  
      setShowDocumentModal(false);
      
      // Optional: Refetch the actual data in background to get proper document URL
      setTimeout(async () => {
        try {
          const refreshedOrder = await api.get(`api/customer-pos/${order.id}/`);
          setPurchaseOrders(prev => prev.map(po => 
            po.id === order.id ? refreshedOrder.data : po
          ));
          if (selectedOrder && selectedOrder.id === order.id) {
            setSelectedOrder(refreshedOrder.data);
          }
        } catch (error) {
          console.error('Error refreshing order data:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploadingDocument(false);
    }
  };
  
  const handleDeleteDocument = async (order) => {
    if (!window.confirm('Are you sure you want to remove this document?')) {
      return;
    }
  
    try {
      // Immediately update UI optimistically
      const updatedOrder = { ...order, po_document: null, document_url: null };
      
      setPurchaseOrders(prev => prev.map(po => 
        po.id === order.id ? updatedOrder : po
      ));
      
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(updatedOrder);
      }
  
      // Then make the API call
      await api.delete(`api/customer-pos/${order.id}/delete_document/`);
      
      console.log('Document deleted successfully');
      
      // Refresh to ensure sync with backend
      setTimeout(async () => {
        try {
          const refreshedOrder = await api.get(`api/customer-pos/${order.id}/`);
          setPurchaseOrders(prev => prev.map(po => 
            po.id === order.id ? refreshedOrder.data : po
          ));
          if (selectedOrder && selectedOrder.id === order.id) {
            setSelectedOrder(refreshedOrder.data);
          }
        } catch (error) {
          console.error('Error refreshing after delete:', error);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error deleting document:', error);
      
      // Revert optimistic update on error
      setPurchaseOrders(prev => prev.map(po => 
        po.id === order.id ? order : po
      ));
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(order);
      }
      
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleDelete = async (order) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }

    try {
      await api.delete(`api/customer-pos/${order.id}/`);
      setPurchaseOrders(prev => prev.filter(po => po.id !== order.id));
      
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.po_number?.toLowerCase().includes(searchLower) ||
      order.customer?.display_name?.toLowerCase().includes(searchLower) ||
      order.customer_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
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
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600"
              >
                Customer Purchase Orders
              </motion.h1>
              <p className="text-gray-400 mt-1">
                Manage customer purchase orders and documents
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchPurchaseOrders}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Purchase Order</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by PO number or customer..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.display_name}
                </option>
              ))}
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No purchase orders found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' || customerFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating your first purchase order'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && customerFilter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Create Purchase Order
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleOrderClick(order)}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-xl ${statusInfo.bgColor} group-hover:scale-110 transition-transform`}>
                          <FileCheck className={`w-6 h-6 ${statusInfo.textColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {order.po_number}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-gray-400 truncate">
                            {order.customer?.display_name || order.customer_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(order.po_amount)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(order.po_date)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {order.po_document ? (
                            <FileText className="w-5 h-5 text-green-400" />
                          ) : (
                            <FileX className="w-5 h-5 text-gray-500" />
                          )}
                          
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Due: {formatDate(order.delivery_required_by)}</span>
                        {order.description && (
                          <span className="truncate max-w-xs">• {order.description}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span>Created: {formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateModal
            customers={customers}
            onClose={() => {
              setShowCreateModal(false);
              setFormData({});
              setErrors({});
            }}
            onSubmit={handleCreate}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <DetailModal
            order={selectedOrder}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedOrder(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            onDocumentUpload={() => {
              setShowDetailModal(false);
              setShowDocumentModal(true);
            }}
            onDeleteDocument={handleDeleteDocument}
            onDelete={handleDelete}
            statusOptions={statusOptions}
          />
        )}
      </AnimatePresence>

      {/* Document Upload Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedOrder && (
          <DocumentModal
            order={selectedOrder}
            uploading={uploadingDocument}
            onClose={() => {
              setShowDocumentModal(false);
              setShowDetailModal(true);
            }}
            onUpload={handleDocumentUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Components
const CreateModal = ({ customers, onClose, onSubmit, formData, setFormData, errors }) => {
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, document: e.target.files[0] }));
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
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-semibold text-white">
            Create Customer Purchase Order
          </h3>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Customer *</label>
              <select
                value={formData.customer_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.display_name}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="text-red-400 text-xs mt-1">{errors.customer}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">PO Number *</label>
              <input
                type="text"
                value={formData.po_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.po_number && <p className="text-red-400 text-xs mt-1">{errors.po_number}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">PO Date *</label>
              <input
                type="date"
                value={formData.po_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, po_date: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Delivery Date</label>
              <input
                type="date"
                value={formData.delivery_required_by || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_required_by: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.po_amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, po_amount: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Document (PDF)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Create Purchase Order
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const DetailModal = ({ order, onClose, onStatusUpdate, onDocumentUpload, onDeleteDocument, onDelete, statusOptions }) => {
    const statusInfo = statusOptions.find(opt => opt.value === order.status) || statusOptions[0];
    const [localOrder, setLocalOrder] = useState(order);
  
    // Update local order when prop changes
    useEffect(() => {
      setLocalOrder(order);
    }, [order]);
  
    const getNextStatusAction = (currentStatus) => {
      switch (currentStatus) {
        case 'received':
          return { label: 'Acknowledge', action: 'acknowledged' };
        case 'acknowledged':
          return { label: 'Start Processing', action: 'in_progress' };
        case 'in_progress':
          return { label: 'Mark Complete', action: 'completed' };
        default:
          return null;
      }
    };
  
    const nextAction = getNextStatusAction(localOrder.status);
  
    const handleStatusUpdate = async (newStatus) => {
      try {
        // Optimistic update
        const updatedOrder = { ...localOrder, status: newStatus };
        setLocalOrder(updatedOrder);
        
        // Call the API
        await onStatusUpdate(order, newStatus);
      } catch (error) {
        // Revert on error
        setLocalOrder(order);
      }
    };
  
    const handleDeleteDocument = async () => {
      try {
        // Optimistic update
        const updatedOrder = { ...localOrder, po_document: null, document_url: null };
        setLocalOrder(updatedOrder);
        
        // Call the API
        await onDeleteDocument(order);
      } catch (error) {
        // Revert on error
        setLocalOrder(order);
      }
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
          className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
                <FileCheck className={`w-6 h-6 ${statusInfo.textColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {localOrder.po_number} - Details
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {localOrder.customer?.display_name || localOrder.customer_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Customer</label>
                      <p className="text-white text-lg">{localOrder.customer?.display_name || localOrder.customer_name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">PO Number</label>
                      <p className="text-white font-mono text-lg">{localOrder.po_number}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">PO Date</label>
                      <p className="text-white">{formatDate(localOrder.po_date)}</p>
                    </div>
                  </div>
  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Amount</label>
                      <p className="text-white text-2xl font-semibold">
                        {formatCurrency(localOrder.po_amount)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Delivery Required By</label>
                      <p className="text-white">{formatDate(localOrder.delivery_required_by)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
  
                {localOrder.description && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <p className="text-gray-300 text-sm">{localOrder.description}</p>
                    </div>
                  </div>
                )}
  
                {localOrder.special_instructions && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Special Instructions</label>
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <p className="text-gray-300 text-sm">{localOrder.special_instructions}</p>
                    </div>
                  </div>
                )}
              </div>
  
              {/* Actions & Document Section */}
              <div className="space-y-6">
                {/* Status Actions */}
                {nextAction && (
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h4>
                    <button
                      onClick={() => handleStatusUpdate(nextAction.action)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                    >
                      {nextAction.label}
                    </button>
                  </div>
                )}
  
                {/* Document Section */}
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Document</h4>
                  
                  {localOrder.po_document || localOrder.document_url ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm flex-1 truncate">
                          Document attached
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(localOrder.po_document || localOrder.document_url, '_blank')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={handleDeleteDocument}
                          className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileX className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm mb-3">No document attached</p>
                      <button
                        onClick={onDocumentUpload}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                      >
                        Upload Document
                      </button>
                    </div>
                  )}
                </div>
  
                {/* Danger Zone */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h4>
                  <button
                    onClick={() => onDelete(localOrder)}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Purchase Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

const DocumentModal = ({ order, uploading, onClose, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onUpload(order, file);
    }
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
          <h3 className="text-xl font-semibold text-white">
            Upload Document - {order.po_number}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">
              Select document file
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-gray-500 text-xs mt-2">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export default CustomerPurchaseOrders;