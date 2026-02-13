import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
  if (!isOpen) return null;

  const colors = {
    warning: { bg: 'from-yellow-900/30 to-gray-800', border: 'border-yellow-500/30', button: 'bg-yellow-600 hover:bg-yellow-700', icon: 'text-yellow-400' },
    danger: { bg: 'from-red-900/30 to-gray-800', border: 'border-red-500/30', button: 'bg-red-600 hover:bg-red-700', icon: 'text-red-400' },
    info: { bg: 'from-blue-900/30 to-gray-800', border: 'border-blue-500/30', button: 'bg-blue-600 hover:bg-blue-700', icon: 'text-blue-400' },
  };

  const style = colors[type] || colors.warning;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative bg-gradient-to-br ${style.bg} border ${style.border} rounded-lg shadow-2xl max-w-md w-full p-6`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center ${style.icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-300">{message}</p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${style.button} text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
