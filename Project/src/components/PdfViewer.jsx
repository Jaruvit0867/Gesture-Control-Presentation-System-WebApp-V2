import { useCallback, useRef, memo } from 'react';
import { Upload, ChevronLeft, ChevronRight, FileText, Loader2, Maximize2, Minimize2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Separate component for the pointer to isolate re-renders
const VisualPointer = memo(({ pointer }) => {
  if (!pointer?.isActive) return null;

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${pointer.x * 100}%`,
        top: `${pointer.y * 100}%`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-4 bg-aurora-pink/20 rounded-full blur-xl animate-pulse" />

      {/* Main pointer */}
      <div
        className="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-aurora-pink rounded-full blur-md opacity-60" />

        {/* Core */}
        <div className="absolute inset-1 bg-gradient-to-br from-aurora-pink to-aurora-purple rounded-full border-2 border-white/50 shadow-neon-pink" />

        {/* Center dot */}
        <div className="absolute inset-[10px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

        {/* Ripple effect */}
        <div className="absolute inset-0 bg-aurora-pink/30 rounded-full animate-ping" />
      </div>
    </motion.div>
  );
});

// Component for the PDF image itself to isolate it from pointer updates
const SlideArea = memo(({ pageImage, currentPage, slideDirection }) => {
  return (
    <AnimatePresence mode="wait">
      {pageImage && (
        <motion.div
          key={currentPage}
          initial={{
            opacity: 0,
            x: slideDirection === 'next' ? 120 : -120,
            scale: 0.95,
            filter: 'blur(10px)'
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            filter: 'blur(0px)'
          }}
          exit={{
            opacity: 0,
            x: slideDirection === 'next' ? -120 : 120,
            scale: 0.95,
            filter: 'blur(10px)'
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 25
          }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          {/* Slide glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-aurora-purple/5 via-transparent to-aurora-cyan/5 pointer-events-none" />

          <img
            src={pageImage}
            alt={`Page ${currentPage}`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_1px_rgba(99,102,241,0.3)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export const PdfViewer = memo(({
  pageImage,
  currentPage,
  totalPages,
  isLoading,
  error,
  fileName,
  onFileSelect,
  onPrevPage,
  onNextPage,
  slideDirection,
  isFullscreen,
  onToggleFullscreen,
  pointer,
}) => {
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with file info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          {/* Icon with glow */}
          <div className="relative group">
            <div className="absolute inset-0 bg-neon-primary/30 rounded-2xl blur-lg group-hover:bg-aurora-cyan/40 transition-all duration-500" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 flex items-center justify-center overflow-hidden">
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-aurora-cyan/10 via-transparent to-transparent opacity-50" />
              <FileText className="w-6 h-6 text-aurora-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-white tracking-tight text-lg">
              {fileName || 'Document Viewer'}
            </h2>
            {totalPages > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-emerald animate-pulse" />
                <p className="text-xs text-aurora-emerald font-medium uppercase tracking-wider">
                  {totalPages} {totalPages === 1 ? 'Slide' : 'Slides'} Ready
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Fullscreen button */}
          <motion.button
            onClick={onToggleFullscreen}
            className="relative p-3.5 rounded-xl group overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <div className="absolute inset-0 bg-dark-800 border border-dark-700 rounded-xl group-hover:border-aurora-cyan/30 transition-all duration-300" />
            <div className="absolute inset-0 bg-aurora-cyan/0 group-hover:bg-aurora-cyan/10 transition-all duration-300" />
            {isFullscreen ? (
              <Minimize2 className="relative w-5 h-5 text-slate-400 group-hover:text-aurora-cyan transition-colors" />
            ) : (
              <Maximize2 className="relative w-5 h-5 text-slate-400 group-hover:text-aurora-cyan transition-colors" />
            )}
          </motion.button>

          {/* Upload button */}
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <motion.div
              className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button background */}
              <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan via-neon-primary to-aurora-purple opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>

              {/* Content */}
              <Upload className="relative w-4 h-4 text-white" />
              <span className="relative text-sm font-bold text-white">Upload PDF</span>
            </motion.div>
          </label>
        </div>
      </motion.div>

      {/* Main viewer area */}
      <div
        className={`
          flex-1 relative overflow-hidden
          ${isFullscreen
            ? 'rounded-none border-none h-full w-full bg-dark-950'
            : 'rounded-[2rem] bg-dark-950 border border-dark-700/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Corner accents */}
        {!isFullscreen && (
          <>
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-aurora-cyan/30 rounded-tl-[2rem]" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-aurora-purple/30 rounded-tr-[2rem]" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-aurora-purple/30 rounded-bl-[2rem]" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-aurora-cyan/30 rounded-br-[2rem]" />
          </>
        )}

        <div className="absolute inset-0">
          {/* Visual Pointer Overlay */}
          <VisualPointer pointer={pointer} />

          {/* Loading state */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-dark-950/95 backdrop-blur-md z-20"
              >
                <div className="text-center">
                  {/* Animated loader */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dark-700" />
                    {/* Spinning gradient ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-aurora-cyan border-r-aurora-purple animate-spin" />
                    {/* Inner glow */}
                    <div className="absolute inset-2 rounded-full bg-aurora-cyan/10 animate-pulse" />
                    {/* Center icon */}
                    <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-aurora-cyan animate-spin" />
                  </div>
                  <p className="text-slate-300 font-medium">Processing Document</p>
                  <p className="text-slate-500 text-sm mt-1">Optimizing slides...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center bg-dark-950/95 backdrop-blur-md"
              >
                <div className="text-center p-8 glass-aurora rounded-3xl max-w-sm border border-aurora-pink/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-aurora-pink/10 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <p className="text-aurora-pink font-bold text-lg mb-2">Process Failed</p>
                  <p className="text-slate-400 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state - drop zone */}
          {!pageImage && !isLoading && !error && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative group cursor-pointer">
                {/* Animated border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-aurora-cyan via-neon-primary to-aurora-purple rounded-[3rem] opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500 animate-gradient-x bg-aurora" />

                <div className="relative text-center p-16 glass rounded-[3rem] border border-dark-700/50 group-hover:border-aurora-cyan/30 transition-all duration-500">
                  {/* Upload icon */}
                  <motion.div
                    className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-dark-800 border border-dark-700 flex items-center justify-center relative overflow-hidden"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Holographic effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-transparent to-aurora-purple/10 group-hover:opacity-100 opacity-50 transition-opacity" />
                    <Upload className="w-14 h-14 text-slate-500 group-hover:text-aurora-cyan transition-colors duration-500" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    Drop Your Presentation
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-[240px] mx-auto leading-relaxed">
                    Drag & drop your PDF or click to browse. Your slides will be ready instantly.
                  </p>

                  {/* Feature badges */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {['PDF Support', 'Instant Load', 'HD Quality'].map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-dark-800/80 border border-dark-700 text-[10px] uppercase tracking-wider text-slate-500"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PDF Page display */}
          <SlideArea
            pageImage={pageImage}
            currentPage={currentPage}
            slideDirection={slideDirection}
          />
        </div>
      </div>

      {/* Navigation controls */}
      <AnimatePresence>
        {totalPages > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`
              flex items-center justify-center gap-4 mt-6
              ${isFullscreen
                ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]'
                : ''
              }
            `}
          >
            <div className="flex items-center gap-3 p-2 glass-strong rounded-2xl border border-dark-700/50">
              {/* Previous button */}
              <motion.button
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                className={`
                  relative p-4 rounded-xl overflow-hidden group
                  ${currentPage <= 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
              >
                <div className="absolute inset-0 bg-dark-800 rounded-xl border border-dark-700 group-hover:border-aurora-cyan/30 transition-all" />
                <div className="absolute inset-0 bg-aurora-cyan/0 group-hover:bg-aurora-cyan/10 transition-all" />
                <ChevronLeft className="relative w-6 h-6 text-white" />
              </motion.button>

              {/* Page indicator */}
              <div className="flex items-center gap-3 px-6 py-3 bg-dark-900/80 rounded-xl border border-dark-700/50">
                <span className="font-mono font-black text-2xl text-aurora-cyan drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">
                  {String(currentPage).padStart(2, '0')}
                </span>
                <div className="w-px h-6 bg-dark-600" />
                <span className="font-mono font-medium text-lg text-slate-500">
                  {String(totalPages).padStart(2, '0')}
                </span>
              </div>

              {/* Next button */}
              <motion.button
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                className={`
                  relative p-4 rounded-xl overflow-hidden group
                  ${currentPage >= totalPages
                    ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
                whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
              >
                <div className="absolute inset-0 bg-dark-800 rounded-xl border border-dark-700 group-hover:border-aurora-cyan/30 transition-all" />
                <div className="absolute inset-0 bg-aurora-cyan/0 group-hover:bg-aurora-cyan/10 transition-all" />
                <ChevronRight className="relative w-6 h-6 text-white" />
              </motion.button>

              {/* Exit fullscreen button (only in fullscreen) */}
              {isFullscreen && (
                <>
                  <div className="w-px h-8 bg-dark-600 mx-1" />
                  <motion.button
                    onClick={onToggleFullscreen}
                    className="relative p-4 rounded-xl overflow-hidden group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="absolute inset-0 bg-white rounded-xl" />
                    <Minimize2 className="relative w-6 h-6 text-dark-900" />
                  </motion.button>
                </>
              )}
            </div>

            {/* Keyboard hint */}
            {!isFullscreen && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
                <Zap className="w-3 h-3" />
                <span>Use arrow keys</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
