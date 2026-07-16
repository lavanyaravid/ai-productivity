import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full ${maxWidth} bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-100 dark:border-ink-800 max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800 sticky top-0 bg-white dark:bg-ink-900 z-10">
              <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-paper-50">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-paper-50 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
