import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiDatabase, FiSettings, FiBarChart2, FiUpload, FiHelpCircle,
  FiLogOut, FiMenu, FiChevronDown, FiUser
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout } from '../utils/auth';

const Sidebar = () => {
  const initialOpen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [openMenus, setOpenMenus] = useState({});
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024 && isOpen) setIsOpen(false);
      if (window.innerWidth >= 1024 && !isOpen) setIsOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const resp = await api.get('auth/tenant-info/');
        const data = resp.data || {};

        // Prefer full_name, then username, then company_name as fallback
        const name =
          data.full_name ||
          data.username ||
          data.company_name ||
          (data.email ? data.email.split('@')[0] : null);

        if (mounted) setUserName(name || 'User');
      } catch (err) {
        console.error('Failed to fetch tenant/user info for sidebar', err);
        if (mounted) setUserName('User');
      }
    };
    fetchUser();
    return () => (mounted = false);
  }, []);

  const toggleSidebar = () => setIsOpen(s => !s);
  const toggleSubMenu = (menu) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome />,
      subItems: [
        { name: 'Executive', path: '/dashboard' },
      ],
    },
    {
      name: 'Inventory',
      icon: <FiDatabase />,
      subItems: [
        { name: 'Products', path: '/inventory/products' },
        { name: 'Movements', path: '/inventory/movements' },
        { name: 'Reorder Suggestions', path: '/inventory/reorder-suggestions' },
        { name: 'Valuation', path: '/inventory/valuation' },
        { name: 'Warehouses', path: '/inventory/warehouses' },
        { name: 'Parties', path: '/inventory/parties' },
      ],
    },
    {
      name: 'Production',
      icon: <FiSettings />,
      subItems: [
        { name: 'Work Orders', path: '/production/work-orders' },
        { name: 'Entries', path: '/production/entries' },
        { name: 'Equipment', path: '/production/equipment' },
        { name: 'Employees', path: '/production/employees' },
        { name: 'Analysis', path: '/production/analysis' },
      ],
    },
    {
      name: 'Finance',
      icon: <FiBarChart2 />,
      subItems: [
        { name: 'Journals', path: '/finance/journals' },
        { name: 'Cost Centers', path: '/finance/cost-centers' },
        { name: 'Trial Balance', path: '/finance/reports' }
      ],
    },
    {
      name: 'AI Assistant',
      icon: <FaRobot />,
      subItems: [
        { name: 'Query', path: '/ai/query' },
        { name: 'Insights', path: '/ai/insights' }
      ],
    },
    {
      name: 'Data Ops',
      icon: <FiUpload />,
      subItems: [
        { name: 'Import/Export', path: '/data-ops/import-export' },
        { name: 'Adjustments', path: '/data-ops/adjustments' },
      ],
    }
  ];

  return (
    <div className="relative">
      {/* Mobile overlay */}
      {isOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen flex flex-col border-r border-gray-800/40 bg-gradient-to-b from-[#071026] via-[#071326] to-[#0b1220] text-gray-100 shadow-xl transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}
        initial={{ x: window.innerWidth < 1024 ? -256 : 0 }}
        animate={{ x: isOpen ? 0 : (window.innerWidth < 1024 ? -256 : 0) }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Top: user + collapse button */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-800/40">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#1f2937] to-[#111827] flex items-center justify-center text-xl text-indigo-300 shadow-inner">
              <FiUser />
            </div>

            <div className="flex-1">
              {isOpen ? (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate">{userName || 'User'}</span>
                  <span className="text-xs text-gray-400 truncate">Signed in</span>
                </div>
              ) : null}
            </div>

            {/* collapse toggle */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-white/5 focus:outline-none"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FiMenu size={18} />
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-3 px-1">
          {menuItems.map((item) => (
            <div key={item.name} className="mb-1">
              <button
                onClick={() => toggleSubMenu(item.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors duration-150 hover:bg-white/5 ${openMenus[item.name] ? 'bg-white/3' : ''}`}
              >
                <div className="text-lg w-6 flex-shrink-0 flex items-center justify-center">{item.icon}</div>
                {isOpen && <span className="flex-1 text-sm">{item.name}</span>}
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
                    className="ml-7 mt-1"
                  >
                    {item.subItems.map((sub) => (
                      <button 
                        key={sub.name} 
                        onClick={() => {
                          navigate(sub.path);
                          if (window.innerWidth < 1024) setIsOpen(false);
                        }} 
                        className="w-full text-left p-2 text-sm rounded-md hover:bg-white/4 block"
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
        <div className="p-4 border-t border-gray-800/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#0f1724] to-[#081223] flex items-center justify-center text-lg text-amber-300">
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
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-red-700/80 hover:bg-red-600/80">
                  <FiLogOut /> Logout
                </button>
              ) : (
                <button onClick={handleLogout} className="p-2 rounded-md hover:bg-white/5" title="Logout">
                  <FiLogOut />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* PERSISTENT OPEN BUTTON (visible when collapsed): */}
      {!isOpen && window.innerWidth >= 1024 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-4 z-50 w-10 h-10 rounded-r-md bg-indigo-600/95 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <FiMenu />
        </button>
      )}
    </div>
  );
};

export default Sidebar;