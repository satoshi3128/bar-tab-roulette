'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/types';
import { UI_MESSAGES, LAYOUT } from '@/constants/roulette';

interface ResultModalProps {
  winner: Participant | null;
  onClose: () => void;
}

export function ResultModal({ winner, onClose }: ResultModalProps) {
  if (!winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
        style={{ zIndex: LAYOUT.Z_INDEX.MODAL }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300,
            duration: 0.6 
          }}
          className="p-8 rounded-2xl text-center max-w-md w-full mx-4 border-4 border-yellow-400 shadow-xl shadow-yellow-400/20"
          style={{ backgroundColor: `${winner.color}80` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Coin Rain Animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Falling Coins */}
            {[...Array(12)].map((_, index) => {
              const randomX = Math.random() * 100; // Random horizontal position (0-100%)
              const randomDelay = Math.random() * 2; // Random delay (0-2s)
              const randomDuration = 2 + Math.random() * 2; // Random duration (2-4s)
              const randomSize = Math.random() > 0.5 ? 'text-2xl' : 'text-3xl'; // Random size
              
              return (
                <motion.div
                  key={index}
                  className={`${randomSize} absolute`}
                  style={{
                    left: `${randomX}%`,
                  }}
                  initial={{
                    y: -50,
                    rotateY: 0,
                    opacity: 0
                  }}
                  animate={{
                    y: '110vh',
                    rotateY: [0, 180, 360, 540],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: randomDuration,
                    delay: randomDelay,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: Math.random() * 3
                  }}
                >
                  🪙
                </motion.div>
              );
            })}
          </motion.div>

          {/* Winner Announcement */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
          </motion.div>

          {/* Winner Display */}
          <motion.div
            initial={{ scale: 0, rotateZ: -180 }}
            animate={{ scale: 1, rotateZ: 0 }}
            transition={{ delay: 0.6, type: 'spring', damping: 10 }}
            className="mb-8"
          >
            <div 
              className="inline-block px-8 py-6 rounded-2xl border-4 border-yellow-400 shadow-lg"
              style={{ backgroundColor: winner.color + '80' }}
            >
              <div className="text-6xl mb-3">{winner.emoji}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-100">
                {winner.name}
              </div>
              <div className="text-lg text-amber-200 mt-2">
                {UI_MESSAGES.MODAL_MESSAGE}
              </div>
            </div>
          </motion.div>

          {/* Fun Messages */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
          </motion.div>

          {/* Close Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-8 py-3 bg-amber-700 text-amber-100 rounded-xl hover:bg-amber-600 transition-colors font-semibold text-lg shadow-lg"
          >
            もう一回やる
          </motion.button>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 text-amber-400 opacity-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              ⭐
            </motion.div>
          </div>
          <div className="absolute top-4 right-4 text-amber-400 opacity-50">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              ✨
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-4 text-amber-400 opacity-50">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎊
            </motion.div>
          </div>
          <div className="absolute bottom-4 right-4 text-amber-400 opacity-50">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              🎉
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}