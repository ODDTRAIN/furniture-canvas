import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function PageTransition() {
  const { isPageTransition } = useStore();

  return (
    <AnimatePresence>
      {isPageTransition && (
        <motion.div
          key="page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Apple-style Bezier
          className="fixed inset-0 z-[9999] bg-[#111111] flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            {/* 텍스트 애니메이션: 아래에서 위로 살짝 떠오름 */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight font-sans">
                ZONE 2 : ATELIER
              </h2>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.4, duration: 0.8, ease: "circOut" }}
                className="h-[1px] bg-white/30 mt-4 mx-auto"
              />
              <p className="text-white/50 text-xs md:text-sm tracking-[0.3em] mt-3 uppercase font-medium">
                Loading Workspace
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}