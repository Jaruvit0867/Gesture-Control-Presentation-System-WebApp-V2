import { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { PdfViewer } from './components/PdfViewer';
import { GestureCamera } from './components/GestureCamera';
import { SwipeIndicator } from './components/SwipeIndicator';
import RemoteQRCode from './components/RemoteQRCode';
import { useGesture } from './hooks/useGesture';
import { usePdfViewer } from './hooks/usePdfViewer';
import { useRemoteSession } from './hooks/useRemoteSession';
import { BackgroundParticles } from './components/BackgroundParticles';
import RemotePage from './pages/RemotePage';
import { Sparkles, Zap, Shield, Upload, Camera, Presentation } from 'lucide-react';

function MainApp() {
  const [swipeIndicator, setSwipeIndicator] = useState({ visible: false, direction: null });
  const [slideDirection, setSlideDirection] = useState('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerContainerRef = useRef(null);

  const {
    pageImage,
    currentPage,
    totalPages,
    isLoading: pdfLoading,
    error: pdfError,
    fileName,
    loadPdf,
    nextPage,
    prevPage,
  } = usePdfViewer();

  const handleSwipeLeft = useCallback(() => {
    setSlideDirection('prev');
    prevPage();
    setSwipeIndicator({ visible: true, direction: 'left' });
    setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
  }, [prevPage]);

  const handleSwipeRight = useCallback(() => {
    setSlideDirection('next');
    nextPage();
    setSwipeIndicator({ visible: true, direction: 'right' });
    setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
  }, [nextPage]);

  const handlePause = useCallback(() => {}, []);

  const handleRemoteCommand = useCallback((action) => {
    if (action === 'next') {
      setSlideDirection('next');
      nextPage();
      setSwipeIndicator({ visible: true, direction: 'right' });
      setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
    } else if (action === 'prev') {
      setSlideDirection('prev');
      prevPage();
      setSwipeIndicator({ visible: true, direction: 'left' });
      setTimeout(() => setSwipeIndicator({ visible: false, direction: null }), 800);
    }
  }, [nextPage, prevPage]);

  const {
    sessionId,
    isConnected: remoteIsConnected,
    remoteConnected,
    isEnabled: remoteEnabled,
    toggleRemoteMode,
  } = useRemoteSession({
    onCommand: handleRemoteCommand,
    currentPage,
    totalPages,
  });

  const {
    videoRef,
    isActive: cameraActive,
    gesture,
    pointer,
    error: cameraError,
    start: startCamera,
    stop: stopCamera,
  } = useGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPause: handlePause,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setSlideDirection('prev');
        prevPage();
      } else if (e.key === 'ArrowRight') {
        setSlideDirection('next');
        nextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage]);

  const handlePrevPage = useCallback(() => {
    setSlideDirection('prev');
    prevPage();
  }, [prevPage]);

  const handleNextPage = useCallback(() => {
    setSlideDirection('next');
    nextPage();
  }, [nextPage]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!viewerContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (viewerContainerRef.current.requestFullscreen) {
          await viewerContainerRef.current.requestFullscreen();
        } else if (viewerContainerRef.current.webkitRequestFullscreen) {
          await viewerContainerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error(`Error attempting to toggle fullscreen: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const features = [
    { step: '01', title: 'Upload PDF', desc: 'Drag and drop or click to upload your presentation. Supports all PDF formats.', icon: Upload, color: 'aurora-cyan' },
    { step: '02', title: 'Enable Camera', desc: 'Start your webcam for gesture detection. All processing stays on your device.', icon: Camera, color: 'aurora-purple' },
    { step: '03', title: 'Present!', desc: 'Control your slides with natural hand gestures. Swipe to navigate seamlessly.', icon: Presentation, color: 'aurora-pink' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      <BackgroundParticles />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-orb w-[600px] h-[600px] bg-aurora-cyan/20 -top-[20%] -left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="aurora-orb w-[500px] h-[500px] bg-aurora-purple/20 top-[30%] -right-[15%]" style={{ animationDelay: '5s' }} />
        <div className="aurora-orb w-[400px] h-[400px] bg-aurora-pink/15 -bottom-[10%] left-[20%]" style={{ animationDelay: '10s' }} />
      </div>

      <Header />

      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {!isFullscreen && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-16 pt-8">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-aurora-cyan/20 mb-8">
                <Sparkles className="w-4 h-4 text-aurora-cyan" />
                <span className="text-xs font-medium text-aurora-cyan uppercase tracking-wider">Powered by AI Vision</span>
              </motion.div>

              <h2 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                Control Slides with<br /><span className="gradient-text">Hand Gestures</span>
              </h2>

              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                Experience the future of presentations. Navigate your slides naturally with intuitive hand movements - no clicker needed.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { icon: Zap, label: 'Real-time Detection', color: 'aurora-cyan' },
                  { icon: Shield, label: '100% Private', color: 'aurora-emerald' },
                  { icon: Sparkles, label: 'AI-Powered', color: 'aurora-purple' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-dark-700/50">
                    <item.icon className={`w-4 h-4 text-${item.color}`} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div ref={viewerContainerRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className={`grid gap-8 transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-50 bg-dark-950 grid-cols-1 p-0 m-0' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div className={`transition-all duration-700 ease-out ${isFullscreen ? 'col-span-1 h-screen w-screen' : 'lg:col-span-2 glass rounded-3xl p-8 h-[680px] border border-dark-700/50'}`}>
              <PdfViewer pageImage={pageImage} currentPage={currentPage} totalPages={totalPages} isLoading={pdfLoading} error={pdfError} fileName={fileName}
                onFileSelect={loadPdf} onPrevPage={handlePrevPage} onNextPage={handleNextPage} slideDirection={slideDirection} isFullscreen={isFullscreen} onToggleFullscreen={handleToggleFullscreen} pointer={pointer} />
            </div>

            <div className={`transition-all duration-500 ${isFullscreen ? 'fixed bottom-6 right-6 w-72 z-[70]' : 'lg:col-span-1 space-y-6'}`}>
              <GestureCamera videoRef={videoRef} isActive={cameraActive} gesture={gesture} error={cameraError} onStart={startCamera} onStop={stopCamera} isMini={isFullscreen} />

              {!isFullscreen && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-4 border border-dark-700/50">
                  <RemoteQRCode sessionId={sessionId} isConnected={remoteIsConnected} remoteConnected={remoteConnected} isEnabled={remoteEnabled} onToggle={toggleRemoteMode} />
                </motion.div>
              )}

              {!isFullscreen && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6 border border-dark-700/50">
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-aurora-cyan/10 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-aurora-cyan" /></div>
                    Quick Tips
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {['Use arrow keys for manual control', 'Keep your hand within camera view', 'Make a fist to pause detection', 'Point with one finger for pointer mode'].map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan" /></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <SwipeIndicator direction={swipeIndicator.direction} isVisible={swipeIndicator.visible} />
          </motion.div>

          {!isFullscreen && (
            <motion.section id="how-it-works" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} className="mt-32">
              <div className="text-center mb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-aurora-purple/20 mb-6">
                  <span className="text-xs font-medium text-aurora-purple uppercase tracking-wider">Simple Setup</span>
                </motion.div>
                <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl font-bold text-white mb-4">How It Works</motion.h3>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Get started in seconds. Our AI-powered system translates your hand movements into seamless presentation controls.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }} className="group relative">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-${item.color}/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />
                    <div className="relative glass rounded-3xl p-8 border border-dark-700/50 group-hover:border-aurora-cyan/20 transition-all duration-500 h-full">
                      <span className="absolute top-6 right-8 font-mono text-6xl font-bold text-dark-700 group-hover:text-dark-600 transition-colors">{item.step}</span>
                      <div className={`relative w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-${item.color}/10 border border-${item.color}/20 group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon className={`w-8 h-8 text-${item.color}`} />
                      </div>
                      <h4 className="font-display font-bold text-white text-xl mb-3">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {!isFullscreen && (
        <footer className="relative z-10 py-16 border-t border-dark-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan to-aurora-purple flex items-center justify-center"><Presentation className="w-5 h-5 text-white" /></div>
                <div><p className="font-display font-bold text-white">GesturePresenter</p><p className="text-xs text-slate-500">AI-Powered Control</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Built with</span>
                  <div className="flex items-center gap-2">
                    {['React', 'MediaPipe', 'PDF.js'].map((tech, i) => (<span key={i} className="px-2 py-1 rounded-md bg-dark-800 border border-dark-700 text-slate-400">{tech}</span>))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500"><Shield className="w-4 h-4 text-aurora-emerald" /><span>100% Private - All processing happens locally</span></div>
            </div>
            <div className="mt-8 pt-8 border-t border-dark-800 text-center"><p className="text-xs text-slate-600">Designed with passion by Opus 4.5</p></div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/remote/:sessionId" element={<RemotePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
