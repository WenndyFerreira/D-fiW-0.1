import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-[#1A1A2E] text-white rounded-2xl shadow-2xl border border-gray-700/40 text-sm font-medium tracking-tight max-w-[90vw] pointer-events-none"
        >
          {type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#4CAF50] shrink-0" />}
          {type === 'error' && <AlertCircle className="w-4 h-4 text-[#EF5350] shrink-0" />}
          {type === 'info' && <Info className="w-4 h-4 text-[#42A5F5] shrink-0" />}
          <span className="truncate">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
