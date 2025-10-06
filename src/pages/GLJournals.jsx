import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, FileText,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  BookOpen, Calculator, Send, X, Save, PlusCircle, MinusCircle,
  Menu, ChevronLeft, RotateCcw, Archive, PieChart
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const GLJournals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('posting_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [postingConfirm, setPostingConfirm] = useState(false);
  const [cancellingJournal, setCancellingJournal] = useState(false);
  const [deletingJournal, setDeletingJournal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTrialBalance, setShowTrialBalance] = useState(false);
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [trialBalanceLoading, setTrialBalanceLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    posting_date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    lines: [
      { line_number: 1, account: '', cost_center: '', debit_amount: '', credit_amount: '', description: '' }
    ]
  });

  useEffect(() => {
    fetchJournals();
    fetchAccounts();
    fetchCostCenters();
  }, []);

  const fetchJournals = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('api/gl-journals/');
      setJournals(res.data.results || res.data);
    } catch (err) {
      console.error('Journals fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('api/chart-of-accounts/');
      setAccounts(res.data.results || res.data);
    } catch (err) {
      console.error('Accounts fetch error:', err);
    }
  };

  const fetchCostCenters = async () => {
    try {
      const res = await api.get('api/cost-centers/');
      setCostCenters(res.data.results || res.data);
    } catch (err) {
      console.error('Cost centers fetch error:', err);
    }
  };

  const fetchTrialBalance = async () => {
    setTrialBalanceLoading(true);
    try {
      const res = await api.get('api/gl-journals/trial_balance/');
      setTrialBalanceData(res.data);
      setShowTrialBalance(true);
    } catch (err) {
      console.error('Trial balance fetch error:', err);
    } finally {
      setTrialBalanceLoading(false);
    }
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    try {
      const sanitizedLines = formData.lines.map(line => ({
        ...line,
        debit_amount: line.debit_amount === '' ? 0 : parseFloat(line.debit_amount),
        credit_amount: line.credit_amount === '' ? 0 : parseFloat(line.credit_amount),
      }));

      const totalDebit = sanitizedLines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
      const totalCredit = sanitizedLines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

      const journalData = {
        ...formData,
        lines: sanitizedLines,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'draft',
      };

      await api.post('api/gl-journals/', journalData);
      setShowJournalModal(false);
      resetForm();
      fetchJournals();
    } catch (err) {
      console.error('Journal save error:', err);
      alert('Error saving journal: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateJournal = async (e) => {
    e.preventDefault();
    if (!editingJournal) return;

    try {
      const sanitizedLines = formData.lines.map(line => ({
        ...line,
        debit_amount: line.debit_amount === '' ? 0 : parseFloat(line.debit_amount),
        credit_amount: line.credit_amount === '' ? 0 : parseFloat(line.credit_amount),
      }));

      const totalDebit = sanitizedLines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
      const totalCredit = sanitizedLines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

      const journalData = {
        ...formData,
        lines: sanitizedLines,
        total_debit: totalDebit,
        total_credit: totalCredit,
      };

      await api.patch(`api/gl-journals/${editingJournal.id}/`, journalData);
      setShowJournalModal(false);
      setEditingJournal(null);
      resetForm();
      fetchJournals();
    } catch (err) {
      console.error('Journal update error:', err);
      alert('Error updating journal: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePostJournal = async (journalId) => {
    try {
      await api.post(`api/gl-journals/${journalId}/post_journal/`);
      setPostingConfirm(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch (err) {
      console.error('Journal posting error:', err);
      alert('Error posting journal: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelJournal = async (journalId) => {
    try {
      await api.post(`api/gl-journals/${journalId}/cancel_journal/`);
      setCancellingJournal(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch (err) {
      console.error('Journal cancellation error:', err);
      alert('Error cancelling journal: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteJournal = async (journalId) => {
    try {
      await api.delete(`api/gl-journals/${journalId}/`);
      setDeletingJournal(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch (err) {
      console.error('Journal deletion error:', err);
      alert('Error deleting journal: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditJournal = (journal) => {
    if (journal.status !== 'draft') {
      alert('Only draft journals can be edited');
      return;
    }
    
    setEditingJournal(journal);
    setFormData({
      posting_date: journal.posting_date,
      reference: journal.reference || '',
      narration: journal.narration || '',
      lines: journal.lines.map(line => ({
        line_number: line.line_number,
        account: line.account,
        cost_center: line.cost_center || '',
        debit_amount: line.debit_amount || '',
        credit_amount: line.credit_amount || '',
        description: line.description || ''
      }))
    });
    setShowJournalModal(true);
  };

  const addJournalLine = () => {
    const newLineNumber = formData.lines.length + 1;
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { line_number: newLineNumber, account: '', cost_center: '', debit_amount: '', credit_amount: '', description: '' }
      ]
    });
  };

  const removeJournalLine = (index) => {
    if (formData.lines.length <= 1) return;
    
    const updatedLines = formData.lines.filter((_, i) => i !== index)
      .map((line, i) => ({ ...line, line_number: i + 1 }));
    
    setFormData({
      ...formData,
      lines: updatedLines
    });
  };

  const updateLineField = (index, field, value) => {
    const updatedLines = formData.lines.map((line, i) => {
      if (i === index) {
        // If setting debit, clear credit and vice versa
        if (field === 'debit_amount' && value !== '' && parseFloat(value) > 0) {
          return { ...line, [field]: value, credit_amount: '' };
        } else if (field === 'credit_amount' && value !== '' && parseFloat(value) > 0) {
          return { ...line, [field]: value, debit_amount: '' };
        }
        return { ...line, [field]: value };
      }
      return line;
    });
    
    setFormData({
      ...formData,
      lines: updatedLines
    });
  };

  const resetForm = () => {
    setFormData({
      posting_date: new Date().toISOString().split('T')[0],
      reference: '',
      narration: '',
      lines: [
        { line_number: 1, account: '', cost_center: '', debit_amount: '', credit_amount: '', description: '' }
      ]
    });
    setEditingJournal(null);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Draft' },
      'posted': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Posted' },
      'cancelled': { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' }
    };
    
    return statusConfig[status] || { color: 'text-gray-400', bg: 'bg-gray-500/10', label: status };
  };

  const isJournalBalanced = (journal) => {
    return journal.total_debit === journal.total_credit;
  };

  // Filter and sort journals
  const filteredJournals = journals
    .filter(journal => {
      const matchesSearch = journal.journal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.narration?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || journal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'journal_number') {
        aValue = a.journal_number;
        bValue = b.journal_number;
      } else if (sortBy === 'posting_date') {
        aValue = new Date(a.posting_date);
        bValue = new Date(b.posting_date);
      } else if (sortBy === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else if (sortBy === 'total_debit') {
        aValue = a.total_debit;
        bValue = b.total_debit;
      } else if (sortBy === 'total_credit') {
        aValue = a.total_credit;
        bValue = b.total_credit;
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
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-3 p-1 rounded-lg hover:bg-gray-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                >
                  General Ledger Journals
                </motion.h1>
                <p className="text-gray-400 text-sm mt-1">Money matters—track, report, analyze</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTrialBalance}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all"
              >
                <PieChart className="w-4 h-4" />
                <span className="hidden md:block text-sm">Trial Balance</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchJournals}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:block text-sm">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setShowJournalModal(true);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 md:px-4 md:py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Journal</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="posted">Posted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sortField, order] = e.target.value.split('-');
                    setSortBy(sortField);
                    setSortOrder(order);
                  }}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="posting_date-desc">Date: Newest First</option>
                  <option value="posting_date-asc">Date: Oldest First</option>
                  <option value="journal_number-desc">Journal #: Descending</option>
                  <option value="journal_number-asc">Journal #: Ascending</option>
                  <option value="status-desc">Status: Z-A</option>
                  <option value="status-asc">Status: A-Z</option>
                  <option value="total_debit-desc">Debit: High to Low</option>
                  <option value="total_debit-asc">Debit: Low to High</option>
                  <option value="total_credit-desc">Credit: High to Low</option>
                  <option value="total_credit-asc">Credit: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Journals Table */}
          {filteredJournals.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-8 md:p-12 text-center">
              <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-400 mb-2">No journals found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or create a new journal</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowJournalModal(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                Create Your First Journal
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Journal #</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Reference</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Debit Total</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Credit Total</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Status</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJournals.map(journal => {
                      const statusBadge = getStatusBadge(journal.status);
                      const isBalanced = isJournalBalanced(journal);
                      
                      return (
                        <motion.tr 
                          key={journal.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30 cursor-pointer"
                          onClick={() => {
                            setSelectedJournal(journal);
                            setShowDetailModal(true);
                          }}
                        >
                          <td className="py-3 px-4 font-mono text-blue-400">{journal.journal_number}</td>
                          <td className="py-3 px-4 text-gray-300">{formatDate(journal.posting_date)}</td>
                          <td className="py-3 px-4 text-white max-w-xs truncate">{journal.reference || '-'}</td>
                          <td className="py-3 px-4 text-emerald-400">{formatCurrency(journal.total_debit)}</td>
                          <td className="py-3 px-4 text-rose-400">{formatCurrency(journal.total_credit)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.color}`}>
                                {statusBadge.label}
                              </span>
                              {isBalanced ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedJournal(journal);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 hover:bg-gray-700/50 rounded text-blue-400"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {journal.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedJournal(journal);
                                      setPostingConfirm(true);
                                    }}
                                    className="p-1 hover:bg-gray-700/50 rounded text-emerald-400"
                                    title="Post Journal"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditJournal(journal)}
                                    className="p-1 hover:bg-gray-700/50 rounded text-amber-400"
                                    title="Edit Journal"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedJournal(journal);
                                      setDeletingJournal(true);
                                    }}
                                    className="p-1 hover:bg-gray-700/50 rounded text-red-400"
                                    title="Delete Journal"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {journal.status === 'posted' && (
                                <button
                                  onClick={() => {
                                    setSelectedJournal(journal);
                                    setCancellingJournal(true);
                                  }}
                                  className="p-1 hover:bg-gray-700/50 rounded text-orange-400"
                                  title="Cancel Journal"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {filteredJournals.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Total Journals</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{filteredJournals.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Draft Journals</p>
                    <p className="text-xl md:text-2xl font-bold text-amber-400">
                      {filteredJournals.filter(j => j.status === 'draft').length}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Posted Journals</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">
                      {filteredJournals.filter(j => j.status === 'posted').length}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Total Value</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-400">
                      {formatCurrency(filteredJournals.reduce((sum, j) => sum + (j.total_debit || 0), 0))}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Journal Modal */}
      <AnimatePresence>
        {showJournalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowJournalModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {editingJournal ? 'Edit Journal Entry' : 'Create New Journal Entry'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowJournalModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">Add debit and credit entries to create a balanced journal</p>
              </div>
              
              <form onSubmit={editingJournal ? handleUpdateJournal : handleCreateJournal} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Posting Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.posting_date}
                      onChange={e => setFormData({...formData, posting_date: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Reference</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={e => setFormData({...formData, reference: e.target.value})}
                      placeholder="Optional reference"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-1">Narration</label>
                  <textarea
                    value={formData.narration}
                    onChange={e => setFormData({...formData, narration: e.target.value})}
                    rows={2}
                    placeholder="Journal description or notes"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Journal Lines */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Journal Lines</h4>
                    <button
                      type="button"
                      onClick={addJournalLine}
                      className="flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Line</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.lines.map((line, index) => (
                      <div key={index} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Line #{line.line_number}</span>
                          {formData.lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeJournalLine(index)}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Account *</label>
                            <select
                              required
                              value={line.account}
                              onChange={e => updateLineField(index, 'account', e.target.value)}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Select Account</option>
                              {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                  {account.account_code} - {account.account_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Cost Center</label>
                            <select
                              value={line.cost_center}
                              onChange={e => updateLineField(index, 'cost_center', e.target.value)}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Select Cost Center</option>
                              {costCenters.map(center => (
                                <option key={center.id} value={center.id}>
                                  {center.cost_center_code}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Debit Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.debit_amount}
                              onChange={e => updateLineField(index, 'debit_amount', e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Credit Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.credit_amount}
                              onChange={e => updateLineField(index, 'credit_amount', e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-xs text-gray-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={line.description}
                            onChange={e => updateLineField(index, 'description', e.target.value)}
                            placeholder="Line description"
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Total Debit</label>
                      <p className="text-lg font-mono text-emerald-400">
                        {formatCurrency(formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit_amount) || 0), 0))}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Total Credit</label>
                      <p className="text-lg font-mono text-rose-400">
                        {formatCurrency(formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit_amount) || 0), 0))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Balance Status</span>
                      {formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit_amount) || 0), 0) === 
                       formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit_amount) || 0), 0) ? (
                        <span className="text-emerald-400 text-sm font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Balanced
                        </span>
                      ) : (
                        <span className="text-amber-400 text-sm font-medium flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Not Balanced
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJournalModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit_amount) || 0), 0) !== 
                             formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit_amount) || 0), 0)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-xl transition-all"
                  >
                    {editingJournal ? 'Update Journal' : 'Create Journal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedJournal && (
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
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedJournal.journal_number}</h3>
                    <p className="text-gray-400 text-sm">{formatDate(selectedJournal.posting_date)}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Journal Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Reference</h4>
                    <p className="text-white">{selectedJournal.reference || 'No reference'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Status</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedJournal.status).bg} ${getStatusBadge(selectedJournal.status).color}`}>
                        {getStatusBadge(selectedJournal.status).label}
                      </span>
                      {isJournalBalanced(selectedJournal) ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Narration */}
                {selectedJournal.narration && (
                  <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">Narration</h4>
                    <p className="text-white bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      {selectedJournal.narration}
                    </p>
                  </div>
                )}
                
                {/* Journal Lines */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-4">Journal Lines</h4>
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Account</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Cost Center</th>
                          <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Debit</th>
                          <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Credit</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJournal.lines?.map(line => (
                          <tr key={line.id} className="border-b border-gray-700/30 last:border-0">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-mono text-blue-400">{line.account_code}</div>
                                <div className="text-xs text-gray-400">{line.account_name}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {line.cost_center_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-400">
                              {line.debit_amount ? formatCurrency(line.debit_amount) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-rose-400">
                              {line.credit_amount ? formatCurrency(line.credit_amount) : '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {line.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-800/50">
                          <td colSpan="2" className="py-3 px-4 text-right font-medium text-gray-400">Totals:</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium">
                            {formatCurrency(selectedJournal.total_debit)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-400 font-medium">
                            {formatCurrency(selectedJournal.total_credit)}
                          </td>
                          <td className="py-3 px-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  {selectedJournal.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {
                          setPostingConfirm(true);
                          setShowDetailModal(false);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        Post Journal
                      </button>
                      <button
                        onClick={() => {
                          handleEditJournal(selectedJournal);
                          setShowDetailModal(false);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        Edit Journal
                      </button>
                      <button
                        onClick={() => {
                          setDeletingJournal(true);
                          setShowDetailModal(false);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        Delete Journal
                      </button>
                    </>
                  )}
                  
                  {selectedJournal.status === 'posted' && (
                    <button
                      onClick={() => {
                        setCancellingJournal(true);
                        setShowDetailModal(false);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl transition-colors"
                    >
                      Cancel Journal
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {postingConfirm && selectedJournal && (
          <ConfirmationModal
            title="Post Journal"
            message={`Are you sure you want to post journal ${selectedJournal.journal_number}? This action cannot be undone.`}
            confirmText="Post Journal"
            confirmColor="emerald"
            onConfirm={() => handlePostJournal(selectedJournal.id)}
            onCancel={() => setPostingConfirm(false)}
          />
        )}
        
        {cancellingJournal && selectedJournal && (
          <ConfirmationModal
            title="Cancel Journal"
            message={`Are you sure you want to cancel journal ${selectedJournal.journal_number}? This will create a reversing entry.`}
            confirmText="Cancel Journal"
            confirmColor="orange"
            onConfirm={() => handleCancelJournal(selectedJournal.id)}
            onCancel={() => setCancellingJournal(false)}
          />
        )}
        
        {deletingJournal && selectedJournal && (
          <ConfirmationModal
            title="Delete Journal"
            message={`Are you sure you want to delete journal ${selectedJournal.journal_number}? This action cannot be undone.`}
            confirmText="Delete Journal"
            confirmColor="rose"
            onConfirm={() => handleDeleteJournal(selectedJournal.id)}
            onCancel={() => setDeletingJournal(false)}
          />
        )}
        
        {showTrialBalance && (
          <TrialBalanceModal
            data={trialBalanceData}
            loading={trialBalanceLoading}
            onClose={() => setShowTrialBalance(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ title, message, confirmText, confirmColor, onConfirm, onCancel }) => {
  const colorClasses = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    rose: 'bg-rose-600 hover:bg-rose-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 rounded-xl transition-colors ${colorClasses[confirmColor]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Trial Balance Modal Component
const TrialBalanceModal = ({ data, loading, onClose }) => {
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
        className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Trial Balance Report</h3>
              <p className="text-gray-400 text-sm">
                As of {data?.as_of_date ? new Date(data.as_of_date).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : data ? (
            <div>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total Debits</p>
                  <p className="text-xl font-mono text-emerald-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_debits || 0)}
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total Credits</p>
                  <p className="text-xl font-mono text-rose-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_credits || 0)}
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Net Difference</p>
                  <p className={`text-xl font-mono ${(data.total_debits - data.total_credits) === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((data.total_debits || 0) - (data.total_credits || 0))}
                  </p>
                </div>
              </div>
              
              {/* Account Balances Table */}
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Account Code</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Account Name</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Type</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Debit Total</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Credit Total</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.account_balances?.map((account, index) => (
                      <tr key={index} className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-mono text-blue-400">{account.account_code}</td>
                        <td className="py-3 px-4 text-white">{account.account_name}</td>
                        <td className="py-3 px-4 text-gray-300">{account.account_type}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.debit_total || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-rose-400">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.credit_total || 0)}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono ${(account.net_balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.net_balance || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Unable to load trial balance data</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GLJournals;