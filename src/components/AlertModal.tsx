import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, FileText, UserPlus, X } from 'lucide-react';

interface DialogInfo {
  isOpen: boolean;
  type: 'terms' | 'no_account' | 'warning' | 'info';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
}

interface AlertModalProps {
  dialog: DialogInfo;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ dialog, onClose }) => {
  if (!dialog.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center">
            {dialog.type === 'terms' ? (
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3.5 shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
            ) : dialog.type === 'no_account' ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3.5 shadow-xs">
                <UserPlus className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3.5 shadow-xs">
                <AlertCircle className="w-7 h-7" />
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {dialog.message}
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              {dialog.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    if (dialog.onAction) dialog.onAction();
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {dialog.actionText}
                </button>
              )}

              {dialog.secondaryText ? (
                <button
                  type="button"
                  onClick={() => {
                    if (dialog.onSecondary) dialog.onSecondary();
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {dialog.secondaryText}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 text-gray-500 hover:text-gray-700 text-xs font-medium transition-all cursor-pointer"
                >
                  Entendi
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
