import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wifi, WifiOff, Smartphone, Presentation, Loader2, AlertCircle } from 'lucide-react';
import { useRemoteController } from '../hooks/useRemoteSession';

const RemotePage = () => {
  const { sessionId } = useParams();
  const { isConnected, presenterConnected, currentPage, totalPages, sendCommand, connectionError } = useRemoteController(sessionId);
  const [lastAction, setLastAction] = useState(null);

  const triggerHaptic = (pattern = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: [10], medium: [20], heavy: [30], success: [10, 50, 10] };
      navigator.vibrate(patterns[pattern] || patterns.light);
    }
  };

  const handlePrev = () => {
    if (!presenterConnected) return;
    sendCommand('prev');
    setLastAction('prev');
    triggerHaptic('medium');
    setTimeout(() => setLastAction(null), 300);
  };

  const handleNext = () => {
    if (!presenterConnected) return;
    sendCommand('next');
    setLastAction('next');
    triggerHaptic('medium');
    setTimeout(() => setLastAction(null), 300);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (presenterConnected) triggerHaptic('success');
  }, [presenterConnected]);

  if (!isConnected && !connectionError) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-aurora-purple/30 border-t-aurora-purple mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-white/70 text-lg">Connecting...</p>
        <p className="text-white/40 text-sm mt-2">Session: {sessionId}</p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
        </motion.div>
        <p className="text-white text-lg font-medium mb-2">Connection Failed</p>
        <p className="text-white/50 text-sm text-center mb-6">{connectionError}</p>
        <button onClick={() => window.location.reload()} className="py-3 px-6 rounded-xl bg-aurora-purple text-white font-medium">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col select-none touch-none">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-aurora-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-aurora-cyan/15 rounded-full blur-[100px]" />
      </div>

      <motion.header
        className="relative z-10 p-4 flex items-center justify-between border-b border-white/5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-purple to-aurora-cyan flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Remote Control</p>
            <p className="text-white/40 text-xs">Session: {sessionId}</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-xs font-medium
          ${presenterConnected ? 'bg-aurora-cyan/10 text-aurora-cyan' : 'bg-amber-500/10 text-amber-400'}`}>
          {presenterConnected ? (
            <><Wifi className="w-3 h-3" /><span>Connected</span></>
          ) : (
            <><motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}><WifiOff className="w-3 h-3" /></motion.div><span>Waiting...</span></>
          )}
        </div>
      </motion.header>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6">
        <motion.div className="mb-8 text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Current Slide</p>
          <div className="flex items-baseline justify-center gap-1">
            <motion.span key={currentPage} className="text-5xl font-bold text-white" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {currentPage || '--'}
            </motion.span>
            <span className="text-2xl text-white/30">/</span>
            <span className="text-2xl text-white/50">{totalPages || '--'}</span>
          </div>
        </motion.div>

        <motion.div className="w-full max-w-md flex gap-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.button
            onClick={handlePrev}
            disabled={!presenterConnected || currentPage <= 1}
            className={`flex-1 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 font-semibold text-lg transition-all duration-200
              ${!presenterConnected || currentPage <= 1
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-gradient-to-br from-aurora-purple/30 to-aurora-purple/10 text-white border border-aurora-purple/30 active:scale-95 active:bg-aurora-purple/40'
              }`}
            whileTap={presenterConnected && currentPage > 1 ? { scale: 0.95 } : {}}
          >
            <motion.div animate={lastAction === 'prev' ? { x: [-5, 0] } : {}} transition={{ duration: 0.2 }}>
              <ChevronLeft className="w-10 h-10" />
            </motion.div>
            <span>Previous</span>
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={!presenterConnected || currentPage >= totalPages}
            className={`flex-1 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 font-semibold text-lg transition-all duration-200
              ${!presenterConnected || currentPage >= totalPages
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-gradient-to-br from-aurora-cyan/30 to-aurora-cyan/10 text-white border border-aurora-cyan/30 active:scale-95 active:bg-aurora-cyan/40'
              }`}
            whileTap={presenterConnected && currentPage < totalPages ? { scale: 0.95 } : {}}
          >
            <motion.div animate={lastAction === 'next' ? { x: [5, 0] } : {}} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-10 h-10" />
            </motion.div>
            <span>Next</span>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {lastAction && (
            <motion.div
              className={`fixed inset-0 pointer-events-none flex items-center justify-center ${lastAction === 'prev' ? 'bg-aurora-purple/10' : 'bg-aurora-cyan/10'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${lastAction === 'prev' ? 'bg-aurora-purple/30' : 'bg-aurora-cyan/30'}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {lastAction === 'prev' ? <ChevronLeft className="w-12 h-12 text-white" /> : <ChevronRight className="w-12 h-12 text-white" />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.footer
        className="relative z-10 p-4 text-center border-t border-white/5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {!presenterConnected ? (
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for presenter to connect...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <Presentation className="w-4 h-4" />
            <span>Connected to GesturePresenter</span>
          </div>
        )}
      </motion.footer>
    </div>
  );
};

export default RemotePage;
