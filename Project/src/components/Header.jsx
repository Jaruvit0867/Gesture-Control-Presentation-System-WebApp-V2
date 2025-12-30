import { motion } from 'framer-motion';
import { Presentation, Github, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-10 py-6 px-8"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-4 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-aurora-cyan/30 rounded-2xl blur-xl group-hover:bg-aurora-cyan/50 transition-all duration-500" />

            {/* Logo container */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-aurora-cyan via-neon-primary to-aurora-purple flex items-center justify-center shadow-neon group-hover:shadow-neon-cyan transition-all duration-500">
              {/* Inner glow */}
              <div className="absolute inset-[2px] rounded-[14px] bg-dark-900/40 backdrop-blur-sm" />
              <Presentation className="relative w-7 h-7 text-white drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
            </div>

            {/* Sparkle accent */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4 text-aurora-cyan" />
            </motion.div>
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight">
              <span className="text-white">Gesture</span>
              <span className="gradient-text">Presenter</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-pulse shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-aurora-cyan/80 font-bold">
                AI-Powered Control
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 md:gap-6">
          {/* Capabilities link */}
          <motion.a
            href="#how-it-works"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-aurora-cyan transition-all duration-300 relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Features</span>
            <div className="absolute inset-0 rounded-xl bg-aurora-cyan/0 group-hover:bg-aurora-cyan/10 transition-all duration-300" />
          </motion.a>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gradient-to-b from-transparent via-dark-600 to-transparent" />

          {/* GitHub button */}
          <motion.a
            href="https://github.com/Jaruvit0867/Gesture-Control-Presentation-System-WebApp-V2"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2.5 px-6 py-3 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background layers */}
            <div className="absolute inset-0 bg-dark-800 border border-dark-700 rounded-2xl group-hover:border-aurora-cyan/30 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan/0 via-aurora-cyan/5 to-aurora-purple/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Content */}
            <Github className="relative w-4 h-4 text-slate-400 group-hover:text-aurora-cyan transition-colors duration-300" />
            <span className="relative hidden sm:inline text-sm font-semibold text-slate-300 group-hover:text-white transition-colors duration-300">
              GitHub
            </span>

            {/* Star badge */}
            <div className="relative hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-700 group-hover:bg-aurora-cyan/20 transition-all duration-300">
              <svg className="w-3 h-3 text-aurora-cyan" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] font-bold text-aurora-cyan">Star</span>
            </div>
          </motion.a>
        </nav>
      </div>

      {/* Bottom border glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-aurora-cyan/30 to-transparent" />
      </div>
    </motion.header>
  );
}
