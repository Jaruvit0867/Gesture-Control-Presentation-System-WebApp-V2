import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Wifi, WifiOff, QrCode, Check, Copy } from 'lucide-react';

const RemoteQRCode = ({
  sessionId,
  isConnected,
  remoteConnected,
  isEnabled,
  onToggle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const remoteUrl = sessionId ? `${window.location.origin}/remote/${sessionId}` : '';

  const handleCopyUrl = async () => {
    if (!remoteUrl) return;
    try {
      await navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggle = () => {
    if (isEnabled) setIsModalOpen(false);
    onToggle();
  };

  return (
    <>
      <motion.button
        onClick={() => {
          if (!isEnabled) onToggle();
          setIsModalOpen(true);
        }}
        className={`
          relative w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3
          font-medium text-sm transition-all duration-300
          ${isEnabled
            ? remoteConnected
              ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
              : 'bg-aurora-purple/20 text-aurora-purple border border-aurora-purple/30'
            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Smartphone className="w-4 h-4" />
        <span>
          {isEnabled
            ? remoteConnected ? 'Remote Connected' : 'Waiting for Remote...'
            : 'Remote Control'
          }
        </span>
        {isEnabled && (
          <motion.span
            className={`absolute right-3 w-2 h-2 rounded-full ${remoteConnected ? 'bg-aurora-cyan' : 'bg-aurora-purple'}`}
            animate={{
              scale: remoteConnected ? [1, 1.2, 1] : [1, 1.5, 1],
              opacity: remoteConnected ? 1 : [1, 0.5, 1],
            }}
            transition={{ duration: remoteConnected ? 2 : 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setIsModalOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="relative z-10 rounded-3xl p-8 max-w-md w-full border border-white/20 bg-dark-950/95 backdrop-blur-xl shadow-2xl shadow-aurora-purple/20"
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 40 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-8">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-purple to-aurora-cyan mb-4"
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(139, 92, 246, 0.5)',
                        '0 0 50px rgba(0, 245, 255, 0.5)',
                        '0 0 30px rgba(139, 92, 246, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <QrCode className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mobile Remote</h3>
                  <p className="text-base text-white/60">Scan to control your presentation</p>
                </div>

                <div className={`
                  flex items-center justify-center gap-2 py-2 px-4 rounded-lg mb-4
                  ${isConnected
                    ? remoteConnected
                      ? 'bg-aurora-cyan/10 text-aurora-cyan'
                      : 'bg-aurora-purple/10 text-aurora-purple'
                    : 'bg-red-500/10 text-red-400'
                  }
                `}>
                  {isConnected ? (
                    remoteConnected ? (
                      <>
                        <Wifi className="w-4 h-4" />
                        <span className="text-sm font-medium">Remote Connected</span>
                      </>
                    ) : (
                      <>
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          <Wifi className="w-4 h-4" />
                        </motion.div>
                        <span className="text-sm font-medium">Waiting for connection...</span>
                      </>
                    )
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span className="text-sm font-medium">Connecting...</span>
                    </>
                  )}
                </div>

                {isEnabled && sessionId ? (
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="p-5 bg-white rounded-2xl mb-6 shadow-lg shadow-white/10"
                      initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                      transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                    >
                      <QRCodeSVG value={remoteUrl} size={200} level="H" bgColor="#ffffff" fgColor="#030014" />
                    </motion.div>

                    <div className="text-center mb-6">
                      <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Session ID</p>
                      <p className="text-2xl font-mono font-bold text-white tracking-[0.3em]">{sessionId}</p>
                    </div>

                    <motion.button
                      onClick={handleCopyUrl}
                      className={`
                        flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300
                        ${copied ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10'}
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? <><Check className="w-4 h-4" /><span>Copied!</span></> : <><Copy className="w-4 h-4" /><span>Copy URL</span></>}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <motion.div
                      className="w-16 h-16 rounded-full border-4 border-aurora-purple/30 border-t-aurora-purple"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-sm text-white/50 mt-4">Starting session...</p>
                  </div>
                )}

                <motion.button
                  onClick={handleToggle}
                  className={`
                    w-full mt-6 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300
                    ${isEnabled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-gradient-to-r from-aurora-purple to-aurora-cyan text-white shadow-lg shadow-aurora-purple/30'
                    }
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isEnabled ? 'Disable Remote Control' : 'Enable Remote Control'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default RemoteQRCode;
