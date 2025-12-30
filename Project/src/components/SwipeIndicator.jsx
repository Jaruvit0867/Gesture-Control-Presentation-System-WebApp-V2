import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

export function SwipeIndicator({ direction, isVisible }) {
  const isLeft = direction === 'left';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          {/* Radial blur overlay */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{
              background: isLeft
                ? 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
                : 'radial-gradient(circle at 70% 50%, rgba(0, 245, 255, 0.15) 0%, transparent 50%)'
            }}
          />

          {/* Main indicator */}
          <motion.div
            initial={{
              x: isLeft ? -100 : 100,
              scale: 0.8,
              opacity: 0
            }}
            animate={{
              x: 0,
              scale: 1,
              opacity: 1
            }}
            exit={{
              x: isLeft ? 100 : -100,
              scale: 0.8,
              opacity: 0
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30
            }}
            className="relative"
          >
            {/* Outer glow */}
            <div className={`
              absolute -inset-4 rounded-[3rem] blur-2xl
              ${isLeft ? 'bg-aurora-purple/30' : 'bg-aurora-cyan/30'}
            `} />

            {/* Main container */}
            <div className={`
              relative flex items-center gap-5 px-10 py-6 rounded-[2.5rem]
              glass-strong border
              ${isLeft
                ? 'border-aurora-purple/30'
                : 'border-aurora-cyan/30'
              }
            `}>
              {/* Animated gradient background */}
              <div className={`
                absolute inset-0 rounded-[2.5rem] opacity-30
                ${isLeft
                  ? 'bg-gradient-to-r from-aurora-purple/20 to-transparent'
                  : 'bg-gradient-to-l from-aurora-cyan/20 to-transparent'
                }
              `} />

              {/* Left arrow */}
              {isLeft && (
                <motion.div
                  className="relative"
                  animate={{ x: [-5, 0, -5] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="absolute inset-0 bg-aurora-purple rounded-xl blur-md opacity-50" />
                  <div className="relative w-14 h-14 rounded-xl bg-aurora-purple/20 border border-aurora-purple/30 flex items-center justify-center">
                    <ArrowLeft className="w-8 h-8 text-aurora-purple drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                  </div>
                </motion.div>
              )}

              {/* Text */}
              <div className="relative text-center">
                <motion.span
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`
                    block text-4xl font-display font-black tracking-tight uppercase
                    ${isLeft ? 'text-aurora-purple' : 'text-aurora-cyan'}
                  `}
                  style={{
                    textShadow: isLeft
                      ? '0 0 30px rgba(139, 92, 246, 0.5)'
                      : '0 0 30px rgba(0, 245, 255, 0.5)'
                  }}
                >
                  {isLeft ? 'Previous' : 'Next'}
                </motion.span>
                <motion.span
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.5 }}
                  transition={{ delay: 0.15 }}
                  className="block text-xs font-medium text-slate-400 uppercase tracking-widest mt-1"
                >
                  Slide
                </motion.span>
              </div>

              {/* Right arrow */}
              {!isLeft && (
                <motion.div
                  className="relative"
                  animate={{ x: [5, 0, 5] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="absolute inset-0 bg-aurora-cyan rounded-xl blur-md opacity-50" />
                  <div className="relative w-14 h-14 rounded-xl bg-aurora-cyan/20 border border-aurora-cyan/30 flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-aurora-cyan drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
                  </div>
                </motion.div>
              )}

              {/* Motion trail effect */}
              <motion.div
                className={`
                  absolute inset-y-0 w-32
                  ${isLeft ? '-left-20' : '-right-20'}
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.4, repeat: 2 }}
              >
                <div className={`
                  h-full rounded-full blur-xl
                  ${isLeft
                    ? 'bg-gradient-to-r from-aurora-purple/40 to-transparent'
                    : 'bg-gradient-to-l from-aurora-cyan/40 to-transparent'
                  }
                `} />
              </motion.div>
            </div>

            {/* Particle burst effect */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`
                  absolute w-2 h-2 rounded-full
                  ${isLeft ? 'bg-aurora-purple' : 'bg-aurora-cyan'}
                `}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1
                }}
                animate={{
                  x: isLeft
                    ? -50 - Math.random() * 50
                    : 50 + Math.random() * 50,
                  y: (Math.random() - 0.5) * 100,
                  opacity: 0,
                  scale: 0
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
                style={{
                  top: '50%',
                  left: isLeft ? '20%' : '80%',
                  boxShadow: isLeft
                    ? '0 0 10px rgba(139, 92, 246, 0.8)'
                    : '0 0 10px rgba(0, 245, 255, 0.8)'
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
