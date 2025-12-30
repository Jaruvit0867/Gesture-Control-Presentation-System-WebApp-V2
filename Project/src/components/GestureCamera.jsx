import { useState, useEffect } from 'react';
import { Camera, CameraOff, Hand, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gestureInfo = {
  WAITING: { label: 'Awaiting Signal', color: 'text-slate-400', bgColor: 'bg-slate-500/10', icon: '⏳', status: 'idle' },
  SCANNING: { label: 'Scanning...', color: 'text-aurora-cyan', bgColor: 'bg-aurora-cyan/10', icon: '👁️', status: 'scanning' },
  PAUSED: { label: 'Paused', color: 'text-aurora-pink', bgColor: 'bg-aurora-pink/10', icon: '✊', status: 'paused' },
  SWIPE_READY: { label: 'Ready', color: 'text-aurora-emerald', bgColor: 'bg-aurora-emerald/10', icon: '🖐️', status: 'ready' },
  SWIPE_LEFT: { label: 'Previous', color: 'text-aurora-purple', bgColor: 'bg-aurora-purple/10', icon: '👈', status: 'action' },
  SWIPE_RIGHT: { label: 'Next', color: 'text-aurora-purple', bgColor: 'bg-aurora-purple/10', icon: '👉', status: 'action' },
  READY: { label: 'Pointer Active', color: 'text-aurora-cyan', bgColor: 'bg-aurora-cyan/10', icon: '☝️', status: 'active' },
  STABILIZING: { label: 'Stabilizing', color: 'text-aurora-pink', bgColor: 'bg-aurora-pink/10', icon: '✊', status: 'paused' },
};

const gestureGuide = [
  { icon: '✊', label: 'Pause', desc: 'Make a fist', color: 'aurora-pink' },
  { icon: '☝️', label: 'Point', desc: 'Index finger', color: 'aurora-cyan' },
  { icon: '🖐️', label: 'Ready', desc: 'Open palm', color: 'aurora-emerald' },
  { icon: '👋', label: 'Swipe', desc: 'Wave motion', color: 'aurora-purple' },
];

export function GestureCamera({
  videoRef,
  isActive,
  gesture,
  error,
  onStart,
  onStop,
  isMini = false
}) {
  const [displayGesture, setDisplayGesture] = useState(gesture);

  // Debounce the SCANNING state to avoid flickering
  useEffect(() => {
    if (gesture.name !== 'SCANNING') {
      setDisplayGesture(gesture);
      return;
    }

    if (displayGesture.name !== 'SCANNING') {
      const timer = setTimeout(() => {
        setDisplayGesture(prev => prev.name === 'SCANNING' ? prev : gesture);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDisplayGesture(gesture);
    }
  }, [gesture.name, gesture, displayGesture.name]);

  const info = gestureInfo[displayGesture.name] || gestureInfo.WAITING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden
        ${isMini
          ? 'rounded-2xl opacity-90 hover:opacity-100 transition-all duration-300'
          : 'glass rounded-3xl p-6 border border-dark-700/50'
        }
      `}
    >
      {/* Background glow effect */}
      {!isMini && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-1000 ${
            isActive ? 'bg-aurora-cyan/20' : 'bg-transparent'
          }`} />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        {!isMini && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Icon container */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-xl blur-md transition-all duration-500 ${
                  isActive ? 'bg-aurora-cyan/40' : 'bg-transparent'
                }`} />
                <div className="relative w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <Hand className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-aurora-cyan' : 'text-slate-500'
                  }`} />
                </div>
              </div>

              <div>
                <span className="font-display font-bold text-white text-sm">Gesture Control</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-aurora-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-slate-600'
                  }`} />
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    isActive ? 'text-aurora-emerald' : 'text-slate-500'
                  }`}>
                    {isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle button */}
            <motion.button
              onClick={isActive ? onStop : onStart}
              className="relative overflow-hidden rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider
                transition-all duration-300 border
                ${isActive
                  ? 'bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20 hover:bg-aurora-pink/20'
                  : 'bg-aurora-cyan/10 text-aurora-cyan border-aurora-cyan/20 hover:bg-aurora-cyan/20'
                }
              `}>
                {isActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Disable</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Enable</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        )}

        {/* Video container */}
        <div className={`
          relative overflow-hidden
          ${isMini
            ? 'aspect-video rounded-xl'
            : 'aspect-video rounded-2xl border border-dark-700/50'
          }
        `}>
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`
              w-full h-full object-cover camera-mirror
              ${!isActive && 'hidden'}
            `}
            style={{
              filter: 'contrast(1.05) saturate(0.9)',
            }}
          />

          {/* Scan line overlay when active */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora-cyan/50 to-transparent"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}

          {/* Corner brackets */}
          {isActive && !isMini && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-aurora-cyan/50 rounded-tl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-aurora-cyan/50 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-aurora-cyan/50 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-aurora-cyan/50 rounded-br" />
            </>
          )}

          {/* Placeholder when inactive */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900">
              {/* Grid pattern */}
              <div className="absolute inset-0 cyber-grid opacity-30" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Camera Offline</p>
                <p className="text-xs text-slate-600 mt-1">Click enable to start</p>
              </motion.div>
            </div>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-dark-900/95 backdrop-blur-sm"
              >
                <div className="text-center p-6 max-w-[200px]">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-aurora-pink/10 flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <p className="text-aurora-pink font-bold text-sm mb-1">Access Denied</p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Camera permission required for gesture detection
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gesture indicator overlay */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute left-2 right-2 ${isMini ? 'bottom-2' : 'bottom-3'}`}
              >
                <div className={`
                  glass-strong rounded-xl flex items-center justify-between
                  ${isMini ? 'px-2 py-1.5' : 'px-4 py-3'}
                `}>
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    {/* Gesture icon */}
                    <motion.div
                      key={displayGesture.name}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`
                        ${info.bgColor} rounded-lg flex items-center justify-center
                        ${isMini ? 'w-8 h-8 text-base' : 'w-12 h-12 text-2xl'}
                      `}
                    >
                      {info.icon}
                    </motion.div>

                    {/* Label */}
                    <div>
                      <motion.p
                        key={info.label}
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`font-bold ${info.color} ${isMini ? 'text-[10px]' : 'text-sm'} uppercase tracking-wide`}
                      >
                        {info.label}
                      </motion.p>
                      {!isMini && (
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
                          {info.status === 'active' ? 'Tracking enabled' :
                           info.status === 'ready' ? 'Swipe to navigate' :
                           info.status === 'paused' ? 'Detection paused' :
                           'Waiting for hand'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confidence meter */}
                  {displayGesture.confidence > 0 && !isMini && (
                    <div className="flex items-center gap-2">
                      {/* Circular progress */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-dark-700"
                          />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            className="text-aurora-cyan"
                            strokeDasharray={126}
                            initial={{ strokeDashoffset: 126 }}
                            animate={{ strokeDashoffset: 126 - (126 * displayGesture.confidence) }}
                            transition={{ duration: 0.3 }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-aurora-cyan">
                          {Math.round(displayGesture.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gesture guide */}
        {!isMini && (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {gestureGuide.map((item, i) => (
              <motion.div
                key={i}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="bg-dark-800/60 rounded-xl p-3 text-center border border-dark-700/50 group-hover:border-aurora-cyan/30 transition-all duration-300">
                  {/* Icon */}
                  <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  {/* Label */}
                  <p className="text-[10px] font-bold text-white uppercase tracking-tight">
                    {item.label}
                  </p>
                  {/* Description */}
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
