import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiDatabase, FiSettings, FiBarChart2, FiUpload,
  FiLogOut, FiMenu, FiChevronDown, FiUser, FiFileText
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout } from '../utils/auth';

const Sidebar = () => {
  // Safe initial values for SSR
  const safeWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const [isMobile, setIsMobile] = useState(safeWidth < 1024);
  const [isOpen, setIsOpen] = useState(safeWidth >= 1024); // open by default on desktop
  const [openMenus, setOpenMenus] = useState({});
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();

  // Resize handler keeps isMobile reactive
  useEffect(() => {
    let mounted = true;
    const onResize = () => {
      if (!mounted) return;
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // If we switched to desktop ensure sidebar is open
      if (!mobile) setIsOpen(true);
      // If switched to mobile, keep the user's current state (don't force-close)
    };

    window.addEventListener('resize', onResize);
    // run once to normalize
    onResize();

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Fetch user info safely
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const resp = await api.get('auth/tenant-info/');
        const data = resp?.data || {};
        const name =
          data.full_name ||
          data.username ||
          data.company_name ||
          (data.email ? data.email.split('@')[0] : null);
        if (mounted) setUserName(name || 'User');
      } catch (err) {
        console.error('Sidebar tenant fetch failed', err);
        if (mounted) setUserName('User');
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSidebar = () => setIsOpen(s => !s);
  const toggleSubMenu = (name) => setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      navigate('/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome />, subItems: [{ name: 'Executive', path: '/dashboard' }] },
    {
      name: 'Inventory', icon: <FiDatabase />, subItems: [
        { name: 'Products', path: '/inventory/products' },
        { name: 'Movements', path: '/inventory/movements' },
        { name: 'Reorder Suggestions', path: '/inventory/reorder-suggestions' },
        { name: 'Valuation', path: '/inventory/valuation' },
        { name: 'Warehouses', path: '/inventory/warehouses' },
        { name: 'Parties', path: '/inventory/parties' },
        { name: 'POs & Stock Reports', path: '/inventory/stock-reports' },
      ]
    },
    {
      name: 'Production', icon: <FiSettings />, subItems: [
        { name: 'Work Orders', path: '/production/work-orders' },
        { name: 'Entries', path: '/production/entries' },
        { name: 'Equipment', path: '/production/equipment' },
        { name: 'Employees', path: '/production/employees' },
        { name: 'Analysis', path: '/production/analysis' },
        { name: 'Review & Inspection', path: '/production/review' },
      ]
    },
    {
      name: 'Finance', icon: <FiBarChart2 />, subItems: [
        { name: 'Journals', path: '/finance/journals' },
        { name: 'Cost Centers', path: '/finance/cost-centers' },
        { name: 'Trial Balance', path: '/finance/reports' }
      ]
    },
    {
      name: 'Documents', icon: <FiFileText />, subItems: [
        { name: 'Customer Purchase Orders', path: '/customer-order' },
        { name: 'Customer Invoices', path: '/invoices' },
        { name: 'Reconciliation & Payment Advice', path: '/reconcile' }
      ]
    },
    {
      name: 'AI Assistant', icon: <FaRobot />, subItems: [
        { name: 'Query', path: '/ai/query' },
        { name: 'Insights', path: '/ai/insights' }
      ]
    },
    {
      name: 'Data Ops', icon: <FiUpload />, subItems: [
        { name: 'Import/Export', path: '/data-ops/import-export' },
        { name: 'Adjustments', path: '/data-ops/adjustments' },
      ]
    }
  ];

  // Sizes used by motion (px)
  const OPEN_W = 256;
  const CLOSED_W = isMobile ? 0 : 80;

  return (
    <div className="relative">
      {/* Mobile overlay when sidebar open */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
        <motion.aside
            className={`${
              isMobile
                ? 'fixed top-0 left-0 z-50' // overlay on mobile
                : 'sticky top-0 h-screen flex-shrink-0' // reserved space on desktop
            } flex flex-col border-r border-gray-800/40 bg-gradient-to-b from-[#071026] via-[#071326] to-[#0b1220] text-gray-100 shadow-xl`}
            initial={{ x: isMobile ? -OPEN_W : 0, width: isOpen ? OPEN_W : CLOSED_W }}
            animate={{
              x: isOpen ? 0 : (isMobile ? -OPEN_W : 0),
              width: isOpen ? OPEN_W : CLOSED_W,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            aria-hidden={isMobile && !isOpen}
            style={{ overflow: 'hidden' }}
          >

        {/* Top */}
        <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-b border-gray-800/40 min-h-[70px]">
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <div className={`${isOpen ? 'w-10 h-10' : 'w-8 h-8'} rounded-md bg-gradient-to-br from-[#1f2937] to-[#111827] flex items-center justify-center ${isOpen ? 'text-xl' : 'text-lg'} text-indigo-300 shadow-inner flex-shrink-0`}>
              <FiUser />
            </div>

            <div className="flex-1">
              {isOpen ? (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate">{userName}</span>
                  <span className="text-xs text-gray-400 truncate">Signed in</span>
                </div>
              ) : null}
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 rounded-md hover:bg-white/5 focus:outline-none transition-colors flex-shrink-0"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FiMenu size={isOpen ? 18 : 16} />
            </button>
          </div>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto py-2 sm:py-3 px-1 custom-scrollbar">
          {menuItems.map(item => (
            <div key={item.name} className="mb-1">
              <button
                onClick={() => toggleSubMenu(item.name)}
                className={`w-full flex items-center ${isOpen ? 'gap-3 p-3' : 'gap-0 p-2 justify-center'} rounded-md transition-all duration-200 hover:bg-white/5 ${openMenus[item.name] ? 'bg-white/3' : ''} group`}
              >
                <div className={`${isOpen ? 'text-lg w-6' : 'text-xl w-full'} flex-shrink-0 flex items-center justify-center transition-all duration-200 ${!isOpen ? 'group-hover:scale-110' : ''}`}>
                  {item.icon}
                </div>

                {isOpen && <span className="flex-1 text-sm font-medium truncate">{item.name}</span>}

                {isOpen && item.subItems.length > 0 && (
                  <FiChevronDown className={`transition-transform ${openMenus[item.name] ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {isOpen && openMenus[item.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="ml-6 mt-1 border-l border-gray-700/50"
                  >
                    {item.subItems.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => {
                          navigate(sub.path);
                          if (isMobile) setIsOpen(false);
                        }}
                        className="w-full text-left p-2 pl-3 text-sm rounded-r-md hover:bg-white/4 hover:border-l-2 hover:border-indigo-400 transition-all duration-150 block truncate"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Bottom: brand + logout */}
        <div className="p-3 sm:p-4 border-t border-gray-800/40">
          <div className={`flex items-center ${isOpen ? 'justify-between gap-3' : 'justify-center'}`}>
            <div className={`${isOpen ? 'flex items-center gap-3' : 'flex items-center'}`}>
              <div className={`${isOpen ? 'w-10 h-10' : 'w-8 h-8'} rounded-md bg-gradient-to-br from-[#0f1724] to-[#081223] flex items-center justify-center ${isOpen ? 'text-lg' : 'text-base'} text-amber-300 flex-shrink-0`}>
                <FaRobot />
              </div>
              {isOpen && (
                <div>
                  <div className="text-sm font-bold tracking-tight">
                    Quantum Finance <span className="text-indigo-300">AI</span>
                  </div>
                  <div className="text-xs text-gray-400">Empower decisions</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOpen ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-red-700/80 hover:bg-red-600/80 transition-colors"
                >
                  <FiLogOut /> Logout
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors group relative"
                  title="Logout"
                >
                  <FiLogOut size={16} />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    Logout
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Desktop persistent open button (only on desktop and when collapsed) */}
      <AnimatePresence>
        {!isOpen && !isMobile && (
          <motion.button
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            onClick={() => setIsOpen(true)}
            className="fixed left-0 top-4 z-50 w-8 h-8 rounded-r-md bg-indigo-600/95 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <FiMenu size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* MOBILE HAMBURGER — visible when isMobile === true */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-[70] w-10 h-10 rounded-md bg-indigo-600/95 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-transform duration-150 ${isMobile ? 'block' : 'hidden'}`}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <FiMenu size={20} />
      </motion.button>
    </div>
  );
};

export default Sidebar;