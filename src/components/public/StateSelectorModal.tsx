'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  ChevronRight, 
  Check, 
  Sparkles, 
  Award, 
  Scissors, 
  GraduationCap, 
  Globe, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface StateOption {
  code: 'SA' | 'WA' | 'ACT' | 'VIC';
  name: string;
  city: string;
  badge: string;
  perk: string;
  href: string;
  icon: React.ReactNode;
}

interface StateSelectorModalProps {
  initialOpen?: boolean;
}

const STATES: StateOption[] = [
  {
    code: 'SA',
    name: 'South Australia',
    city: 'Adelaide & Mawson Lakes',
    badge: 'Skills SA Funded Hub',
    perk: 'Mawson Lakes Campus • Subsidised Fees from $0.50/hr',
    href: '/south-australia',
    icon: <Award className="w-5 h-5 text-emerald-300" />
  },
  {
    code: 'WA',
    name: 'Western Australia',
    city: 'Perth & Regional WA',
    badge: 'Blended Distance Delivery',
    perk: 'Online Theory Flexibility + Local Workplace Practicums',
    href: '/western-australia',
    icon: <Globe className="w-5 h-5 text-emerald-300" />
  },
  {
    code: 'ACT',
    name: 'ACT (Canberra)',
    city: 'Canberra Delivery Hub',
    badge: 'User Choice Funded',
    perk: 'Canberra Hub • Interactive Evening Virtual Classes',
    href: '/act',
    icon: <GraduationCap className="w-5 h-5 text-emerald-300" />
  },
  {
    code: 'VIC',
    name: 'Victoria',
    city: 'Melbourne (Hawthorn & Coolaroo)',
    badge: 'Commercial Salon Campus',
    perk: 'Hawthorn Salon & Coolaroo • Victorian Apprenticeships',
    href: '/victoria',
    icon: <Scissors className="w-5 h-5 text-emerald-300" />
  }
];

export default function StateSelectorModal({ initialOpen = false }: StateSelectorModalProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If on /admin, always keep closed
    if (pathname?.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }

    // Check if user already picked a state in localStorage
    const savedState = localStorage.getItem('fca_selected_state');
    if (savedState) {
      setSelectedState(savedState);
    } else {
      // First visit - ensure modal is open
      setIsOpen(true);
    }
  }, [pathname]);

  // Listen for custom trigger to open modal from Navbar or anywhere, and handle Escape key
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('open-fca-state-modal', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-fca-state-modal', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectState = (state: StateOption) => {
    setSelectedState(state.code);
    try {
      localStorage.setItem('fca_selected_state', state.code);
      document.cookie = `fca_selected_state=${state.code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Storage access handle
    }
    setIsOpen(false);
    router.push(state.href);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Glassmorphism Backdrop with backdrop-blur-md */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          >
            {/* Luminous refraction ambient orbs */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-80 h-80 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>

          {/* Frosted Glass Dialog with Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ 
              type: 'spring',
              damping: 26,
              stiffness: 340,
              mass: 0.8
            }}
            className="relative w-full max-w-[500px] rounded-[32px] p-6 sm:p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.3),_inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Subtle 1px Top Light Beam */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

            {/* Specular Edge Gradient Overlay */}
            <div className="absolute inset-0 rounded-[32px] pointer-events-none border border-emerald-500/10" />

            {/* Close Button with Spring Micro-interaction */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900/5 hover:bg-slate-900/10 backdrop-blur-md border border-slate-900/10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Top Floating Badge */}
            <div className="flex justify-center mb-2">
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>RTO Provider # 6055 • Australia Wide</span>
              </motion.div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.h2 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center justify-center gap-2"
              >
                <span>Choose Your State</span>
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium max-w-sm mx-auto leading-relaxed"
              >
                Select your location to continue and explore campus facilities & subsidised fees.
              </motion.p>
            </div>

            {/* Animated State Options List with Staggered Entrance */}
            <div className="space-y-3">
              {STATES.map((state, index) => {
                const isCurrent = selectedState === state.code;
                return (
                  <motion.button
                    key={state.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.1 + index * 0.04,
                      type: 'spring',
                      stiffness: 350,
                      damping: 25
                    }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectState(state)}
                    className="w-full text-left relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-r from-[#072418]/95 via-[#092d1f]/95 to-[#0d3b28]/95 backdrop-blur-md border border-white/20 hover:border-emerald-400/70 shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_12px_35px_rgba(7,36,24,0.32)] transition-all group cursor-pointer"
                  >
                    {/* Glass Sheen Shimmer Reflection */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 pointer-events-none" />

                    <div className="flex items-center justify-between gap-3 relative z-10">
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40 transition-all">
                          {state.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base sm:text-lg text-white group-hover:text-emerald-200 transition-colors">
                              {state.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300">
                              {state.badge}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-100/75 truncate mt-0.5 font-normal">
                            {state.perk}
                          </p>
                        </div>
                      </div>

                      {/* Right: Arrow Pill or Checkmark */}
                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-emerald-200 group-hover:bg-emerald-400 group-hover:text-slate-950 group-hover:translate-x-1 transition-all">
                            <ArrowRight className="w-4 h-4 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Bottom Helper Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-slate-200/60 text-center"
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  localStorage.setItem('fca_selected_state', 'ALL');
                  document.cookie = `fca_selected_state=ALL; path=/; max-age=31536000; SameSite=Lax`;
                }}
                className="text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Continue to National Academy Overview</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
