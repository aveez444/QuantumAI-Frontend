import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, PieChart, TrendingUp, TrendingDown, Download, Upload, Filter,
  Search, Plus, FileText, DollarSign, Hash, Calendar, ChevronDown, ChevronUp,
  ArrowUpDown, Eye, Edit, Trash2, RefreshCw, Layers, PieChart as PieChartIcon,
  BarChart2, Activity, Target, Users, CreditCard, Building, Landmark,
  Calculator, FileSpreadsheet, FileBarChart, FileOutput, FileDown, FileUp,
  ArrowRight, ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Grid, List,
  ChevronRight, ChevronLeft, DownloadCloud, UploadCloud, BarChart,
  LineChart, ScatterChart, AreaChart
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('trial-balance');
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [trialBalance, setTrialBalance] = useState([]);
  const [profitLoss, setProfitLoss] = useState({});
  const [costCenterAnalysis, setCostCenterAnalysis] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_code: '',
    account_name: '',
    account_type: 'asset',
    parent_account: null,
    description: ''
  });
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [visualizationType, setVisualizationType] = useState('bar'); // 'bar', 'pie', 'line'
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'account_code', direction: 'asc' });

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchChartOfAccounts(),
        fetchTrialBalance(),
        fetchProfitLoss(),
        fetchCostCenterAnalysis(),
        fetchFinancialSummary()
      ]);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartOfAccounts = async () => {
    try {
      const response = await api.get('api/chart-of-accounts/');
      setChartOfAccounts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch chart of accounts:', error);
    }
  };

  const fetchTrialBalance = async () => {
    try {
      const response = await api.get(`finance/trial-balance/?as_of_date=${dateRange.end}`);
      setTrialBalance(response.data.account_balances || []);
    } catch (error) {
      console.error('Failed to fetch trial balance:', error);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      const response = await api.get(`finance/profit-loss/?start_date=${dateRange.start}&end_date=${dateRange.end}`);
      setProfitLoss(response.data);
    } catch (error) {
      console.error('Failed to fetch profit/loss:', error);
    }
  };

  const fetchCostCenterAnalysis = async () => {
    try {
      const response = await api.get(`finance/cost-center-analysis/?period_days=30`);
      setCostCenterAnalysis(response.data.cost_center_analysis || []);
    } catch (error) {
      console.error('Failed to fetch cost center analysis:', error);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const response = await api.get(`finance/summary/?period_start=${dateRange.start}&period_end=${dateRange.end}`);
      setFinancialSummary(response.data.summary || {});
    } catch (error) {
      console.error('Failed to fetch financial summary:', error);
    }
  };

  // Toggle account expansion in hierarchical view
  const toggleAccountExpansion = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort chart of accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = chartOfAccounts;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(account => 
        account.account_code.toLowerCase().includes(term) ||
        account.account_name.toLowerCase().includes(term) ||
        account.account_type.toLowerCase().includes(term)
      );
    }
    
    // Apply account type filter
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(account => account.account_type === accountTypeFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [chartOfAccounts, searchTerm, accountTypeFilter, sortConfig]);

  // Build hierarchical structure for accounts
  const hierarchicalAccounts = useMemo(() => {
    const accountMap = {};
    const roots = [];
    
    // Create a map of all accounts
    filteredAndSortedAccounts.forEach(account => {
      accountMap[account.id] = { ...account, children: [] };
    });
    
    // Build the hierarchy
    filteredAndSortedAccounts.forEach(account => {
      if (account.parent_account) {
        if (accountMap[account.parent_account]) {
          accountMap[account.parent_account].children.push(accountMap[account.id]);
        }
      } else {
        roots.push(accountMap[account.id]);
      }
    });
    
    return roots;
  }, [filteredAndSortedAccounts]);

  // Render hierarchical accounts with indentation
  const renderHierarchicalAccounts = (accounts, level = 0) => {
    return accounts.map(account => (
      <React.Fragment key={account.id}>
        <div 
          className={`flex items-center py-3 px-4 border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors ${level > 0 ? 'pl-8' : ''}`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          {account.children.length > 0 && (
            <button
              onClick={() => toggleAccountExpansion(account.id)}
              className="mr-2 p-1 rounded hover:bg-gray-700/50"
            >
              {expandedAccounts.has(account.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div className="font-mono text-blue-400">{account.account_code}</div>
            <div className="col-span-2">{account.account_name}</div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs ${
                account.account_type === 'asset' ? 'bg-blue-500/10 text-blue-400' :
                account.account_type === 'liability' ? 'bg-purple-500/10 text-purple-400' :
                account.account_type === 'equity' ? 'bg-green-500/10 text-green-400' :
                account.account_type === 'revenue' ? 'bg-amber-500/10 text-amber-400' :
                account.account_type === 'expense' ? 'bg-red-500/10 text-red-400' :
                'bg-gray-500/10 text-gray-400'
              }`}>
                {account.account_type}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedAccount(account);
                setShowAccountDetail(true);
              }}
              className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        {expandedAccounts.has(account.id) && account.children.length > 0 && (
          <div className="border-l border-gray-700/30 ml-6">
            {renderHierarchicalAccounts(account.children, level + 1)}
          </div>
        )}
      </React.Fragment>
    ));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Render account type breakdown chart
  const renderAccountTypeBreakdown = () => {
    const typeCounts = {};
    chartOfAccounts.forEach(account => {
      typeCounts[account.account_type] = (typeCounts[account.account_type] || 0) + 1;
    });
    
    const total = chartOfAccounts.length;
    const colors = {
      asset: 'bg-blue-500',
      liability: 'bg-purple-500',
      equity: 'bg-green-500',
      revenue: 'bg-amber-500',
      expense: 'bg-red-500',
      cogs: 'bg-orange-500'
    };
    
    return (
      <div className="space-y-2">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-gray-600"></div>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 capitalize">{type}</span>
                <span className="text-white">{count} ({Math.round((count / total) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${colors[type] || 'bg-gray-500'}`} 
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const response = await api.post('api/chart-of-accounts/', newAccount);
      
      if (response.status === 201) {
        // Refresh the accounts list
        await fetchChartOfAccounts();
        setShowNewAccountModal(false);
        setNewAccount({
          account_code: '',
          account_name: '',
          account_type: 'asset',
          parent_account: null,
          description: ''
        });
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render trial balance visualization
  const renderTrialBalanceVisualization = () => {
    if (visualizationType === 'bar') {
      return (
        <div className="h-64 flex items-end space-x-1 pt-4">
          {trialBalance.slice(0, 10).map((account, index) => (
            <motion.div
              key={account.account_code}
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(Math.abs(account.net_balance) / 100, 100)}%` }}
              transition={{ delay: index * 0.05 }}
              className={`flex-1 ${
                account.net_balance >= 0 ? 'bg-blue-500' : 'bg-red-500'
              } rounded-t`}
              title={`${account.account_name}: ${formatCurrency(account.net_balance)}`}
            />
          ))}
        </div>
      );
    } else if (visualizationType === 'pie') {
      // Simplified pie chart visualization
      const topAccounts = trialBalance
        .filter(a => Math.abs(a.net_balance) > 0)
        .slice(0, 6);
      
      const total = topAccounts.reduce((sum, account) => sum + Math.abs(account.net_balance), 0);
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      
      return (
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(total)}
              </div>
              <div className="text-sm text-gray-400">Total Balance</div>
            </div>
          </div>
          
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {topAccounts.map((account, index) => {
              const percentage = (Math.abs(account.net_balance) / total) * 100;
              const offset = topAccounts.slice(0, index).reduce((sum, a) => 
                sum + (Math.abs(a.net_balance) / total) * 100, 0);
              
              return (
                <circle
                  key={account.account_code}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="10"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={-offset}
                />
              );
            })}
          </svg>
        </div>
      );
    }
    
    return null;
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
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
              >
                Financial Center
              </motion.h1>
              <p className="text-gray-400 mt-1">Reports, Analysis & Accounting</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAllData}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </motion.button>
              
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-6 -mb-px">
            {[
              { id: 'trial-balance', label: 'Trial Balance', icon: <Calculator className="w-4 h-4" /> },
              { id: 'profit-loss', label: 'P&L Statement', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'cost-centers', label: 'Cost Centers', icon: <Building className="w-4 h-4" /> },
              { id: 'financial-summary', label: 'Financial Summary', icon: <FileBarChart className="w-4 h-4" /> },
              { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: <FileText className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Date Range Filter */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                Report Period
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onChange={(e) => {
                    const preset = e.target.value;
                    const today = new Date();
                    let start, end;
                    
                    if (preset === 'this_month') {
                      start = new Date(today.getFullYear(), today.getMonth(), 1);
                      end = today;
                    } else if (preset === 'last_month') {
                      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      end = new Date(today.getFullYear(), today.getMonth(), 0);
                    } else if (preset === 'this_quarter') {
                      const quarter = Math.floor(today.getMonth() / 3);
                      start = new Date(today.getFullYear(), quarter * 3, 1);
                      end = today;
                    } else if (preset === 'this_year') {
                      start = new Date(today.getFullYear(), 0, 1);
                      end = today;
                    }
                    
                    if (start && end) {
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }
                  }}
                >
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_quarter">This Quarter</option>
                  <option value="this_year">This Year</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'trial-balance' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-cyan-400" />
                    Trial Balance
                    <span className="ml-2 text-sm text-gray-400">As of {new Date(dateRange.end).toLocaleDateString()}</span>
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1">
                      <button
                        onClick={() => setVisualizationType('bar')}
                        className={`p-1.5 rounded-lg ${visualizationType === 'bar' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'} transition-colors`}
                        title="Bar Chart"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setVisualizationType('pie')}
                        className={`p-1.5 rounded-lg ${visualizationType === 'pie' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'} transition-colors`}
                        title="Pie Chart"
                      >
                        <PieChartIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {/* Visualization */}
                <div className="mb-6 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  {renderTrialBalanceVisualization()}
                </div>
                
                {/* Trial Balance Table */}
                <div className="overflow-x-auto">
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
                      {trialBalance.map((account, index) => (
                        <motion.tr 
                          key={account.account_code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4 font-mono text-blue-400">{account.account_code}</td>
                          <td className="py-3 px-4">{account.account_name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              account.account_type === 'asset' ? 'bg-blue-500/10 text-blue-400' :
                              account.account_type === 'liability' ? 'bg-purple-500/10 text-purple-400' :
                              account.account_type === 'equity' ? 'bg-green-500/10 text-green-400' :
                              account.account_type === 'revenue' ? 'bg-amber-500/10 text-amber-400' :
                              account.account_type === 'expense' ? 'bg-red-500/10 text-red-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {account.account_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{formatCurrency(account.debit_total)}</td>
                          <td className="py-3 px-4 text-right font-mono">{formatCurrency(account.credit_total)}</td>
                          <td className={`py-3 px-4 text-right font-mono ${
                            account.net_balance >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(account.net_balance)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-700/50">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-right font-medium">Totals:</td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.debit_total, 0))}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.credit_total, 0))}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.net_balance, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profit-loss' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(profitLoss.revenue || 0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    Period: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Gross Profit Card */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Gross Profit</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(profitLoss.gross_profit || 0)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Margin: {profitLoss.gross_margin_pct ? profitLoss.gross_margin_pct.toFixed(2) : '0.00'}%
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart2 className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                {/* Net Profit Card */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Net Profit</p>
                      <p className={`text-2xl font-bold ${
                        (profitLoss.net_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(profitLoss.net_profit || 0)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Margin: {profitLoss.net_margin_pct ? profitLoss.net_margin_pct.toFixed(2) : '0.00'}%
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      (profitLoss.net_profit || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {(profitLoss.net_profit || 0) >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* P&L Details */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <FileBarChart className="w-5 h-5 mr-2 text-cyan-400" />
                  Profit & Loss Statement
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Income */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Income</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-white font-mono">{formatCurrency(profitLoss.revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-700/30">
                        <span className="text-gray-400 font-medium">Total Income</span>
                        <span className="text-white font-mono font-medium">{formatCurrency(profitLoss.revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cost of Goods Sold */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Cost of Goods Sold</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">COGS</span>
                        <span className="text-white font-mono">{formatCurrency(profitLoss.cost_of_goods_sold || 0)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-700/30">
                        <span className="text-gray-400 font-medium">Total COGS</span>
                        <span className="text-white font-mono font-medium">{formatCurrency(profitLoss.cost_of_goods_sold || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Gross Profit */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-white">Gross Profit</h4>
                    <span className="text-emerald-400 font-mono font-medium">{formatCurrency(profitLoss.gross_profit || 0)}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Gross Margin: {profitLoss.gross_margin_pct ? profitLoss.gross_margin_pct.toFixed(2) : '0.00'}%
                  </div>
                </div>
                
                {/* Expenses */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-6">
                  <h4 className="text-md font-semibold text-white mb-4">Operating Expenses</h4>
                  <div className="space-y-3">
                  // In the Profit & Loss section, around line 778:
                      {profitLoss.expense_breakdown && profitLoss.expense_breakdown.map((expense, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-400">{expense.account_name}</span>
                          <span className="text-white font-mono">{formatCurrency(expense.amount)}</span>
                        </div>
                      ))}
                    <div className="flex justify-between pt-3 border-t border-gray-700/30">
                      <span className="text-gray-400 font-medium">Total Expenses</span>
                      <span className="text-white font-mono font-medium">{formatCurrency(profitLoss.operating_expenses || 0)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Net Profit */}
                <div className={`rounded-xl p-4 border ${
                  (profitLoss.net_profit || 0) >= 0 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-white">Net Profit</h4>
                    <span className={`font-mono font-medium ${
                      (profitLoss.net_profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(profitLoss.net_profit || 0)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Net Margin: {profitLoss.net_margin_pct ? profitLoss.net_margin_pct.toFixed(2) : '0.00'}%
                  </div>
                </div>
              </div>
            </div>
          )}

            {activeTab === 'cost-centers' && (
              <div className="space-y-6">
                {Array.isArray(costCenterAnalysis) && costCenterAnalysis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {costCenterAnalysis.map((center, index) => {
                    // Add safe defaults for undefined values
                    const budgetVariancePct = center.budget_variance_pct || 0;
                    const utilizationPct = center.utilization_pct || 0;
                    const actualAmount = center.actual_amount || 0;
                    const budgetedAmount = center.budgeted_amount || 0;
                    const varianceAmount = center.budget_variance_amount || 0;
                    
                    return (
                      <motion.div 
                        key={center.cost_center_id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-md font-semibold text-white">
                            {center.cost_center_name || 'Unnamed Center'}
                          </h3>
                          <div className={`p-1.5 rounded-lg ${
                            budgetVariancePct >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {budgetVariancePct >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Actual Spend</span>
                            <span className="text-white font-mono">{formatCurrency(actualAmount)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-400">Budgeted</span>
                            <span className="text-white font-mono">{formatCurrency(budgetedAmount)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-400">Variance</span>
                            <span className={`font-mono ${
                              budgetVariancePct >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(varianceAmount)} (
                              {budgetVariancePct >= 0 ? '+' : ''}
                              {budgetVariancePct.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-700/30">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Utilization</span>
                            <span>{utilizationPct.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                utilizationPct > 90 ? 'bg-red-500' :
                                utilizationPct > 75 ? 'bg-amber-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                 ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No cost center data available</p>
                  </div>
                )}
              </div>
            )}

          {activeTab === 'financial-summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Assets */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(financialSummary.total_assets || 0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                {/* Total Liabilities */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Liabilities</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {formatCurrency(financialSummary.total_liabilities || 0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>
                
                {/* Equity */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Equity</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(financialSummary.equity || 0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Landmark className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>
                
                {/* Current Ratio */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Ratio</p>
                      <p className={`text-2xl font-bold ${
                        (financialSummary.current_ratio || 0) >= 1.5 ? 'text-green-400' :
                        (financialSummary.current_ratio || 0) >= 1 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {financialSummary.current_ratio ? financialSummary.current_ratio.toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      (financialSummary.current_ratio || 0) >= 1.5 ? 'bg-green-500/10' :
                      (financialSummary.current_ratio || 0) >= 1 ? 'bg-amber-500/10' : 'bg-red-500/10'
                    }`}>
                      <Target className="w-5 h-5 text-current" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Financial Health Indicators */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Financial Health Indicators
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Liquidity Ratios */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Liquidity Ratios</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Current Ratio</span>
                          <span>{financialSummary.current_ratio ? financialSummary.current_ratio.toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              (financialSummary.current_ratio || 0) >= 1.5 ? 'bg-green-500' :
                              (financialSummary.current_ratio || 0) >= 1 ? 'bg-amber-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min((financialSummary.current_ratio || 0) * 33, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Quick Ratio</span>
                          <span>{financialSummary.quick_ratio ? financialSummary.quick_ratio.toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              (financialSummary.quick_ratio || 0) >= 1 ? 'bg-green-500' :
                              (financialSummary.quick_ratio || 0) >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min((financialSummary.quick_ratio || 0) * 50, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profitability Ratios */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Profitability Ratios</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Return on Assets</span>
                          <span>{financialSummary.return_on_assets ? (financialSummary.return_on_assets * 100).toFixed(2) : '0.00'}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              (financialSummary.return_on_assets || 0) >= 0.05 ? 'bg-green-500' :
                              (financialSummary.return_on_assets || 0) >= 0 ? 'bg-amber-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min((financialSummary.return_on_assets || 0) * 1000, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Return on Equity</span>
                          <span>{financialSummary.return_on_equity ? (financialSummary.return_on_equity * 100).toFixed(2) : '0.00'}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              (financialSummary.return_on_equity || 0) >= 0.1 ? 'bg-green-500' :
                              (financialSummary.return_on_equity || 0) >= 0.05 ? 'bg-amber-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min((financialSummary.return_on_equity || 0) * 500, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart-of-accounts' && (
            <div className="space-y-6">
              {/* Filters and Actions */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    
                    <select
                      value={accountTypeFilter}
                      onChange={(e) => setAccountTypeFilter(e.target.value)}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">All Account Types</option>
                      <option value="asset">Assets</option>
                      <option value="liability">Liabilities</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expenses</option>
                      <option value="cogs">Cost of Goods Sold</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowNewAccountModal(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">New Account</span>
                    </button>
                    
                    <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {/* Account Type Breakdown */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Account Type Distribution</h4>
                    {renderAccountTypeBreakdown()}
                  </div>
                  
                  <div className="md:col-span-2 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h4 className="text-md font-semibold text-white mb-4">Account Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                        <div className="text-2xl font-bold text-white">{chartOfAccounts.length}</div>
                        <div className="text-xs text-gray-400">Total Accounts</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {chartOfAccounts.filter(a => a.account_type === 'asset').length}
                        </div>
                        <div className="text-xs text-gray-400">Asset Accounts</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">
                          {chartOfAccounts.filter(a => a.account_type === 'liability').length}
                        </div>
                        <div className="text-xs text-gray-400">Liability Accounts</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {chartOfAccounts.filter(a => a.account_type === 'equity').length}
                        </div>
                        <div className="text-xs text-gray-400">Equity Accounts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart of Accounts Table */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-cyan-400" />
                    Chart of Accounts
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {filteredAndSortedAccounts.length} of {chartOfAccounts.length} accounts
                    </span>
                  </div>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 py-3 px-4 border-b border-gray-700/50 text-sm text-gray-400 font-medium">
                  <button 
                    onClick={() => handleSort('account_code')}
                    className="flex items-center text-left hover:text-cyan-400 transition-colors"
                  >
                    Account Code
                    {sortConfig.key === 'account_code' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                  <div className="col-span-2">Account Name</div>
                  <button 
                    onClick={() => handleSort('account_type')}
                    className="flex items-center text-right hover:text-cyan-400 transition-colors"
                  >
                    Type
                    {sortConfig.key === 'account_type' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </div>
                
                {/* Hierarchical Accounts List */}
                <div className="max-h-96 overflow-y-auto">
                  {hierarchicalAccounts.length > 0 ? (
                    renderHierarchicalAccounts(hierarchicalAccounts)
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No accounts found matching your criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
  {showNewAccountModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={() => setShowNewAccountModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Create New Account</h3>
            <button
              onClick={() => setShowNewAccountModal(false)}
              className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Code *</label>
              <input
                type="text"
                value={newAccount.account_code}
                onChange={(e) => setNewAccount({...newAccount, account_code: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 1001"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Name *</label>
              <input
                type="text"
                value={newAccount.account_name}
                onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Cash Account"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Type *</label>
              <select
                value={newAccount.account_type}
                onChange={(e) => setNewAccount({...newAccount, account_type: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
                <option value="cogs">Cost of Goods Sold</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Parent Account</label>
              <select
                value={newAccount.parent_account || ''}
                onChange={(e) => setNewAccount({...newAccount, parent_account: e.target.value || null})}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">None (Top Level)</option>
                {chartOfAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.account_code} - {account.account_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={newAccount.description}
                onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Optional account description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-700/50">
            <button
              onClick={() => setShowNewAccountModal(false)}
              className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateAccount}
              disabled={!newAccount.account_code || !newAccount.account_name}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Account Detail Modal */}
      <AnimatePresence>
        {showAccountDetail && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowAccountDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Account Details</h3>
                  <button
                    onClick={() => setShowAccountDetail(false)}
                    className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Account Code</h4>
                    <p className="text-lg font-mono text-blue-400">{selectedAccount.account_code}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">Account Type</h4>
                    <p className="text-lg capitalize">{selectedAccount.account_type}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm text-gray-400 mb-1">Account Name</h4>
                    <p className="text-lg">{selectedAccount.account_name}</p>
                  </div>
                  
                  {selectedAccount.description && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm text-gray-400 mb-1">Description</h4>
                      <p className="text-gray-300">{selectedAccount.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => setShowAccountDetail(false)}
                    className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition-colors">
                    Edit Account
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

export default FinancialReports;