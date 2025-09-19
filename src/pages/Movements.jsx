import React, { useState, useEffect, useMemo } from 'react';
import {
  FiDatabase,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiFilter,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiTruck,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiCheck,
  FiBox
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    movementType: '',
    product: '',
    warehouse: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [transferData, setTransferData] = useState({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: '',
    reason: ''
  });
  const [movementData, setMovementData] = useState({
    movement_type: 'receipt',
    product: '',
    warehouse: '',
    quantity: '',
    unit_cost: '',
    reference_doc: '',
    movement_date: new Date()
  });

  // Fetch movements from API
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/stock-movements/');
      setMovements(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Failed to fetch movements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch products and warehouses for dropdowns
  const fetchDropdownData = async () => {
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        api.get('/api/products/'),
        api.get('/api/warehouses/')
      ]);
      
      setProducts(productsRes.data.results || productsRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load dropdown data');
    }
  };

  useEffect(() => {
    fetchMovements();
    fetchDropdownData();
  }, []);

  // Handle stock transfer
  const handleStockTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/stock-movements/stock_transfer/', transferData);
      toast.success('Stock transferred successfully');
      setShowTransferModal(false);
      setTransferData({
        product_id: '',
        from_warehouse_id: '',
        to_warehouse_id: '',
        quantity: '',
        reason: ''
      });
      fetchMovements(); // Refresh data
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast.error(error.response?.data?.error || 'Failed to transfer stock');
    }
  };

  // Handle create/update movement
  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovement) {
        await api.put(`/api/stock-movements/${editingMovement.id}/`, movementData);
        toast.success('Movement updated successfully');
      } else {
        await api.post('/api/stock-movements/', movementData);
        toast.success('Movement created successfully');
      }
      
      setShowMovementModal(false);
      setEditingMovement(null);
      setMovementData({
        movement_type: 'receipt',
        product: '',
        warehouse: '',
        quantity: '',
        unit_cost: '',
        reference_doc: '',
        movement_date: new Date()
      });
      fetchMovements(); // Refresh data
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error(error.response?.data?.error || 'Failed to save movement');
    }
  };

  // Handle delete movement
  const handleDeleteMovement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movement?')) return;
    
    try {
      await api.delete(`/api/stock-movements/${id}/`);
      toast.success('Movement deleted successfully');
      fetchMovements(); // Refresh data
    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error(error.response?.data?.error || 'Failed to delete movement');
    }
  };

  // Apply filters to movements
  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      if (filters.movementType && movement.movement_type !== filters.movementType) return false;
      if (filters.product && movement.product !== filters.product) return false;
      if (filters.warehouse && movement.warehouse !== filters.warehouse) return false;
      if (filters.dateFrom && new Date(movement.movement_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(movement.movement_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [movements, filters]);

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: 'Movement #',
        accessorKey: 'movement_number',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm font-medium text-blue-400">{getValue()}</span>
        )
      },
      {
        header: 'Type',
        accessorKey: 'movement_type',
        cell: ({ getValue }) => {
          const typeConfig = {
            receipt: { color: 'green', icon: <FiArrowDown className="text-green-400" />, label: 'Receipt' },
            issue: { color: 'red', icon: <FiArrowUp className="text-red-400" />, label: 'Issue' },
            transfer_in: { color: 'blue', icon: <FiRefreshCw className="text-blue-400" />, label: 'Transfer In' },
            transfer_out: { color: 'orange', icon: <FiRefreshCw className="text-orange-400" />, label: 'Transfer Out' },
            adjustment: { color: 'purple', icon: <FiFileText className="text-purple-400" />, label: 'Adjustment' },
            production_receipt: { color: 'teal', icon: <FiTruck className="text-teal-400" />, label: 'Production' }
          };
          
          const value = getValue();
          const config = typeConfig[value] || { color: 'gray', icon: null, label: value };
          
          return (
            <div className="flex items-center">
              {config.icon}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-900/30 text-${config.color}-400`}>
                {config.label}
              </span>
            </div>
          );
        }
      },
      {
        header: 'Product',
        accessorKey: 'product_name',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-white">{row.original.product_name}</div>
            <div className="text-xs text-gray-400">{row.original.product_sku}</div>
          </div>
        )
      },
      {
        header: 'Warehouse',
        accessorKey: 'warehouse_name',
        cell: ({ getValue }) => (
          <span className="text-gray-300">{getValue()}</span>
        )
      },
      {
        header: 'Quantity',
        accessorKey: 'quantity',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className={value < 0 ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
              {value > 0 ? `+${value}` : value}
            </span>
          );
        }
      },
      {
        header: 'Unit Cost',
        accessorKey: 'unit_cost',
        cell: ({ getValue }) => (
          <span className="text-gray-300">${parseFloat(getValue()).toFixed(2)}</span>
        )
      },
      {
        header: 'Value',
        accessorKey: 'movement_value',
        cell: ({ getValue }) => (
          <span className="text-emerald-400 font-medium">${parseFloat(getValue()).toFixed(2)}</span>
        )
      },
      {
        header: 'Date',
        accessorKey: 'movement_date',
        cell: ({ getValue }) => (
          <span className="text-gray-400">{new Date(getValue()).toLocaleDateString()}</span>
        )
      },
      {
        header: 'Reference',
        accessorKey: 'reference_doc',
        cell: ({ getValue }) => (
          <span className="text-gray-400">{getValue() || '-'}</span>
        )
      },
      {
        header: 'Actions',
        accessorKey: 'id',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditingMovement(row.original);
                setMovementData({
                  movement_type: row.original.movement_type,
                  product: row.original.product,
                  warehouse: row.original.warehouse,
                  quantity: row.original.quantity,
                  unit_cost: row.original.unit_cost,
                  reference_doc: row.original.reference_doc,
                  movement_date: new Date(row.original.movement_date)
                });
                setShowMovementModal(true);
              }}
              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteMovement(row.original.id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    ],
    []
  );

  // React Table setup
  const table = useReactTable({
    data: filteredMovements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const receipts = movements.filter(m => m.movement_type === 'receipt').length;
    const issues = movements.filter(m => m.movement_type === 'issue').length;
    const transfers = movements.filter(m => m.movement_type.includes('transfer')).length;
    const adjustments = movements.filter(m => m.movement_type === 'adjustment').length;
    
    const totalValue = movements.reduce((sum, m) => {
      const value = Math.abs(m.quantity) * m.unit_cost;
      return sum + value;
    }, 0);
    
    return { receipts, issues, transfers, adjustments, totalValue };
  }, [movements]);

  return (
    <div className="min-h-screen bg-gray-900 text-white ">
      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Movements</h1>
          <p className="text-gray-400">Track all stock movements and transfers</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransferModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Transfer Stock
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMovementModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            New Movement
          </motion.button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 p-4 rounded-lg shadow mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Movement Type</label>
                <select
                  className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.movementType}
                  onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="receipt">Receipt</option>
                  <option value="issue">Issue</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="production_receipt">Production Receipt</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product</label>
                <select
                  className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.product}
                  onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.product_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Warehouse</label>
                <select
                  className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.warehouse}
                  onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.warehouse_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setFilters({
                      movementType: '',
                      product: '',
                      warehouse: '',
                      dateFrom: '',
                      dateTo: ''
                    });
                    toast.info('Filters cleared');
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-900/30">
              <FiArrowDown className="text-green-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Receipts</p>
              <p className="text-2xl font-bold text-white">{stats.receipts}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-900/30">
              <FiArrowUp className="text-red-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Issues</p>
              <p className="text-2xl font-bold text-white">{stats.issues}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-900/30">
              <FiRefreshCw className="text-blue-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Transfers</p>
              <p className="text-2xl font-bold text-white">{stats.transfers}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-900/30">
              <FiFileText className="text-purple-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Adjustments</p>
              <p className="text-2xl font-bold text-white">{stats.adjustments}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-emerald-900/30">
              <FiBox className="text-emerald-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-emerald-400">${stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search movements..."
              className="pl-10 pr-4 py-2 border border-gray-700 rounded-md w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchMovements}
              className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              disabled={refreshing}
            >
              <FiRefreshCw className={`w-4 h-4 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <span className="text-sm text-gray-400">Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-700 rounded-md px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-400">entries</span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-400">Loading movements...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <FiChevronUp className="ml-1" />,
                              desc: <FiChevronDown className="ml-1" />,
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {table.getRowModel().rows.map(row => (
                    <motion.tr 
                      key={row.id} 
                      className="hover:bg-gray-750 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-750 border-t border-gray-700 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredMovements.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredMovements.length}</span> results
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className={`px-3 py-1 rounded-md ${!table.getCanPreviousPage() ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`px-3 py-1 rounded-md ${!table.getCanPreviousPage() ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className={`px-3 py-1 rounded-md ${!table.getCanNextPage() ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className={`px-3 py-1 rounded-md ${!table.getCanNextPage() ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transfer Stock Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Transfer Stock</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleStockTransfer} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Product</label>
                    <select
                      required
                      value={transferData.product_id}
                      onChange={(e) => setTransferData({ ...transferData, product_id: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.product_name} ({product.sku})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">From Warehouse</label>
                    <select
                      required
                      value={transferData.from_warehouse_id}
                      onChange={(e) => setTransferData({ ...transferData, from_warehouse_id: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Source Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.warehouse_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">To Warehouse</label>
                    <select
                      required
                      value={transferData.to_warehouse_id}
                      onChange={(e) => setTransferData({ ...transferData, to_warehouse_id: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Destination Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.warehouse_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0.001"
                      step="0.001"
                      value={transferData.quantity}
                      onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Reason (Optional)</label>
                    <input
                      type="text"
                      value={transferData.reason}
                      onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Reason for transfer"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Transfer Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Movement Modal */}
      <AnimatePresence>
        {showMovementModal && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">
                  {editingMovement ? 'Edit Movement' : 'Create New Movement'}
                </h3>
                <button
                  onClick={() => {
                    setShowMovementModal(false);
                    setEditingMovement(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleMovementSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Movement Type</label>
                    <select
                      required
                      value={movementData.movement_type}
                      onChange={(e) => setMovementData({ ...movementData, movement_type: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="receipt">Receipt</option>
                      <option value="issue">Issue</option>
                      <option value="transfer_in">Transfer In</option>
                      <option value="transfer_out">Transfer Out</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="production_receipt">Production Receipt</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Product</label>
                    <select
                      required
                      value={movementData.product}
                      onChange={(e) => setMovementData({ ...movementData, product: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.product_name} ({product.sku})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Warehouse</label>
                    <select
                      required
                      value={movementData.warehouse}
                      onChange={(e) => setMovementData({ ...movementData, warehouse: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.warehouse_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      step="0.001"
                      value={movementData.quantity}
                      onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={movementData.unit_cost}
                      onChange={(e) => setMovementData({ ...movementData, unit_cost: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter unit cost"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Reference Document</label>
                    <input
                      type="text"
                      value={movementData.reference_doc}
                      onChange={(e) => setMovementData({ ...movementData, reference_doc: e.target.value })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Reference document number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Movement Date</label>
                    <DatePicker
                      selected={movementData.movement_date}
                      onChange={(date) => setMovementData({ ...movementData, movement_date: date })}
                      className="w-full border border-gray-700 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMovementModal(false);
                      setEditingMovement(null);
                    }}
                    className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    {editingMovement ? 'Update Movement' : 'Create Movement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Movements;