import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Check, X, Edit, Save, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Eye, Download, Search, Filter, Calendar,
  DollarSign, User, Plus, Trash2, MoreVertical, File, Clock,
  Building, Mail, Phone, MapPin, CreditCard, BarChart3, ArrowLeft
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerPOs, setCustomerPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    customer: '',
    reference_customer_po: '',
    invoice_number: '',
    invoice_date: '',
    amount: '',
    due_date: '',
    notes: '',
    status: 'sent'
  });
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    customer: 'all',
    status: 'all',
    date_from: '',
    date_to: '',
    search: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    overdue: 0,
    pending: 0
  });

  // Status options with better colors
  const statusOptions = [
    { value: 'sent', label: 'Sent', color: 'blue', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { value: 'paid', label: 'Paid', color: 'green', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
    { value: 'partial_paid', label: 'Partial Paid', color: 'orange', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400' },
    { value: 'overdue', label: 'Overdue', color: 'red', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.customer) {
      loadCustomerPOs(formData.customer);
    } else {
      setCustomerPOs([]);
    }
  }, [formData.customer]);

  useEffect(() => {
    calculateStats();
  }, [invoices]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvoices(),
        loadCustomers()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setRefreshing(true);
      let url = 'api/customer-invoices/';
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.customer !== 'all') params.append('customer_id', filters.customer);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      setInvoices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('api/parties/', {
        params: { party_type: 'customer' }
      });
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadCustomerPOs = async (customerId) => {
    try {
      const response = await api.get('api/customer-pos/', {
        params: { customer_id: customerId }
      });
      setCustomerPOs(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load customer POs:', error);
    }
  };

  const calculateStats = () => {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const pending = invoices.filter(inv => ['sent', 'partial_paid'].includes(inv.status)).length;
    
    setStats({ total, paid, overdue, pending });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setInvoiceFile(file);
    
    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);
    setFilePreview(fileUrl);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-calculate due date if invoice date changes and customer is selected
    if (field === 'invoice_date' && value && formData.customer) {
      const customer = customers.find(c => c.id === formData.customer);
      const paymentTerms = customer?.payment_terms || 30;
      const dueDate = new Date(value);
      dueDate.setDate(dueDate.getDate() + paymentTerms);
      setFormData(prev => ({ 
        ...prev, 
        due_date: dueDate.toISOString().split('T')[0] 
      }));
    }

    // Auto-generate invoice number if empty
    if (field === 'invoice_date' && value && !formData.invoice_number) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        invoice_number: `INV-${year}${month}-${random}`
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer) newErrors.customer = 'Customer is required';
    if (!formData.invoice_number?.trim()) newErrors.invoice_number = 'Invoice number is required';
    if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!invoiceFile) newErrors.file = 'Invoice document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors before saving');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Format amount properly
      if (formData.amount) {
        submitData.append('amount', formData.amount.replace(/,/g, ''));
      }
      
      // Append file
      submitData.append('invoice_document', invoiceFile);

      const response = await api.post('api/customer-invoices/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Invoice created successfully!');
      
      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      loadInvoices();
      
    } catch (error) {
      console.error('Failed to create invoice:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create invoice. Please try again.';
      alert(errorMessage);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        setErrors(backendErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      await api.patch(`api/customer-invoices/${invoiceId}/`, { status: newStatus });
      alert(`Invoice status updated to ${newStatus}`);
      loadInvoices();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      alert('Failed to update invoice status');
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      reference_customer_po: '',
      invoice_number: '',
      invoice_date: '',
      amount: '',
      due_date: '',
      notes: '',
      status: 'sent'
    });
    setInvoiceFile(null);
    setFilePreview(null);
    setErrors({});
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

    try {
      await api.delete(`api/customer-invoices/${invoiceId}/`);
      alert('Invoice deleted successfully');
      loadInvoices();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

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

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = filters.search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.customer?.display_name?.toLowerCase().includes(searchLower) ||
      invoice.customer_name?.toLowerCase().includes(searchLower)
    );
  });

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
                Customer Invoices
              </motion.h1>
              <p className="text-gray-400 mt-1">
                Manage and track all customer invoices
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadInvoices}
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
                <span>Create Invoice</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Invoices</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Paid</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.paid}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Overdue</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.overdue}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Pending</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.pending}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search invoices..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.customer}
              onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
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
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From Date"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To Date"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {filteredInvoices.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.search || filters.status !== 'all' || filters.customer !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating your first invoice'
                }
              </p>
              {!filters.search && filters.status === 'all' && filters.customer === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Create Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInvoices.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.status);
                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleViewDetails(invoice)}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-xl ${statusInfo.bgColor} group-hover:scale-110 transition-transform`}>
                          <FileText className={`w-6 h-6 ${statusInfo.textColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {invoice.invoice_number}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-gray-400 truncate">
                            {invoice.customer?.display_name || invoice.customer_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(invoice.invoice_amount)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(invoice.invoice_date)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {invoice.document_url ? (
                            <FileText className="w-5 h-5 text-green-400" />
                          ) : (
                            <File className="w-5 h-5 text-gray-500" />
                          )}
                          
                          <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors rotate-180" />
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Due: {formatDate(invoice.due_date)}</span>
                        {invoice.notes && (
                          <span className="truncate max-w-xs">• {invoice.notes}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span>Created: {formatDate(invoice.created_at)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInvoiceModal
            customers={customers}
            customerPOs={customerPOs}
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            invoiceFile={invoiceFile}
            onFileUpload={handleFileUpload}
            filePreview={filePreview}
            errors={errors}
            submitting={submitting}
            handleInputChange={handleInputChange}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedInvoice(null);
            }}
            onStatusUpdate={handleUpdateStatus}
            onDelete={handleDeleteInvoice}
            statusOptions={statusOptions}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Invoice Modal Component
const CreateInvoiceModal = ({ 
  customers, 
  customerPOs, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData,
  invoiceFile,
  onFileUpload,
  filePreview,
  errors,
  submitting,
  handleInputChange 
}) => {
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
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-semibold text-white">
            Create Customer Invoice
          </h3>
        </div>

        <form onSubmit={onSubmit} className="flex h-[calc(90vh-120px)]">
          {/* Left Column - File Upload & Preview */}
          <div className="w-1/2 border-r border-gray-700/50 p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice Document</h3>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block w-full">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  invoiceFile 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={onFileUpload}
                    className="hidden"
                  />
                  
                  {invoiceFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                      <p className="text-white font-medium">{invoiceFile.name}</p>
                      <p className="text-green-400 text-sm mt-1">Document uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-white font-medium">Upload Invoice PDF</p>
                      <p className="text-gray-400 text-sm mt-1">Click to browse or drag and drop</p>
                      <p className="text-gray-500 text-xs mt-2">Max file size: 10MB</p>
                    </div>
                  )}
                </div>
              </label>
              {errors.file && (
                <p className="text-red-400 text-xs mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="flex-1 border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="bg-gray-900 p-3 border-b border-gray-700/50">
                  <p className="text-white font-medium text-sm">Document Preview</p>
                </div>
                <div className="h-full bg-gray-900/50">
                  <iframe
                    src={filePreview}
                    className="w-full h-full"
                    title="Invoice Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice Details</h3>
            
            <div className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer *</label>
                <select
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  className={`w-full bg-gray-800/50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customer ? 'border-red-500' : 'border-gray-700'
                  }`}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.display_name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="text-red-400 text-xs mt-1">{errors.customer}</p>
                )}
              </div>

              {/* Customer PO Reference */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer PO Reference</label>
                <select
                  value={formData.reference_customer_po}
                  onChange={(e) => handleInputChange('reference_customer_po', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a customer PO (optional)</option>
                  {customerPOs.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.po_number} - {formatDate(po.po_date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Invoice Number *</label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  className={`w-full bg-gray-800/50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.invoice_number ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="INV-2024-001"
                  required
                />
                {errors.invoice_number && (
                  <p className="text-red-400 text-xs mt-1">{errors.invoice_number}</p>
                )}
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Invoice Date *</label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                  className={`w-full bg-gray-800/50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.invoice_date ? 'border-red-500' : 'border-gray-700'
                  }`}
                  required
                />
                {errors.invoice_date && (
                  <p className="text-red-400 text-xs mt-1">{errors.invoice_date}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Invoice Amount ($) *</label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    handleInputChange('amount', value);
                  }}
                  className={`w-full bg-gray-800/50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="50000.00"
                  required
                />
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Invoice Detail Modal Component
const InvoiceDetailModal = ({ invoice, onClose, onStatusUpdate, onDelete, statusOptions }) => {
  const statusInfo = statusOptions.find(opt => opt.value === invoice.status) || statusOptions[0];

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
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Invoice Details
              </h3>
              <p className="text-gray-400 mt-1">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Status Badge - Prominently Displayed */}
              <div className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} font-medium flex items-center space-x-2`}>
                <div className={`w-2 h-2 rounded-full bg-current`} />
                <span>{statusInfo.label}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Invoice Details */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>Customer Information</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Customer Name</p>
                      <p className="text-white font-medium">
                        {invoice.customer?.display_name || invoice.customer_name}
                      </p>
                    </div>
                    {invoice.customer?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-300 text-sm">{invoice.customer.email}</p>
                      </div>
                    )}
                    {invoice.customer?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-300 text-sm">{invoice.customer.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>Financial Details</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400">Invoice Amount</span>
                      <span className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(invoice.invoice_amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Invoice Date</span>
                      <span className="text-white">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Due Date</span>
                      <span className={`font-medium ${
                        new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' 
                          ? 'text-red-400' 
                          : 'text-white'
                      }`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions & Additional Info */}
              <div className="space-y-6">
                {/* Status Management */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span>Status Management</span>
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">Update invoice status:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => onStatusUpdate(invoice.id, option.value)}
                          disabled={invoice.status === option.value}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            invoice.status === option.value
                              ? `${option.bgColor} ${option.textColor} cursor-default`
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Document Actions */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Document</span>
                  </h4>
                  <div className="space-y-3">
                    {invoice.document_url ? (
                      <a
                        href={invoice.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 hover:text-blue-300 py-3 rounded-xl transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Invoice PDF</span>
                      </a>
                    ) : (
                      <div className="text-center py-3 text-gray-500 border border-gray-600/50 rounded-xl">
                        No document attached
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span>Danger Zone</span>
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Once deleted, this invoice cannot be recovered.
                  </p>
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 hover:text-red-300 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Invoice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div className="mt-6 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-3">Notes</h4>
                <p className="text-gray-300">{invoice.notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-6 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-semibold text-white mb-4">Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">
                    {new Date(invoice.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">
                    {new Date(invoice.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function for date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default CustomerInvoices;