import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '', hideClose = false, fullScreen = false }) => {
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 20, stiffness: 260 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.18 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 ${fullScreen ? '' : 'flex items-center justify-center p-6'} bg-black/60 backdrop-blur`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className={`glass-strong ${fullScreen ? 'rounded-none h-full w-full max-w-none' : 'rounded-2xl max-h-[90vh]'} w-full border-2 border-white/20 flex flex-col ${fullScreen ? '' : (className || 'max-w-lg')}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black/40 to-black/20 ${fullScreen ? '' : ''}`}>
              {title && <h3 className="text-lg font-western text-white">{title}</h3>}
              {!hideClose && <button onClick={onClose} className="btn-western px-3 py-1">✕</button>}
            </div>
            <div className={`text-white/90 ${fullScreen ? 'p-6 md:p-8 h-full overflow-y-auto' : 'p-6 overflow-y-auto max-h-[70vh]'} flex-1`}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
