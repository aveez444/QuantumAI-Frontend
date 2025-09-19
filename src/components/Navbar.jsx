// components/Navbar.jsx
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

const navItems = [
  { name: 'Home', to: '/' },
  { name: 'Features', to: '/features' },
  { name: 'Solutions', to: '/solutions' }, // removed dropdown — direct route
  { name: 'About', to: '/about' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const activeClass =
    'text-white bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md px-3 py-1 shadow-lg';

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 16 }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="backdrop-blur-md bg-black/60 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center space-x-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"
              aria-label="Quantum Finance AI - Home"
            >
              <div className="text-2xl">⚡</div>
              <div className="font-bold text-lg lg:text-2xl">Quantum Finance AI</div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `${isActive ? activeClass : 'text-gray-300 hover:text-white'} text-lg px-2 py-1 transition`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Spacer */}
              <div className="w-px h-6 bg-gray-700 mx-2" />

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${isActive ? activeClass : 'bg-gray-800 hover:bg-gray-700 text-gray-100'} px-4 py-2 rounded-md text-lg transition`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/request-subscription"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] transform transition text-white shadow-md"
              >
                Request Access <FiArrowRight />
              </NavLink>
            </nav>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setOpen((s) => !s)}
                aria-expanded={open}
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {open ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden"
            >
              <div className="px-6 pt-4 pb-6 space-y-3 border-t border-gray-800 bg-black/70">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `block text-lg px-3 py-2 rounded-md transition ${isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}

                <NavLink
                  to="/login"
                  className="block text-center mt-2 px-4 py-2 rounded-md bg-gray-800 text-white"
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/request-subscription"
                  className="block text-center mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  onClick={() => setOpen(false)}
                >
                  Request Access
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
