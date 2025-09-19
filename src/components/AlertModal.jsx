import { motion } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';

const AlertModal = ({ isOpen, onClose, alert }) => {
  if (!isOpen || !alert) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-md w-full border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <FiAlertCircle className="mr-2 text-red-400" /> {alert.type.replace('_', ' ').toUpperCase()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <FiX size={24} />
          </button>
        </div>
        <p className="text-gray-300 dark:text-gray-600 mb-4">{alert.message}</p>
        <p className="text-sm text-gray-400">Action Required: {alert.action_required}</p>
        <p className="text-sm text-gray-400">Reference: {alert.reference}</p>
        <button
          className="mt-4 w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-[0_0_10px_rgba(59,130,246,0.7)] transition"
          onClick={onClose}
        >
          Acknowledge
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AlertModal;