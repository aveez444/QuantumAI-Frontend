import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  ChevronDown, ChevronRight, Download, Upload, MoreHorizontal,
  CheckCircle, XCircle, AlertTriangle, Info, BarChart3, RefreshCw,
  ArrowUpDown, Calendar, Hash, DollarSign, Tag, Grid, List,
  MapPin, User, Building, Box, Palette, XCircle as XIcon,
  Phone, Mail, Globe, CreditCard, FileText, Users
} from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedParty, setSelectedParty] = useState(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    party_code: '',
    party_type: 'customer',
    legal_name: '',
    display_name: '',
    gstin: '',
    pan: '',
    contact_details: '{}',
    payment_terms: '',
    credit_limit: ''
  });

  // Contact details editor state
  const [contactDetails, setContactDetails] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    contact_person: ''
  });

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    // Initialize contact details from form data when editing
    if (editingParty && editingParty.contact_details) {
      try {
        const parsedContacts = JSON.parse(editingParty.contact_details);
        setContactDetails(prev => ({ ...prev, ...parsedContacts }));
      } catch (e) {
        console.error('Error parsing contact details:', e);
      }
    }
  }, [editingParty]);

  const fetchParties = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('api/parties/');
      setParties(res.data);
      setError(null);
    } catch (err) {
      console.error('Parties fetch error:', err);
      setError('Failed to load parties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      // Prepare the data with stringified contact details
      const submitData = {
        ...formData,
        contact_details: JSON.stringify(contactDetails)
      };

      if (editingParty) {
        await api.put(`api/parties/${editingParty.id}/`, submitData);
      } else {
        await api.post('api/parties/', submitData);
      }
      
      setShowPartyModal(false);
      setEditingParty(null);
      setFormData({
        party_code: '',
        party_type: 'customer',
        legal_name: '',
        display_name: '',
        gstin: '',
        pan: '',
        contact_details: '{}',
        payment_terms: '',
        credit_limit: ''
      });
      setContactDetails({
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        contact_person: ''
      });
      
      fetchParties();
    } catch (err) {
      console.error('Party save error:', err);
      setError('Failed to save party');
    }
  };

  const handleEditParty = (party) => {
    setEditingParty(party);
    setFormData({
      party_code: party.party_code,
      party_type: party.party_type,
      legal_name: party.legal_name,
      display_name: party.display_name,
      gstin: party.gstin || '',
      pan: party.pan || '',
      contact_details: party.contact_details || '{}',
      payment_terms: party.payment_terms || '',
      credit_limit: party.credit_limit || ''
    });
    
    // Parse contact details
    try {
      if (party.contact_details) {
        const parsedContacts = JSON.parse(party.contact_details);
        setContactDetails(prev => ({ ...prev, ...parsedContacts }));
      }
    } catch (e) {
      console.error('Error parsing contact details:', e);
    }
    
    setShowPartyModal(true);
  };

  const handleDeleteParty = async () => {
    try {
      await api.delete(`api/parties/${editingParty.id}/`);
      setShowDeleteConfirm(false);
      setEditingParty(null);
      fetchParties();
    } catch (err) {
      console.error('Party delete error:', err);
      setError('Failed to delete party');
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

  const getPartyTypeLabel = (type) => {
    return type === 'customer' ? 'Customer' : 'Supplier';
  };

  const getPartyTypeColor = (type) => {
    return type === 'customer' ? 'text-blue-400' : 'text-green-400';
  };

  const getPartyTypeBg = (type) => {
    return type === 'customer' ? 'bg-blue-500/10' : 'bg-green-500/10';
  };

  // Filter and sort parties
  const filteredParties = parties
    .filter(party => {
      const matchesSearch = party.party_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.gstin && party.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.pan && party.pan.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || party.party_type === typeFilter;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'code') {
        aValue = a.party_code;
        bValue = b.party_code;
      } else if (sortBy === 'name') {
        aValue = a.display_name || a.legal_name;
        bValue = b.display_name || b.legal_name;
      } else if (sortBy === 'type') {
        aValue = a.party_type;
        bValue = b.party_type;
      } else if (sortBy === 'gstin') {
        aValue = a.gstin || '';
        bValue = b.gstin || '';
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
                Parties & Suppliers
              </motion.h1>
              <p className="text-gray-400 mt-1">Customers, Vendors & Business Partners</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchParties}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPartyModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New Party</span>
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
                  placeholder="Search parties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="customer">Customers</option>
                  <option value="supplier">Suppliers</option>
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
                { key: 'code', label: 'Code', icon: Hash },
                { key: 'name', label: 'Name', icon: Users },
                { key: 'type', label: 'Type', icon: Tag },
                { key: 'gstin', label: 'GSTIN', icon: FileText }
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

          {/* Parties Grid/List */}
          {filteredParties.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No parties found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or create your first party</p>
              <button
                onClick={() => setShowPartyModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-xl transition-all"
              >
                Add Your First Party
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredParties.map(party => {
                let parsedContacts = {};
                try {
                  parsedContacts = party.contact_details ? JSON.parse(party.contact_details) : {};
                } catch (e) {
                  console.error('Error parsing contact details:', e);
                }
                
                return (
                  <motion.div
                    key={party.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-5 group hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${getPartyTypeBg(party.party_type)}`}>
                        <Users className={`w-5 h-5 ${getPartyTypeColor(party.party_type)}`} />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedParty(party)}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Eye className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => handleEditParty(party)}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingParty(party);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-1 truncate">{party.display_name || party.legal_name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{party.party_code}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPartyTypeBg(party.party_type)} ${getPartyTypeColor(party.party_type)}`}>
                        {getPartyTypeLabel(party.party_type)}
                      </div>
                      
                      {party.gstin && (
                        <div className="flex items-center text-sm text-gray-400">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="truncate">GST: {party.gstin}</span>
                        </div>
                      )}
                      
                      {parsedContacts.phone && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="truncate">{parsedContacts.phone}</span>
                        </div>
                      )}
                      
                      {parsedContacts.email && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{parsedContacts.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setSelectedParty(party)}
                      className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Code</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">GSTIN</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Payment Terms</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties.map(party => {
                    return (
                      <motion.tr 
                        key={party.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-700/30 last:border-0 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4 text-white font-mono">{party.party_code}</td>
                        <td className="py-3 px-4 text-white">{party.display_name || party.legal_name}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getPartyTypeBg(party.party_type)} ${getPartyTypeColor(party.party_type)}`}>
                            {getPartyTypeLabel(party.party_type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{party.gstin || '-'}</td>
                        <td className="py-3 px-4 text-gray-400">{party.payment_terms || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedParty(party)}
                              className="p-1 hover:bg-gray-700/50 rounded text-green-400"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditParty(party)}
                              className="p-1 hover:bg-gray-700/50 rounded text-blue-400"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingParty(party);
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
          {filteredParties.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Parties</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(filteredParties.length)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Customers</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {formatNumber(filteredParties.filter(p => p.party_type === 'customer').length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Suppliers</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatNumber(filteredParties.filter(p => p.party_type === 'supplier').length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Package className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">With GSTIN</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {formatNumber(filteredParties.filter(p => p.gstin).length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Party Detail Modal */}
      <AnimatePresence>
        {selectedParty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedParty(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">
                  {selectedParty.display_name || selectedParty.legal_name} - Details
                </h3>
                <button
                  onClick={() => setSelectedParty(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Hash className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Code</span>
                    </div>
                    <p className="text-white font-medium">{selectedParty.party_code}</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Tag className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Type</span>
                    </div>
                    <p className={`font-medium ${getPartyTypeColor(selectedParty.party_type)}`}>
                      {getPartyTypeLabel(selectedParty.party_type)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Legal Name</span>
                    </div>
                    <p className="text-white font-medium">{selectedParty.legal_name}</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">Display Name</span>
                    </div>
                    <p className="text-white font-medium">{selectedParty.display_name || '-'}</p>
                  </div>
                  
                  {selectedParty.gstin && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-400">GSTIN</span>
                      </div>
                      <p className="text-white font-medium">{selectedParty.gstin}</p>
                    </div>
                  )}
                  
                  {selectedParty.pan && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-400">PAN</span>
                      </div>
                      <p className="text-white font-medium">{selectedParty.pan}</p>
                    </div>
                  )}
                  
                  {selectedParty.payment_terms && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <CreditCard className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-400">Payment Terms</span>
                      </div>
                      <p className="text-white font-medium">{selectedParty.payment_terms}</p>
                    </div>
                  )}
                  
                  {selectedParty.credit_limit && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-400">Credit Limit</span>
                      </div>
                      <p className="text-white font-medium">{formatCurrency(selectedParty.credit_limit)}</p>
                    </div>
                  )}
                </div>
                
                {/* Contact Details */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-700/50">
                    <h4 className="font-semibold text-white flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-400" />
                      Contact Details
                    </h4>
                  </div>
                  
                  <div className="p-4">
                    {selectedParty.contact_details ? (
                      (() => {
                        try {
                          const contacts = JSON.parse(selectedParty.contact_details);
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {contacts.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-300">{contacts.phone}</span>
                                </div>
                              )}
                              
                              {contacts.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-300">{contacts.email}</span>
                                </div>
                              )}
                              
                              {contacts.address && (
                                <div className="flex items-center text-sm md:col-span-2">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-300">{contacts.address}</span>
                                </div>
                              )}
                              
                              {(contacts.city || contacts.state || contacts.country) && (
                                <div className="flex items-center text-sm md:col-span-2">
                                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-300">
                                    {[contacts.city, contacts.state, contacts.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              {contacts.contact_person && (
                                <div className="flex items-center text-sm md:col-span-2">
                                  <User className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-gray-300">Contact: {contacts.contact_person}</span>
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return <p className="text-gray-400">Invalid contact details format</p>;
                        }
                      })()
                    ) : (
                      <p className="text-gray-400">No contact details available</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Party Modal */}
      <AnimatePresence>
        {showPartyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPartyModal(false)}
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
                  {editingParty ? 'Edit Party' : 'Add New Party'}
                </h3>
              </div>
              
              <form onSubmit={handleCreateParty} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Party Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.party_code}
                      onChange={e => setFormData({...formData, party_code: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Party Type *</label>
                    <select
                      required
                      value={formData.party_type}
                      onChange={e => setFormData({...formData, party_type: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.legal_name}
                      onChange={e => setFormData({...formData, legal_name: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={e => setFormData({...formData, display_name: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Optional display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">GSTIN</label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={e => setFormData({...formData, gstin: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="GSTIN number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">PAN</label>
                      <input
                        type="text"
                        value={formData.pan}
                        onChange={e => setFormData({...formData, pan: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="PAN number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={formData.payment_terms}
                        onChange={e => setFormData({...formData, payment_terms: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Net 30, COD, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Credit Limit ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.credit_limit}
                        onChange={e => setFormData({...formData, credit_limit: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  {/* Contact Details Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-400" />
                      Contact Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={contactDetails.phone}
                          onChange={e => setContactDetails({...contactDetails, phone: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={contactDetails.email}
                          onChange={e => setContactDetails({...contactDetails, email: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Address</label>
                        <input
                          type="text"
                          value={contactDetails.address}
                          onChange={e => setContactDetails({...contactDetails, address: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          value={contactDetails.city}
                          onChange={e => setContactDetails({...contactDetails, city: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">State</label>
                        <input
                          type="text"
                          value={contactDetails.state}
                          onChange={e => setContactDetails({...contactDetails, state: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Country</label>
                        <input
                          type="text"
                          value={contactDetails.country}
                          onChange={e => setContactDetails({...contactDetails, country: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={contactDetails.zip_code}
                          onChange={e => setContactDetails({...contactDetails, zip_code: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={contactDetails.contact_person}
                          onChange={e => setContactDetails({...contactDetails, contact_person: e.target.value})}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPartyModal(false);
                        setEditingParty(null);
                        setFormData({
                          party_code: '',
                          party_type: 'customer',
                          legal_name: '',
                          display_name: '',
                          gstin: '',
                          pan: '',
                          contact_details: '{}',
                          payment_terms: '',
                          credit_limit: ''
                        });
                        setContactDetails({
                          phone: '',
                          email: '',
                          address: '',
                          city: '',
                          state: '',
                          country: '',
                          zip_code: '',
                          contact_person: ''
                        });
                      }}
                      className="px-4 py-2 text-gray-300 hover:text-white rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-2 rounded-xl transition-all"
                    >
                      {editingParty ? 'Update Party' : 'Create Party'}
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
                className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Delete Party</h3>
                  <p className="text-gray-400">
                    Are you sure you want to delete <span className="text-white font-medium">{editingParty?.display_name || editingParty?.legal_name}</span>? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteParty}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default Parties;