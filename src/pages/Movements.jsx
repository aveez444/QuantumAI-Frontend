import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FiBox,
  FiLayers,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiPackage,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiPieChart,
  FiGrid,
  FiList,
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiShare2,
  FiUsers,
  FiShoppingCart,
  FiSettings,
  FiArchive,
  FiActivity
} from 'react-icons/fi';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform
} from 'framer-motion';
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
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Custom components
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

const StockLevelIndicator = ({ current, min, max }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  let color = 'green';
  
  if (percentage < 30) color = 'red';
  else if (percentage < 60) color = 'yellow';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Stock Level</span>
        <span className={`font-bold ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
          {current}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
            color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
            'bg-gradient-to-r from-green-500 to-emerald-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [stockOverview, setStockOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    movementType: '',
    product: '',
    warehouse: '',
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'timeline'
  const [timeRange, setTimeRange] = useState('7days'); // 'today', '7days', '30days', 'custom'
  const [sortConfig, setSortConfig] = useState({ key: 'movement_date', direction: 'desc' });

  const [transferData, setTransferData] = useState({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: '',
    reason: '',
    priority: 'normal' // 'low', 'normal', 'high', 'urgent'
  });

  const [movementData, setMovementData] = useState({
    movement_type: 'receipt',
    product: '',
    warehouse: '',
    quantity: '',
    unit_cost: '',
    reference_doc: '',
    movement_date: new Date(),
    notes: '',
    batch_number: '',
    expiry_date: null,
    tags: []
  });

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        movementsRes,
        productsRes,
        warehousesRes,
        stockRes,
        overviewRes
      ] = await Promise.all([
        api.get('/api/stock-movements/'),
        api.get('/api/products/'),
        api.get('/api/warehouses/'),
        api.get('/api/stock-movements/current_stock/'),
        api.get('/api/products/stock_overview/')
      ]);

      setMovements(movementsRes.data.results || movementsRes.data);
      setProducts(productsRes.data.results || productsRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
      setCurrentStock(stockRes.data);
      setStockOverview(overviewRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Enhanced stock transfer with validation
  const handleStockTransfer = async (e) => {
    e.preventDefault();
    try {
      // Validate from and to warehouses are different
      if (transferData.from_warehouse_id === transferData.to_warehouse_id) {
        toast.error('Source and destination warehouses must be different');
        return;
      }

      const response = await api.post('/api/stock-movements/stock_transfer/', transferData);
      toast.success('Stock transfer initiated successfully');
      
      // Show transfer confirmation with details
      toast.info(
        <div>
          <p className="font-semibold">Transfer #{response.data.transfer_number}</p>
          <p className="text-sm">Status: Processing</p>
        </div>
      );

      setShowTransferModal(false);
      setTransferData({
        product_id: '',
        from_warehouse_id: '',
        to_warehouse_id: '',
        quantity: '',
        reason: '',
        priority: 'normal'
      });
      
      fetchAllData(); // Refresh all data
    } catch (error) {
      console.error('Error transferring stock:', error);
      const errorMsg = error.response?.data?.error || 'Failed to transfer stock';
      toast.error(errorMsg);
    }
  };

  // Enhanced movement handler
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
      resetMovementData();
      fetchAllData();
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error(error.response?.data?.error || 'Failed to save movement');
    }
  };

  const resetMovementData = () => {
    setMovementData({
      movement_type: 'receipt',
      product: '',
      warehouse: '',
      quantity: '',
      unit_cost: '',
      reference_doc: '',
      movement_date: new Date(),
      notes: '',
      batch_number: '',
      expiry_date: null,
      tags: []
    });
  };

  // Bulk actions
  const handleBulkDelete = async (selectedIds) => {
    if (!window.confirm(`Delete ${selectedIds.length} selected movements? This action cannot be undone.`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/stock-movements/${id}/`)));
      toast.success(`${selectedIds.length} movements deleted successfully`);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting movements:', error);
      toast.error('Failed to delete movements');
    }
  };

  // Export functions
  const exportToCSV = () => {
    // Implement CSV export logic
    toast.success('Exporting to CSV...');
  };

  const exportToPDF = async () => {
    try {
      const response = await api.get('/api/products/stock-report-pdf/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('PDF report downloaded');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  // Analytics data
  const movementAnalytics = useMemo(() => {
    const last30Days = movements.filter(m => {
      const movementDate = new Date(m.movement_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return movementDate >= thirtyDaysAgo;
    });

    const dailyData = {};
    last30Days.forEach(movement => {
      const date = new Date(movement.movement_date).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { receipts: 0, issues: 0, transfers: 0, value: 0 };
      }
      
      const value = Math.abs(movement.quantity) * movement.unit_cost;
      dailyData[date].value += value;
      
      if (movement.movement_type === 'receipt') dailyData[date].receipts += Math.abs(movement.quantity);
      else if (movement.movement_type === 'issue') dailyData[date].issues += Math.abs(movement.quantity);
      else if (movement.movement_type.includes('transfer')) dailyData[date].transfers += Math.abs(movement.quantity);
    });

    const chartData = Object.keys(dailyData).map(date => ({
      date,
      ...dailyData[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Top products by movement
    const productMovements = {};
    movements.forEach(m => {
      const productKey = `${m.product_name} (${m.product_sku})`;
      if (!productMovements[productKey]) productMovements[productKey] = 0;
      productMovements[productKey] += Math.abs(m.quantity);
    });

    const topProducts = Object.entries(productMovements)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      chartData,
      topProducts,
      totalMovements: movements.length,
      averageDailyValue: chartData.length > 0 
        ? chartData.reduce((sum, day) => sum + day.value, 0) / chartData.length 
        : 0
    };
  }, [movements]);

  // Enhanced table columns
  const columns = useMemo(
    () => [
      {
        id: 'selection',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-600"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-600"
          />
        ),
      },
      {
        header: 'Movement #',
        accessorKey: 'movement_number',
        cell: ({ getValue }) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <span className="font-mono font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
              {getValue()}
            </span>
          </motion.div>
        )
      },
      {
        header: 'Type',
        accessorKey: 'movement_type',
        cell: ({ getValue, row }) => {
          const typeConfig = {
            receipt: { 
              color: 'emerald', 
              gradient: 'from-emerald-500 to-green-500',
              icon: <FiArrowDown />, 
              label: 'Receipt',
              bg: 'bg-emerald-900/20'
            },
            issue: { 
              color: 'rose', 
              gradient: 'from-rose-500 to-pink-500',
              icon: <FiArrowUp />, 
              label: 'Issue',
              bg: 'bg-rose-900/20'
            },
            transfer_in: { 
              color: 'blue', 
              gradient: 'from-blue-500 to-cyan-500',
              icon: <FiRefreshCw />, 
              label: 'Transfer In',
              bg: 'bg-blue-900/20'
            },
            transfer_out: { 
              color: 'orange', 
              gradient: 'from-orange-500 to-amber-500',
              icon: <FiRefreshCw />, 
              label: 'Transfer Out',
              bg: 'bg-orange-900/20'
            },
            adjustment: { 
              color: 'purple', 
              gradient: 'from-purple-500 to-violet-500',
              icon: <FiFileText />, 
              label: 'Adjustment',
              bg: 'bg-purple-900/20'
            },
            production_receipt: { 
              color: 'teal', 
              gradient: 'from-teal-500 to-emerald-500',
              icon: <FiTruck />, 
              label: 'Production',
              bg: 'bg-teal-900/20'
            }
          };
          
          const value = getValue();
          const config = typeConfig[value] || { 
            color: 'gray', 
            gradient: 'from-gray-500 to-gray-400',
            icon: null, 
            label: value,
            bg: 'bg-gray-900/20'
          };
          
          return (
            <motion.div 
              className={`flex items-center ${config.bg} px-3 py-1.5 rounded-lg border border-${config.color}-700/30`}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`p-1.5 rounded-full bg-gradient-to-br ${config.gradient}`}>
                {React.cloneElement(config.icon, { className: `w-3.5 h-3.5 text-white` })}
              </div>
              <span className={`ml-2.5 text-sm font-medium text-${config.color}-300`}>
                {config.label}
              </span>
            </motion.div>
          );
        }
      },
      {
        header: 'Product',
        accessorKey: 'product_name',
        cell: ({ row }) => (
          <motion.div 
            className="cursor-pointer"
            whileHover={{ x: 5 }}
            onClick={() => setSelectedProduct(row.original)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                <FiPackage className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white hover:text-blue-300 transition-colors">
                  {row.original.product_name}
                </div>
                <div className="text-xs text-gray-400">{row.original.product_sku}</div>
              </div>
            </div>
          </motion.div>
        )
      },
      {
        header: 'Warehouse',
        accessorKey: 'warehouse_name',
        cell: ({ getValue }) => (
          <div className="flex items-center">
            <FiMapPin className="w-3.5 h-3.5 text-gray-500 mr-2" />
            <span className="text-gray-300">{getValue()}</span>
          </div>
        )
      },
      {
        header: 'Quantity',
        accessorKey: 'quantity',
        cell: ({ getValue }) => {
          const value = getValue();
          const isNegative = value < 0;
          
          return (
            <motion.div 
              className={`flex items-center justify-center px-3 py-1.5 rounded-lg ${
                isNegative 
                  ? 'bg-gradient-to-r from-rose-900/30 to-pink-900/20 border border-rose-700/30' 
                  : 'bg-gradient-to-r from-emerald-900/30 to-green-900/20 border border-emerald-700/30'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <div className={`flex items-center ${isNegative ? 'text-rose-300' : 'text-emerald-300'}`}>
                {isNegative ? (
                  <FiTrendingDown className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <FiTrendingUp className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span className="font-bold">
                  {value > 0 ? `+${value}` : value}
                </span>
              </div>
            </motion.div>
          );
        }
      },
      {
        header: 'Value',
        accessorKey: 'movement_value',
        cell: ({ getValue }) => (
          <div className="flex items-center">
            <FiDollarSign className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            <span className="font-bold text-emerald-300 bg-emerald-900/20 px-2 py-1 rounded">
              ${parseFloat(getValue()).toFixed(2)}
            </span>
          </div>
        )
      },
      {
        header: 'Date & Time',
        accessorKey: 'movement_date',
        cell: ({ getValue }) => (
          <div className="space-y-0.5">
            <div className="flex items-center text-gray-300">
              <FiCalendar className="w-3 h-3 mr-1.5" />
              {new Date(getValue()).toLocaleDateString()}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <FiClock className="w-2.5 h-2.5 mr-1" />
              {new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() || 'completed';
          const statusConfig = {
            pending: { color: 'yellow', label: 'Pending', icon: <FiClock /> },
            completed: { color: 'green', label: 'Completed', icon: <FiCheck /> },
            cancelled: { color: 'red', label: 'Cancelled', icon: <FiX /> },
            processing: { color: 'blue', label: 'Processing', icon: <FiRefreshCw className="animate-spin" /> }
          };
          
          const config = statusConfig[status] || statusConfig.completed;
          
          return (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-900/30 text-${config.color}-300 border border-${config.color}-700/30`}>
              {config.icon && React.cloneElement(config.icon, { className: `w-3 h-3 mr-1.5` })}
              {config.label}
            </div>
          );
        }
      },
      {
        header: 'Actions',
        accessorKey: 'id',
        cell: ({ row }) => (
          <div className="flex space-x-1.5">
            <motion.button
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setEditingMovement(row.original);
                setMovementData({
                  movement_type: row.original.movement_type,
                  product: row.original.product,
                  warehouse: row.original.warehouse,
                  quantity: row.original.quantity,
                  unit_cost: row.original.unit_cost,
                  reference_doc: row.original.reference_doc,
                  movement_date: new Date(row.original.movement_date),
                  notes: row.original.notes || '',
                  batch_number: row.original.batch_number || '',
                  expiry_date: row.original.expiry_date ? new Date(row.original.expiry_date) : null,
                  tags: row.original.tags || []
                });
                setShowMovementModal(true);
              }}
              className="p-1.5 rounded-lg bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-700/30 transition-all"
              title="Edit"
            >
              <FiEdit className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                // View details modal
                setSelectedProduct(row.original);
              }}
              className="p-1.5 rounded-lg bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/50 border border-emerald-700/30 transition-all"
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteMovement(row.original.id)}
              className="p-1.5 rounded-lg bg-rose-900/30 text-rose-300 hover:bg-rose-800/50 border border-rose-700/30 transition-all"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </motion.button>
          </div>
        )
      }
    ],
    []
  );


  // Filter movements with enhanced filtering
  const filteredMovements = useMemo(() => {
    let filtered = [...movements];
    
    // Apply filters
    if (filters.movementType) {
      filtered = filtered.filter(m => m.movement_type === filters.movementType);
    }
    
    if (filters.product) {
      filtered = filtered.filter(m => m.product === filters.product);
    }
    
    if (filters.warehouse) {
      filtered = filtered.filter(m => m.warehouse === filters.warehouse);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(m => new Date(m.movement_date) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(m => new Date(m.movement_date) <= new Date(filters.dateTo));
    }
    
    // Value range filter
    if (filters.minValue) {
      filtered = filtered.filter(m => m.movement_value >= parseFloat(filters.minValue));
    }
    
    if (filters.maxValue) {
      filtered = filtered.filter(m => m.movement_value <= parseFloat(filters.maxValue));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [movements, filters, sortConfig]);


  // React Table setup
  const table = useReactTable({
    data: filteredMovements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 15 }
    },
  });


  // Calculate enhanced statistics
  const stats = useMemo(() => {
    const receipts = movements.filter(m => m.movement_type === 'receipt');
    const issues = movements.filter(m => m.movement_type === 'issue');
    const transfers = movements.filter(m => m.movement_type.includes('transfer'));
    const adjustments = movements.filter(m => m.movement_type === 'adjustment');
    
    const totalValue = movements.reduce((sum, m) => sum + Math.abs(m.quantity) * m.unit_cost, 0);
    const receiptValue = receipts.reduce((sum, m) => sum + Math.abs(m.quantity) * m.unit_cost, 0);
    const issueValue = issues.reduce((sum, m) => sum + Math.abs(m.quantity) * m.unit_cost, 0);
    
    const today = new Date();
    const todayMovements = movements.filter(m => {
      const movementDate = new Date(m.movement_date);
      return movementDate.toDateString() === today.toDateString();
    });
    
    // Stock alert count
    const lowStockProducts = stockOverview?.products?.filter(p => p.needs_reorder) || [];
    
    return { 
      receipts: receipts.length,
      issues: issues.length,
      transfers: transfers.length,
      adjustments: adjustments.length,
      totalValue,
      receiptValue,
      issueValue,
      todayMovements: todayMovements.length,
      lowStockCount: lowStockProducts.length,
      averageMovementValue: movements.length > 0 ? totalValue / movements.length : 0
    };
  }, [movements, stockOverview]);

  // Warehouse stock summary
  const warehouseSummary = useMemo(() => {
    if (!currentStock || !warehouses.length) return [];
    
    const summary = warehouses.map(warehouse => {
      const warehouseStock = currentStock.filter(s => s.warehouse__warehouse_name === warehouse.warehouse_name);
      const totalStock = warehouseStock.reduce((sum, s) => sum + (s.current_stock || 0), 0);
      const totalValue = warehouseStock.reduce((sum, s) => {
        const product = products.find(p => p.sku === s.product__sku);
        return sum + (s.current_stock || 0) * (product?.standard_cost || 0);
      }, 0);
      
      const movementCount = movements.filter(m => m.warehouse === warehouse.id).length;
      
      return {
        ...warehouse,
        totalStock,
        totalValue,
        movementCount,
        productCount: warehouseStock.length,
        lastActivity: warehouseStock.length > 0 
          ? Math.max(...warehouseStock.map(s => new Date(s.last_movement || 0)))
          : null
      };
    });
    
    return summary.sort((a, b) => b.totalValue - a.totalValue);
  }, [currentStock, warehouses, products, movements]);

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredMovements.map((movement, index) => (
        <motion.div
          key={movement.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-sm font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
              {movement.movement_number}
            </span>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              movement.movement_type === 'receipt' ? 'bg-emerald-900/30 text-emerald-300' :
              movement.movement_type === 'issue' ? 'bg-rose-900/30 text-rose-300' :
              'bg-blue-900/30 text-blue-300'
            }`}>
              {movement.movement_type}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-white">{movement.product_name}</div>
              <div className="text-sm text-gray-400">{movement.product_sku}</div>
            </div>
            
            <div className="flex items-center text-sm text-gray-300">
              <FiMapPin className="w-3.5 h-3.5 mr-2" />
              {movement.warehouse_name}
            </div>
            
            <div className="flex justify-between items-center">
              <div className={`text-lg font-bold ${
                movement.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
              </div>
              <div className="text-emerald-300 font-semibold">
                ${parseFloat(movement.movement_value).toFixed(2)}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {new Date(movement.movement_date).toLocaleString()}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between">
            <button
              onClick={() => {
                setEditingMovement(movement);
                setMovementData({
                  movement_type: movement.movement_type,
                  product: movement.product,
                  warehouse: movement.warehouse,
                  quantity: movement.quantity,
                  unit_cost: movement.unit_cost,
                  reference_doc: movement.reference_doc,
                  movement_date: new Date(movement.movement_date),
                  notes: movement.notes || '',
                  batch_number: movement.batch_number || '',
                  expiry_date: movement.expiry_date ? new Date(movement.expiry_date) : null,
                  tags: movement.tags || []
                });
                setShowMovementModal(true);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteMovement(movement.id)}
              className="text-rose-400 hover:text-rose-300 text-sm"
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Timeline view component
  const TimelineView = () => (
    <div className="space-y-4">
      {filteredMovements.map((movement, index) => (
        <motion.div
          key={movement.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-8 pb-8 border-l border-gray-700 last:pb-0"
        >
          {/* Timeline dot */}
          <div className={`absolute left-[-8px] top-0 w-4 h-4 rounded-full border-4 border-gray-900 ${
            movement.movement_type === 'receipt' ? 'bg-emerald-500' :
            movement.movement_type === 'issue' ? 'bg-rose-500' :
            'bg-blue-500'
          }`} />
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-mono text-sm font-bold text-blue-300 mr-3">
                  {movement.movement_number}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  movement.movement_type === 'receipt' ? 'bg-emerald-900/30 text-emerald-300' :
                  movement.movement_type === 'issue' ? 'bg-rose-900/30 text-rose-300' :
                  'bg-blue-900/30 text-blue-300'
                }`}>
                  {movement.movement_type}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date(movement.movement_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <div className="font-medium text-white">{movement.product_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Warehouse</div>
                <div className="font-medium text-gray-300">{movement.warehouse_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quantity</div>
                <div className={`font-bold ${
                  movement.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Value</div>
                <div className="font-bold text-emerald-300">${parseFloat(movement.movement_value).toFixed(2)}</div>
              </div>
            </div>
            
            {movement.reference_doc && (
              <div className="mt-3 text-sm text-gray-400">
                Reference: {movement.reference_doc}
              </div>
            )}
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => {
                  setEditingMovement(movement);
                  setMovementData({
                    movement_type: movement.movement_type,
                    product: movement.product,
                    warehouse: movement.warehouse,
                    quantity: movement.quantity,
                    unit_cost: movement.unit_cost,
                    reference_doc: movement.reference_doc,
                    movement_date: new Date(movement.movement_date),
                  });
                  setShowMovementModal(true);
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteMovement(movement.id)}
                className="text-sm text-rose-400 hover:text-rose-300"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex">
    <Sidebar />
    
    <div className="flex-1 flex flex-col h-screen overflow-y-auto">
      {/* Enhanced Header with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl"
        >
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400"
                >
                  Inventory Movements
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 mt-1 text-sm md:text-base"
                >
                  Real-time tracking, analytics, and management of all stock activities
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAnalyticsModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <FiBarChart2 className="mr-2" />
                  Analytics
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStockModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <FiLayers className="mr-2" />
                  Stock Overview
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTransferModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  <FiRefreshCw className="mr-2" />
                  Transfer Stock
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMovementModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  <FiPlus className="mr-2" />
                  New Movement
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Quick Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Movements</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    <AnimatedCounter value={movements.length} />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.todayMovements} today
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-emerald-300 font-semibold">
                    ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Stock Alerts</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    <AnimatedCounter value={stats.lowStockCount} />
                  </p>
                  <p className="text-xs text-rose-400 mt-1">
                    Needs reordering
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-rose-500 to-pink-500">
                  <FiAlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Products</span>
                  <span className="text-blue-300 font-semibold">
                    {products.length}
                  </span>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Warehouses</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {warehouses.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Active locations
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <StockLevelIndicator 
                  current={stats.receipts} 
                  min={0} 
                  max={Math.max(stats.receipts + stats.issues, 100)} 
                />
              </div>
            </GlassCard>
            
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg. Movement</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    ${stats.averageMovementValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per transaction
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-500">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">In/Out Ratio</span>
                  <span className="text-cyan-300 font-semibold">
                    {stats.receipts}:{stats.issues}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* View Toggle and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
                {['table', 'grid', 'timeline'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {mode === 'table' ? <FiList className="inline mr-2" /> :
                     mode === 'grid' ? <FiGrid className="inline mr-2" /> :
                     <FiClock className="inline mr-2" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all"
              >
                <FiFilter className="mr-2" />
                Filters
                {Object.values(filters).some(f => f) && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchAllData}
                className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-blue-500/50 text-gray-300 hover:text-white transition-all"
                disabled={refreshing}
              >
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <div className="relative">
                <button className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-blue-500/50 text-gray-300 hover:text-white transition-all">
                  <FiDownload className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={exportToCSV}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-t-lg"
                  >
                    Export to CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-b-lg"
                  >
                    Export to PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Movement Type
                      </label>
                      <select
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product
                      </label>
                      <select
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.product}
                        onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                      >
                        <option value="">All Products</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.product_name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Warehouse
                      </label>
                      <select
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.warehouse}
                        onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                      >
                        <option value="">All Warehouses</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.warehouse_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Value Range
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filters.minValue}
                          onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filters.maxValue}
                          onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-4">
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                        <div className="text-sm text-gray-400">
                          {filteredMovements.length} movements match filters
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setFilters({
                                movementType: '',
                                product: '',
                                warehouse: '',
                                dateFrom: '',
                                dateTo: '',
                                minValue: '',
                                maxValue: ''
                              });
                              toast.success('All filters cleared');
                            }}
                            className="px-4 py-2 bg-gray-700/50 backdrop-blur-sm text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-rose-500/50 transition-all"
                          >
                            Clear All
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(false)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                          >
                            Apply Filters
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                <p className="mt-4 text-gray-400">Loading inventory data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* View Mode Content */}
              {viewMode === 'table' ? (
                <GlassCard className="overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search movements, products, references..."
                          className="pl-10 pr-4 py-2 w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">
                          Showing {filteredMovements.length} of {movements.length} movements
                        </div>
                        <select
                          value={table.getState().pagination.pageSize}
                          onChange={(e) => table.setPageSize(Number(e.target.value))}
                          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[15, 30, 50, 100].map((size) => (
                            <option key={size} value={size}>
                              Show {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/30 backdrop-blur-sm">
                        {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th
                                key={header.id}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {table.getRowModel().rows.map(row => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-800/20 backdrop-blur-sm transition-colors"
                          >
                            {row.getVisibleCells().map(cell => (
                              <td
                                key={cell.id}
                                className="px-6 py-4 whitespace-nowrap"
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
                  <div className="px-6 py-4 border-t border-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                      <div className="text-sm text-gray-400">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            !table.getCanPreviousPage()
                              ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            !table.getCanNextPage()
                              ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ) : viewMode === 'grid' ? (
                <GridView />
              ) : (
                <GlassCard className="p-6">
                  <TimelineView />
                </GlassCard>
              )}

              {/* Warehouse Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <GlassCard className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Warehouse Stock Summary</h3>
                  <div className="space-y-4">
                    {warehouseSummary.map((warehouse, index) => (
                      <motion.div
                        key={warehouse.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30 hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-white">{warehouse.warehouse_name}</div>
                            <div className="text-sm text-gray-400">{warehouse.location}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-300">
                              ${warehouse.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-400">{warehouse.totalStock} units</div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-gray-400">
                            {warehouse.productCount} products
                          </span>
                          <span className="text-blue-400">
                            {warehouse.movementCount} movements
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Recent Activity */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {filteredMovements.slice(0, 5).map((movement, index) => (
                      <div
                        key={movement.id}
                        className="flex items-center p-3 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30"
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          movement.movement_type === 'receipt' ? 'bg-emerald-500' :
                          movement.movement_type === 'issue' ? 'bg-rose-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">
                            {movement.product_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {movement.warehouse_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            movement.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(movement.movement_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Stock Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-700/50"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Stock Transfer
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Transfer stock between warehouses</p>
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleStockTransfer} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Product
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={transferData.product_id}
                        onChange={(e) => setTransferData({ ...transferData, product_id: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="">Choose a product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.product_name} ({product.sku}) - ${product.standard_cost}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Source Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Warehouse
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={transferData.from_warehouse_id}
                        onChange={(e) => setTransferData({ ...transferData, from_warehouse_id: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
                      >
                        <option value="">Select source...</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.warehouse_name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Destination Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      To Warehouse
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={transferData.to_warehouse_id}
                        onChange={(e) => setTransferData({ ...transferData, to_warehouse_id: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select destination...</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.warehouse_name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Quantity and Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="0.001"
                      step="0.001"
                      value={transferData.quantity}
                      onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={transferData.priority}
                      onChange={(e) => setTransferData({ ...transferData, priority: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  {/* Reason */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason / Notes
                    </label>
                    <textarea
                      value={transferData.reason}
                      onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]"
                      placeholder="Reason for transfer, special instructions..."
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-end space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-rose-500/50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-semibold"
                  >
                    <FiRefreshCw className="inline mr-2" />
                    Initiate Transfer
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced Movement Modal */}
      <AnimatePresence>
        {showMovementModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-700/50"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {editingMovement ? 'Edit Movement' : 'Create New Movement'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingMovement ? 'Update existing stock movement' : 'Record new inventory transaction'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMovementModal(false);
                    setEditingMovement(null);
                    resetMovementData();
                  }}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleMovementSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Movement Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movement Type
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={movementData.movement_type}
                        onChange={(e) => setMovementData({ ...movementData, movement_type: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      >
                        <option value="receipt">📥 Receipt</option>
                        <option value="issue">📤 Issue</option>
                        <option value="transfer_in">🔄 Transfer In</option>
                        <option value="transfer_out">🔄 Transfer Out</option>
                        <option value="adjustment">📊 Adjustment</option>
                        <option value="production_receipt">🏭 Production Receipt</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Product */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={movementData.product}
                        onChange={(e) => setMovementData({ ...movementData, product: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.product_name} ({product.sku})
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Warehouse
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={movementData.warehouse}
                        onChange={(e) => setMovementData({ ...movementData, warehouse: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                      >
                        <option value="">Select warehouse...</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.warehouse_name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      step="0.001"
                      value={movementData.quantity}
                      onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.000"
                    />
                  </div>
                  
                  {/* Unit Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit Cost
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={movementData.unit_cost}
                        onChange={(e) => setMovementData({ ...movementData, unit_cost: e.target.value })}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  {/* Batch Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Batch Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={movementData.batch_number}
                      onChange={(e) => setMovementData({ ...movementData, batch_number: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="BATCH-XXX"
                    />
                  </div>
                  
                  {/* Reference Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reference Document
                    </label>
                    <input
                      type="text"
                      value={movementData.reference_doc}
                      onChange={(e) => setMovementData({ ...movementData, reference_doc: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="PO/INV/REF Number"
                    />
                  </div>
                  
                  {/* Movement Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movement Date
                    </label>
                    <DatePicker
                      selected={movementData.movement_date}
                      onChange={(date) => setMovementData({ ...movementData, movement_date: date })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  </div>
                  
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <DatePicker
                      selected={movementData.expiry_date}
                      onChange={(date) => setMovementData({ ...movementData, expiry_date: date })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      isClearable
                      placeholderText="Select expiry date"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes / Description
                    </label>
                    <textarea
                      value={movementData.notes}
                      onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                      placeholder="Additional details, comments, or instructions..."
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-end space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowMovementModal(false);
                      setEditingMovement(null);
                      resetMovementData();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-rose-500/50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all font-semibold"
                  >
                    {editingMovement ? (
                      <>
                        <FiEdit className="inline mr-2" />
                        Update Movement
                      </>
                    ) : (
                      <>
                        <FiPlus className="inline mr-2" />
                        Create Movement
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 border border-gray-700/50"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    Inventory Analytics Dashboard
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Comprehensive analysis of stock movements and trends</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Movement Value Chart */}
                  <GlassCard className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Movement Value Trends (Last 30 Days)</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={movementAnalytics.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#E5E7EB' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="url(#colorValue)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                  
                  {/* Top Products Chart */}
                  <GlassCard className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Top Products by Movement Volume</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movementAnalytics.topProducts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                          />
                          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                  
                  {/* Movement Type Distribution */}
                  <GlassCard className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Movement Type Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Receipts', value: stats.receipts, color: '#10B981' },
                              { name: 'Issues', value: stats.issues, color: '#EF4444' },
                              { name: 'Transfers', value: stats.transfers, color: '#3B82F6' },
                              { name: 'Adjustments', value: stats.adjustments, color: '#8B5CF6' },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Receipts', value: stats.receipts, color: '#10B981' },
                              { name: 'Issues', value: stats.issues, color: '#EF4444' },
                              { name: 'Transfers', value: stats.transfers, color: '#3B82F6' },
                              { name: 'Adjustments', value: stats.adjustments, color: '#8B5CF6' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                  
                  {/* Key Metrics */}
                  <GlassCard className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <div className="text-sm text-gray-400">Avg. Daily Value</div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1">
                            ${movementAnalytics.averageDailyValue.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <div className="text-sm text-gray-400">Total Movements</div>
                          <div className="text-2xl font-bold text-blue-400 mt-1">
                            {movementAnalytics.totalMovements}
                          </div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <div className="text-sm text-gray-400">Receipt Value</div>
                          <div className="text-2xl font-bold text-green-400 mt-1">
                            ${stats.receiptValue.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <div className="text-sm text-gray-400">Issue Value</div>
                          <div className="text-2xl font-bold text-rose-400 mt-1">
                            ${stats.issueValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700/50">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Movement Efficiency</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Movement per Product</span>
                            <span className="text-white">
                              {(movementAnalytics.totalMovements / products.length).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Value per Movement</span>
                            <span className="text-white">
                              ${(stats.totalValue / movementAnalytics.totalMovements).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Overview Modal */}
      <AnimatePresence>
        {showStockModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 border border-gray-700/50"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400">
                    Stock Overview & Alerts
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Current stock levels and reorder alerts</p>
                </div>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {stockOverview ? (
                  <div className="space-y-6">
                    {/* Stock Summary */}
                    <GlassCard className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Total Products</div>
                          <div className="text-3xl font-bold text-white mt-2">
                            {stockOverview.total_products}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Reorder Needed</div>
                          <div className="text-3xl font-bold text-rose-400 mt-2">
                            {stockOverview.reorder_needed}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Active Products</div>
                          <div className="text-3xl font-bold text-emerald-400 mt-2">
                            {stockOverview.products?.length || 0}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                    
                    {/* Stock List */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Product Stock Levels</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {stockOverview.products?.map((product, index) => (
                          <motion.div
                            key={product.product_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-lg border ${
                              product.needs_reorder
                                ? 'bg-gradient-to-r from-rose-900/20 to-pink-900/10 border-rose-700/30'
                                : 'bg-gray-800/30 border-gray-700/30'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-white">{product.product_name}</div>
                                <div className="text-sm text-gray-400">{product.sku}</div>
                              </div>
                              {product.needs_reorder && (
                                <span className="px-2 py-1 bg-rose-900/50 text-rose-300 text-xs rounded-full">
                                  Reorder
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Current Stock</span>
                                <span className={`font-bold ${
                                  product.current_stock <= product.reorder_point
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                                }`}>
                                  {product.current_stock} units
                                </span>
                              </div>
                              
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    product.current_stock <= product.reorder_point
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                                      : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (product.current_stock / (product.reorder_point * 3)) * 100)}%`
                                  }}
                                />
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Reorder Point: {product.reorder_point}</span>
                                <span>Value: ${(product.current_stock * product.standard_cost).toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-700/30">
                              <div className="flex justify-between text-sm">
                                <span className={`flex items-center ${product.recent_activity ? 'text-emerald-400' : 'text-gray-400'}`}>
                                  {product.recent_activity ? (
                                    <>
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                                      Recent Activity
                                    </>
                                  ) : (
                                    'No Recent Activity'
                                  )}
                                </span>
                                <button
                                  onClick={() => {
                                    // Navigate to product details or create movement
                                    setMovementData(prev => ({
                                      ...prev,
                                      product: product.product_id,
                                      movement_type: 'receipt',
                                      unit_cost: product.standard_cost
                                    }));
                                    setShowMovementModal(true);
                                    setShowStockModal(false);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Replenish
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    <p className="mt-4 text-gray-400">Loading stock data...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* View Movement Details Modal */}
<AnimatePresence>
  {selectedProduct && (
    <div
      className="fixed inset-0 bg-[#0a1124]/80 backdrop-blur-xl flex items-center justify-center p-4 z-50"
      onClick={() => setSelectedProduct(null)}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-3xl bg-gradient-to-br from-[#0d1733] to-[#111b3c] 
                   rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* TOP BAR */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white tracking-wide">Movement Details</h2>
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 grid grid-cols-3 gap-6">

          {/* LEFT SIDEBAR PRODUCT CARD */}
          <div className="col-span-1">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <div className="w-14 h-14 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <FiPackage className="w-7 h-7 text-blue-300" />
              </div>

              <h3 className="text-lg font-bold text-white">{selectedProduct.product_name}</h3>
              <p className="text-blue-300 text-sm mt-1 font-mono">SKU: {selectedProduct.product_sku}</p>

              <div className="mt-5">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Movement #</p>
                <p className="text-white font-mono">{selectedProduct.movement_number}</p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="col-span-2 space-y-6">

            {/* GRID DETAILS */}
            <div className="grid grid-cols-2 gap-6">

              {/* Type */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Type</label>
                <div className="mt-1">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 
                                   text-blue-300 border border-blue-400/20 text-sm font-medium capitalize">
                    {selectedProduct.movement_type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Date</label>
                <div className="flex items-center mt-1 text-gray-200">
                  <FiCalendar className="w-4 h-4 mr-2 text-blue-300" />
                  {new Date(selectedProduct.movement_date).toLocaleDateString()}
                  <span className="mx-2 text-gray-500">•</span>
                  {new Date(selectedProduct.movement_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Quantity</label>
                <p
                  className={`text-3xl font-bold mt-1 ${
                    selectedProduct.quantity > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedProduct.quantity > 0 ? "+" : ""}
                  {selectedProduct.quantity}
                </p>
              </div>

              {/* Total Value */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Total Value</label>
                <p className="text-3xl font-semibold text-white mt-1">
                  ${parseFloat(selectedProduct.movement_value).toFixed(2)}
                </p>
              </div>

              {/* Warehouse */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Warehouse</label>
                <div className="flex items-center text-gray-200 mt-1">
                  <FiMapPin className="w-4 h-4 mr-2 text-blue-300" />
                  {selectedProduct.warehouse_name}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Status</label>
                <p className="flex items-center text-emerald-400 mt-1">
                  <FiCheck className="w-4 h-4 mr-2" />
                  {selectedProduct.status || "Completed"}
                </p>
              </div>
            </div>

            {/* EXTRA INFO */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {selectedProduct.reference_doc && (
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-500">Reference Doc</span>
                  <span className="font-mono text-blue-300">{selectedProduct.reference_doc}</span>
                </div>
              )}

              {selectedProduct.batch_number && (
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-500">Batch Number</span>
                  <span className="font-mono text-yellow-400">
                    {selectedProduct.batch_number}
                  </span>
                </div>
              )}

              {selectedProduct.notes && (
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-3">
                  <span className="text-xs text-gray-400 uppercase font-semibold block mb-1">
                    Notes
                  </span>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedProduct.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>


    </div>
  );
};

export default Movements;
