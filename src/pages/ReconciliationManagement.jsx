import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, Plus, Search, Filter, Calendar, Download, Upload,
  CheckCircle, XCircle, AlertTriangle, Eye, Edit, Trash2, 
  DollarSign, User, BarChart3, Clock, ChevronDown, ChevronUp,
  FileText, RefreshCw, Save, ArrowRight, TrendingUp, TrendingDown,
  CreditCard, Receipt, Building, X, ExternalLink, Copy, AlertCircle,
  Link as LinkIcon, Unlink, Package, History
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const PaymentReconciliation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Master Data
  const [customers, setCustomers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    customer: 'all',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    searchTerm: ''
  });
  
  // Payment Advices
  const [paymentAdvices, setPaymentAdvices] = useState([]);
  const [selectedPA, setSelectedPA] = useState(null);
  const [showPAModal, setShowPAModal] = useState(false);
  const [paModalMode, setPAModalMode] = useState('create'); // 'create', 'edit', 'view'
  
  // Reconciliation
  const [reconciliationMode, setReconciliationMode] = useState('manual'); // 'manual', 'ocr'
  const [invoiceEntries, setInvoiceEntries] = useState([]);
  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [selectedCustomerForRecon, setSelectedCustomerForRecon] = useState(null);
  
  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardData();
    } else if (activeTab === 'advices') {
      loadPaymentAdvices();
    }
  }, [activeTab, filters]);

  const loadInitialData = async () => {
    try {
      const [customersRes] = await Promise.all([
        api.get('api/parties/', { params: { party_type: 'customer' } })
      ]);
      setCustomers(customersRes.data.results || customersRes.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate
      };
      if (filters.customer !== 'all') {
        params.customer_id = filters.customer;
      }
      
      const response = await api.get('reconciliation/dashboard-data/', { params });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentAdvices = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate
      };
      if (filters.customer !== 'all') {
        params.customer_id = filters.customer;
      }
      
      const response = await api.get('api/payment-advices/', { params });
      setPaymentAdvices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load payment advices:', error);
      showToast('Failed to load payment advices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentAdvice = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('api/payment-advices/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast('Payment advice created successfully', 'success');
      setShowPAModal(false);
      setSelectedPA(null);
      loadPaymentAdvices();
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create payment advice:', error);
      showToast(error.response?.data?.error || 'Failed to create payment advice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentAdvice = async (id, formData) => {
    setLoading(true);
    try {
      await api.patch(`api/payment-advices/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast('Payment advice updated successfully', 'success');
      setShowPAModal(false);
      setSelectedPA(null);
      loadPaymentAdvices();
    } catch (error) {
      console.error('Failed to update payment advice:', error);
      showToast('Failed to update payment advice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentAdvice = async (id) => {
    setLoading(true);
    try {
      await api.delete(`api/payment-advices/${id}/`);
      showToast('Payment advice deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      loadPaymentAdvices();
      loadDashboardData();
    } catch (error) {
      console.error('Failed to delete payment advice:', error);
      showToast('Failed to delete payment advice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoiceEntry = () => {
    setInvoiceEntries([...invoiceEntries, { 
      id: Date.now(), 
      invoice_number: '', 
      amount: '', 
      isValid: true,
      isDuplicate: false 
    }]);
  };

  const handleRemoveInvoiceEntry = (id) => {
    setInvoiceEntries(invoiceEntries.filter(entry => entry.id !== id));
  };

  const handleInvoiceEntryChange = (id, field, value) => {
    setInvoiceEntries(invoiceEntries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        // Check for duplicates
        if (field === 'invoice_number') {
          const duplicates = invoiceEntries.filter(e => 
            e.id !== id && e.invoice_number.trim().toLowerCase() === value.trim().toLowerCase()
          );
          updated.isDuplicate = duplicates.length > 0;
        }
        
        return updated;
      }
      return entry;
    }));
  };

  const handleReconcileInvoices = async () => {
    if (!selectedCustomerForRecon) {
      showToast('Please select a customer', 'error');
      return;
    }

    const validEntries = invoiceEntries.filter(e => 
      e.invoice_number.trim() && !e.isDuplicate
    );

    if (validEntries.length === 0) {
      showToast('Please add at least one valid invoice', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: selectedCustomerForRecon,
        invoice_entries: validEntries.map(e => ({
          invoice_number: e.invoice_number.trim(),
          amount: e.amount || undefined
        })),
        start_date: filters.startDate,
        end_date: filters.endDate
      };

      const response = await api.post('reconcile/invoice-numbers/', payload);
      
      if (response.data.success) {
        setReconciliationResult(response.data.reconciliation);
        showToast('Reconciliation completed', 'success');
      }
    } catch (error) {
      console.error('Reconciliation failed:', error);
      showToast(error.response?.data?.error || 'Reconciliation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReconciliation = async () => {
    if (!reconciliationResult) return;

    setLoading(true);
    try {
      const payload = {
        customer_id: reconciliationResult.customer.id,
        advice_date: new Date().toISOString().split('T')[0],
        total_amount: reconciliationResult.summary.matched_amount,
        matched_invoices: reconciliationResult.matched_invoices,
        notes: `Reconciliation: ${reconciliationResult.matched_invoices.length} invoices matched`
      };

      await api.post('save-reconciliation/', payload);
      
      showToast('Reconciliation saved successfully', 'success');
      setReconciliationResult(null);
      setInvoiceEntries([]);
      setSelectedCustomerForRecon(null);
      setActiveTab('dashboard');
      loadDashboardData();
    } catch (error) {
      console.error('Failed to save reconciliation:', error);
      showToast('Failed to save reconciliation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    // Implement your toast notification here
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const openPAModal = (mode, pa = null) => {
    setPAModalMode(mode);
    setSelectedPA(pa);
    setShowPAModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      partial_paid: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      received: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      acknowledged: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
        <div className="min-h-screen bg-gray-900 text-white flex">
        <Sidebar />
        
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            >
              Payment Reconciliation
            </motion.h1>
            <p className="text-gray-400 mt-2">Comprehensive payment advice and invoice reconciliation</p>
          </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'advices', label: 'Payment Advices', icon: CreditCard },
            { id: 'reconcile', label: 'Reconcile', icon: FileCheck },
            { id: 'invoices', label: 'Invoices', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global Filters */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-4 mb-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
              <select
                value={filters.customer}
                onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.party_code} - {c.display_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Invoice, PO number..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={activeTab === 'dashboard' ? loadDashboardData : loadPaymentAdvices}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <DashboardView 
            data={dashboardData} 
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Payment Advices Tab */}
        {activeTab === 'advices' && (
          <PaymentAdvicesView
            advices={paymentAdvices}
            onAdd={() => openPAModal('create')}
            onView={(pa) => openPAModal('view', pa)}
            onEdit={(pa) => openPAModal('edit', pa)}
            onDelete={(pa) => {
              setItemToDelete(pa);
              setShowDeleteConfirm(true);
            }}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            loading={loading}
          />
        )}

        {/* Reconcile Tab */}
        {activeTab === 'reconcile' && (
          <ReconcileView
            customers={customers}
            selectedCustomer={selectedCustomerForRecon}
            onSelectCustomer={setSelectedCustomerForRecon}
            invoiceEntries={invoiceEntries}
            onAddEntry={handleAddInvoiceEntry}
            onRemoveEntry={handleRemoveInvoiceEntry}
            onEntryChange={handleInvoiceEntryChange}
            onReconcile={handleReconcileInvoices}
            reconciliationResult={reconciliationResult}
            onSaveReconciliation={handleSaveReconciliation}
            loading={loading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <InvoicesView
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            customers={customers}
            filters={filters}
          />
        )}

        {/* Payment Advice Modal */}
        <PaymentAdviceModal
          show={showPAModal}
          mode={paModalMode}
          paymentAdvice={selectedPA}
          customers={customers}
          onClose={() => {
            setShowPAModal(false);
            setSelectedPA(null);
          }}
          onCreate={handleCreatePaymentAdvice}
          onUpdate={handleUpdatePaymentAdvice}
          loading={loading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={showDeleteConfirm}
          item={itemToDelete}
          onConfirm={() => handleDeletePaymentAdvice(itemToDelete.id)}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ data, formatCurrency, formatDate, getStatusColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Total Invoices"
        value={data.summary.total_invoices}
        subtitle={formatCurrency(data.summary.total_invoice_amount)}
        icon={FileText}
        color="blue"
      />
      <StatCard
        title="Amount Paid"
        value={formatCurrency(data.summary.total_paid)}
        subtitle={`${Math.round((parseFloat(data.summary.total_paid) / parseFloat(data.summary.total_invoice_amount)) * 100)}% Collected`}
        icon={CheckCircle}
        color="emerald"
      />
      <StatCard
        title="Outstanding"
        value={formatCurrency(data.summary.total_outstanding)}
        subtitle="Pending Collection"
        icon={AlertTriangle}
        color="amber"
      />
      <StatCard
        title="Payment Advices"
        value={data.summary.total_payment_advices}
        subtitle="Processed"
        icon={CreditCard}
        color="purple"
      />
    </div>

    {/* Activity Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActivityCard
        title="Recent Invoices"
        icon={FileText}
        iconColor="blue"
        items={data.invoices.slice(0, 5)}
        renderItem={(invoice) => (
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{invoice.invoice_number}</span>
                <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor(invoice.status)}`}>
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{invoice.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(invoice.amount)}</p>
              <p className="text-gray-400 text-sm">{formatDate(invoice.invoice_date)}</p>
            </div>
          </div>
        )}
      />

      <ActivityCard
        title="Recent Payment Advices"
        icon={CreditCard}
        iconColor="green"
        items={data.payment_advices.slice(0, 5)}
        renderItem={(advice) => (
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex-1">
              <span className="font-medium text-white">{advice.advice_number}</span>
              <p className="text-gray-400 text-sm">{advice.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(advice.total_amount)}</p>
              <p className="text-gray-400 text-sm">{advice.linked_invoices.length} invoices</p>
            </div>
          </div>
        )}
      />
    </div>
  </motion.div>
);

// Payment Advices View Component
const PaymentAdvicesView = ({ advices, onAdd, onView, onEdit, onDelete, formatCurrency, formatDate, loading }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Payment Advices</h2>
      <button
        onClick={onAdd}
        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Create Payment Advice</span>
      </button>
    </div>

    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50 bg-gray-800/30">
              <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Advice Number</th>
              <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Customer</th>
              <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Date</th>
              <th className="text-right py-4 px-6 text-sm text-gray-400 font-medium">Amount</th>
              <th className="text-center py-4 px-6 text-sm text-gray-400 font-medium">Linked</th>
              <th className="text-center py-4 px-6 text-sm text-gray-400 font-medium">Document</th>
              <th className="text-center py-4 px-6 text-sm text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {advices.map((advice, index) => (
              <motion.tr
                key={advice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
              >
                <td className="py-4 px-6">
                  <div className="font-medium text-white">{advice.advice_number}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-300">{advice.customer_name}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-300">{formatDate(advice.advice_date)}</div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="text-white font-medium">{formatCurrency(advice.total_amount)}</div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                    {advice.linked_invoices?.length || 0}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  {advice.document_url ? (
                    <a
                      href={advice.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-400 hover:text-purple-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onView(advice)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => onEdit(advice)}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => onDelete(advice)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
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
    </div>
  </div>
);

// Reconcile View Component
const ReconcileView = ({
  customers, selectedCustomer, onSelectCustomer, invoiceEntries, onAddEntry,
  onRemoveEntry, onEntryChange, onReconcile, reconciliationResult, onSaveReconciliation,
  loading, formatCurrency, formatDate, getStatusColor
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Invoice Entry Panel */}
      <div className="lg:col-span-1 bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FileCheck className="w-6 h-6 mr-2 text-blue-400" />
          Invoice Entry
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Customer</label>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => onSelectCustomer(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.party_code} - {c.display_name}</option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Invoice Entries</label>
                  <button
                    onClick={onAddEntry}
                    className="flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {invoiceEntries.map(entry => (
                    <div key={entry.id} className="bg-gray-700/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={entry.invoice_number}
                            onChange={(e) => onEntryChange(entry.id, 'invoice_number', e.target.value)}
                            placeholder="Invoice number"
                            className={`w-full bg-gray-600/50 border ${entry.isDuplicate ? 'border-red-500' : 'border-gray-600'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                          {entry.isDuplicate && (
                            <p className="text-xs text-red-400 mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Duplicate entry
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveEntry(entry.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="number"
                        value={entry.amount}
                        onChange={(e) => onEntryChange(entry.id, 'amount', e.target.value)}
                        placeholder="Amount (optional)"
                        className="w-full bg-gray-600/50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                  
                  {invoiceEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No entries yet</p>
                      <p className="text-xs">Click "Add" to start</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onReconcile}
                disabled={loading || invoiceEntries.length === 0 || invoiceEntries.some(e => e.isDuplicate)}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" />
                    <span>Reconcile ({invoiceEntries.filter(e => !e.isDuplicate).length})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2">
        {reconciliationResult ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-400">Matched</p>
                    <p className="text-3xl font-bold text-white">{reconciliationResult.summary.total_matched}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(reconciliationResult.summary.matched_amount)}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-400">Missing</p>
                    <p className="text-3xl font-bold text-white">{reconciliationResult.summary.total_missing}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(reconciliationResult.summary.missing_amount)}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-400">Unmatched</p>
                    <p className="text-3xl font-bold text-white">{reconciliationResult.summary.total_unmatched_manual}</p>
                    <p className="text-xs text-gray-400 mt-1">Not in system</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {reconciliationResult.recommendations && reconciliationResult.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {reconciliationResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        rec.type === 'success' ? 'bg-emerald-400' :
                        rec.type === 'warning' ? 'bg-amber-400' :
                        rec.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white">{rec.message}</p>
                        {rec.action && <p className="text-gray-400 text-xs mt-0.5">{rec.action}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Invoices */}
            {reconciliationResult.matched_invoices.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                    Matched Invoices ({reconciliationResult.matched_invoices.length})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50 bg-gray-800/30">
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Invoice</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Amount</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationResult.matched_invoices.map((inv, idx) => (
                        <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-800/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{inv.invoice_number}</div>
                            {inv.entered_number !== inv.invoice_number && (
                              <div className="text-xs text-gray-400">Entered: {inv.entered_number}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{formatDate(inv.invoice_date)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="text-white font-medium">{formatCurrency(inv.invoice_amount)}</div>
                            {inv.amount_discrepancy && (
                              <div className="text-red-400 text-xs">
                                ⚠ Diff: {formatCurrency(inv.amount_discrepancy.difference)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(inv.status)}`}>
                              {inv.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              inv.match_quality === 'exact' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {inv.match_quality}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Missing Invoices */}
            {reconciliationResult.missing_invoices.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-xl border border-amber-500/30 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                    Missing from Payment Advice ({reconciliationResult.missing_invoices.length})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50 bg-gray-800/30">
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Invoice</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Amount</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-400 font-medium">Aging</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationResult.missing_invoices.map((inv, idx) => (
                        <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-800/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{inv.invoice_number}</div>
                            <div className="text-xs text-gray-400">Due: {formatDate(inv.due_date)}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{formatDate(inv.invoice_date)}</td>
                          <td className="py-3 px-4 text-right text-white font-medium">{formatCurrency(inv.invoice_amount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              inv.days_overdue === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                              inv.days_overdue <= 30 ? 'bg-amber-500/20 text-amber-400' :
                              inv.days_overdue <= 60 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {inv.days_overdue}d {inv.aging_bucket}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unmatched Entries */}
            {reconciliationResult.unmatched_manual?.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-xl border border-red-500/30 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <XCircle className="w-5 h-5 mr-2 text-red-400" />
                    Unmatched Entries ({reconciliationResult.unmatched_manual.length})
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {reconciliationResult.unmatched_manual.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div>
                        <div className="font-medium text-white">{entry.entered_number}</div>
                        <div className="text-sm text-gray-400">{entry.reason}</div>
                      </div>
                      {entry.entered_amount && (
                        <div className="text-white font-medium">{formatCurrency(entry.entered_amount)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setReconciliationResult(null);
                  setInvoiceEntries([]);
                }}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
              >
                Reset
              </button>
              <button
                onClick={onSaveReconciliation}
                disabled={loading || reconciliationResult.matched_invoices.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>Save Reconciliation</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900/30 to-gray-900/30 rounded-2xl border border-gray-700/30">
            <div className="text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">Ready to Reconcile</p>
              <p className="text-gray-500 text-sm">Select customer and add invoices to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Invoices View Component
const InvoicesView = ({ 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  customers,
  filters 
}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [invoiceFilters, setInvoiceFilters] = useState({
    customer: filters.customer,
    status: 'all',
    dateFrom: filters.startDate,
    dateTo: filters.endDate,
    searchTerm: ''
  });

  useEffect(() => {
    loadInvoices();
  }, [invoiceFilters]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: invoiceFilters.dateFrom,
        end_date: invoiceFilters.dateTo
      };
      
      if (invoiceFilters.customer !== 'all') {
        params.customer_id = invoiceFilters.customer;
      }
      if (invoiceFilters.status !== 'all') {
        params.status = invoiceFilters.status;
      }
      if (invoiceFilters.searchTerm) {
        params.search = invoiceFilters.searchTerm;
      }

      const response = await api.get('api/customer-invoices/', { params });
      setInvoices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoiceDetail = async (invoice) => {
    setLoading(true);
    try {
      // Fetch full invoice details with PO relationship
      const response = await api.get(`api/customer-invoices/${invoice.id}/`);
      setSelectedInvoice(response.data);
      setShowInvoiceDetail(true);
    } catch (error) {
      console.error('Failed to load invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
            <select
              value={invoiceFilters.customer}
              onChange={(e) => setInvoiceFilters(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.display_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={invoiceFilters.status}
              onChange={(e) => setInvoiceFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="partial_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={invoiceFilters.dateFrom}
              onChange={(e) => setInvoiceFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={invoiceFilters.dateTo}
              onChange={(e) => setInvoiceFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={invoiceFilters.searchTerm}
              onChange={(e) => setInvoiceFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Invoice number..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Customer Invoices ({invoices.length})</h2>
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 bg-gray-800/30">
                <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Invoice #</th>
                <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Customer PO</th>
                <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Date</th>
                <th className="text-left py-4 px-6 text-sm text-gray-400 font-medium">Due Date</th>
                <th className="text-right py-4 px-6 text-sm text-gray-400 font-medium">Amount</th>
                <th className="text-center py-4 px-6 text-sm text-gray-400 font-medium">Status</th>
                <th className="text-center py-4 px-6 text-sm text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-white">{invoice.invoice_number}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{invoice.customer_name}</div>
                  </td>
                  <td className="py-4 px-6">
                    {invoice.reference_customer_po_number ? (
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">{invoice.reference_customer_po_number}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No PO</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-300">{formatDate(invoice.invoice_date)}</td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{formatDate(invoice.due_date)}</div>
                    {new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
                      <div className="text-red-400 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Overdue
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="text-white font-medium">{formatCurrency(invoice.invoice_amount)}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewInvoiceDetail(invoice)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                      {invoice.document_url && (
                        <a
                          href={invoice.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <ExternalLink className="w-4 h-4 text-purple-400" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showInvoiceDetail && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceDetail(false);
            setSelectedInvoice(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

// Invoice Detail Modal Component
const InvoiceDetailModal = ({ invoice, onClose, formatCurrency, formatDate, getStatusColor }) => {
  const [customerPO, setCustomerPO] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice.reference_customer_po) {
      loadCustomerPO();
    }
  }, [invoice]);

  const loadCustomerPO = async () => {
    setLoading(true);
    try {
      const response = await api.get(`api/customer-pos/${invoice.reference_customer_po}/`);
      setCustomerPO(response.data);
    } catch (error) {
      console.error('Failed to load customer PO:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800/95 backdrop-blur-xl z-10">
            <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Invoice Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Invoice Number</label>
                  <p className="text-xl font-bold text-white">{invoice.invoice_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Customer</label>
                  <p className="text-lg text-white">{invoice.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Invoice Date</label>
                  <p className="text-white">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Due Date</label>
                  <p className="text-white">{formatDate(invoice.due_date)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <p className="text-2xl font-bold text-white">{formatCurrency(invoice.invoice_amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div>
                    <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {invoice.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Notes</label>
                    <p className="text-white text-sm">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer PO Section */}
            {customerPO && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-400" />
                  Related Customer Purchase Order
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-300">PO Number</label>
                    <p className="text-white font-medium">{customerPO.po_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-300">PO Date</label>
                    <p className="text-white">{formatDate(customerPO.po_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-300">PO Amount</label>
                    <p className="text-white font-medium">{formatCurrency(customerPO.po_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-300">PO Status</label>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(customerPO.status)}`}>
                      {customerPO.status.replace('_', ' ')}
                    </span>
                  </div>
                  {customerPO.description && (
                    <div className="col-span-2">
                      <label className="text-sm text-blue-300">Description</label>
                      <p className="text-white text-sm">{customerPO.description}</p>
                    </div>
                  )}
                  {customerPO.document_url && (
                    <div className="col-span-2">
                      <a
                        href={customerPO.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View PO Document</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!invoice.reference_customer_po && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-medium">No Customer PO Linked</p>
                    <p className="text-gray-400 text-sm">This invoice is not associated with any customer purchase order.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Link */}
            {invoice.document_url && (
              <div className="flex justify-center">
                <a
                  href={invoice.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span>View Invoice Document</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Reusable Components
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 rounded-2xl p-6 border border-${color}-500/20 backdrop-blur-xl`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm text-${color}-400`}>{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </motion.div>
);

const ActivityCard = ({ title, icon: Icon, iconColor, items, renderItem }) => (
  <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
      <Icon className={`w-5 h-5 mr-2 text-${iconColor}-400`} />
      {title}
      <span className="ml-2 text-sm text-gray-400">({items.length})</span>
    </h3>
    
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderItem(item)}
        </motion.div>
      ))}
    </div>
  </div>
);

const PaymentAdviceModal = ({ show, mode, paymentAdvice, customers, onClose, onCreate, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    advice_number: '',
    advice_date: new Date().toISOString().split('T')[0],
    total_payment_amount: '',
    notes: '',
    document: null
  });

  useEffect(() => {
    if (paymentAdvice && (mode === 'edit' || mode === 'view')) {
      setFormData({
        customer_id: paymentAdvice.customer || '',
        advice_number: paymentAdvice.advice_number || '',
        advice_date: paymentAdvice.advice_date || new Date().toISOString().split('T')[0],
        total_payment_amount: paymentAdvice.total_amount || '',
        notes: paymentAdvice.notes || '',
        document: null
      });
    } else if (mode === 'create') {
      setFormData({
        customer_id: '',
        advice_number: '',
        advice_date: new Date().toISOString().split('T')[0],
        total_payment_amount: '',
        notes: '',
        document: null
      });
    }
  }, [paymentAdvice, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (mode === 'create') {
      onCreate(submitData);
    } else if (mode === 'edit') {
      onUpdate(paymentAdvice.id, submitData);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800/95 backdrop-blur-xl z-10">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'create' ? 'Create Payment Advice' : mode === 'edit' ? 'Edit Payment Advice' : 'Payment Advice Details'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  disabled={mode === 'view'}
                  required
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.party_code} - {c.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Advice Number</label>
                <input
                  type="text"
                  value={formData.advice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, advice_number: e.target.value }))}
                  disabled={mode === 'view'}
                  placeholder="Auto-generated if empty"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Advice Date *</label>
                <input
                  type="date"
                  value={formData.advice_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, advice_date: e.target.value }))}
                  disabled={mode === 'view'}
                  required
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_payment_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_payment_amount: e.target.value }))}
                  disabled={mode === 'view'}
                  required
                  placeholder="50000.00"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Upload</label>
                <input
                  type="file"
                  onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.files[0] }))}
                  disabled={mode === 'view'}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Supported: PDF, JPG, PNG</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>
            </div>

            {mode !== 'view' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DeleteConfirmModal = ({ show, item, onConfirm, onCancel, loading }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Confirm Deletion</h3>
              <p className="text-gray-400 text-sm mb-4">
                Are you sure you want to delete payment advice <span className="font-medium text-white">{item?.advice_number}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{loading ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentReconciliation;