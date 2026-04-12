import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, Home, Utensils, Dumbbell, User, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Utensils, label: 'Nutrition', path: '/nutrition' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, alerts } = useAppStore();
  const location = useLocation();
  const shouldReduce = useReducedMotion();
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-sans selection:bg-[#cafd00]/20">

      <header className="fixed top-0 z-50 w-full glass-panel border-b border-white/6">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-headline font-black italic text-xl text-[#cafd00] uppercase tracking-tighter group-hover:text-neon-glow transition-all duration-300">
              GymPilot AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {unreadAlerts > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-2 bg-[#20201f] px-3 py-1.5 rounded-lg border-l-2 border-[#cafd00]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#cafd00] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {unreadAlerts} Alert{unreadAlerts > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[#adaaaa]" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#cafd00] text-[#0e0e0e] text-[9px] font-black flex items-center justify-center rounded-full">
                  {unreadAlerts}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <nav className="fixed left-0 top-[61px] bottom-0 w-64 border-r border-white/6 bg-[#1a1a1a] hidden lg:flex flex-col py-8 z-40">
        <div className="px-6 mb-8">
          <p className="text-[10px] text-[#adaaaa] uppercase tracking-[0.2em] font-bold">Elite Performance</p>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item, i) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={shouldReduce ? {} : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg font-headline font-bold text-sm uppercase tracking-widest transition-all duration-200 relative group',
                    isActive
                      ? 'text-[#cafd00] bg-[#20201f] border-l-4 border-[#cafd00] pl-3'
                      : 'text-[#adaaaa] hover:text-white hover:bg-[#20201f] hover:translate-x-1'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'stroke-[2.5px]')} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#cafd00]"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {user && (
          <div className="px-6 mt-auto pt-6 border-t border-white/6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#cafd00] flex items-center justify-center text-[#0e0e0e] font-headline font-black text-sm">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{user.displayName || 'Athlete'}</p>
                <p className="text-[10px] text-[#adaaaa] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="lg:ml-64 pt-[61px] pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/6 shadow-[0_-4px_24px_rgba(202,253,0,0.06)]">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 min-w-[60px] py-1"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200',
                    isActive ? 'bg-[#cafd00] text-[#0e0e0e]' : 'text-[#adaaaa]'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      <motion.button
        id="fab-add-log"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="lg:hidden fixed bottom-20 right-5 w-14 h-14 bg-[#cafd00] text-[#0e0e0e] rounded-full flex items-center justify-center shadow-neon-lime z-40 cursor-pointer"
        aria-label="Quick log"
      >
        <Plus className="w-7 h-7 stroke-[2.5px]" />
      </motion.button>
    </div>
  );
};
