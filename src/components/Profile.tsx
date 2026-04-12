import React, { useRef } from 'react';
import {
  User, Settings, LogOut, ChevronRight,
  Shield, Bell, Moon, CreditCard, HelpCircle, Trophy
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

const SETTINGS_ITEMS = [
  { icon: User, label: 'Personal Information', color: '#00eefc' },
  { icon: Bell, label: 'Notifications', color: '#cafd00' },
  { icon: Shield, label: 'Privacy & Security', color: '#ffeea5' },
  { icon: Moon, label: 'Appearance', color: '#adaaaa' },
  { icon: CreditCard, label: 'Subscription', color: '#00eefc' },
  { icon: HelpCircle, label: 'Support & Help', color: '#adaaaa' },
];

const STATS = [
  { label: 'Workouts', value: '42', color: '#cafd00' },
  { label: 'Day Streak', value: '12', color: '#ffeea5' },
  { label: "PR's Hit", value: '8', color: '#00eefc' },
];

export const Profile: React.FC = () => {
  const { user } = useAppStore();
  const shouldReduce = useReducedMotion();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">

      {/* ─── Header ───────────────────────────────────────────── */}
      <RevealSection>
        <div>
          <p className="text-[#adaaaa] text-[10px] font-bold uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Profile
          </h1>
        </div>
      </RevealSection>

      {/* ─── Avatar + Info ────────────────────────────────────── */}
      <RevealSection delay={0.05}>
        <div className="bg-[#1a1a1a] rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with lime glow border */}
          <div className="relative shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-24 h-24 rounded-xl overflow-hidden"
              style={{ boxShadow: '0 0 0 2px #cafd00, 0 0 20px rgba(202,253,0,0.2)' }}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#cafd00] flex items-center justify-center">
                  <span className="font-headline font-black text-2xl text-[#0e0e0e]">{initials}</span>
                </div>
              )}
            </motion.div>
            {/* Settings badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#20201f] rounded-lg border border-border flex items-center justify-center cursor-pointer hover:bg-[#262626] transition-colors">
              <Settings className="w-3.5 h-3.5 text-[#adaaaa]" />
            </div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              {user?.displayName || 'Krish Pandya'}
            </h2>
            <p className="text-[#adaaaa] text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#cafd00]/10 text-[#cafd00] border border-[#cafd00]/20">
                PRO Plan
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#20201f] text-[#adaaaa]">
                Level 12
              </span>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ─── Stats Bento ──────────────────────────────────────── */}
      <RevealSection delay={0.1}>
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.15 }}
              whileHover={{ y: -3 }}
              className="bg-[#1a1a1a] p-5 rounded-xl text-center"
            >
              <p
                className="text-3xl font-headline font-black"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ─── Settings List ────────────────────────────────────── */}
      <RevealSection delay={0.15}>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-4">Account Settings</h3>

          {/* No dividers — 16px vertical gap */}
          <div className="space-y-4">
            {SETTINGS_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={shouldReduce ? {} : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.2 }}
                  whileHover={{ x: 4 }}
                  className="bg-[#20201f] p-4 rounded-xl flex items-center justify-between cursor-pointer group hover:bg-[#262626] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: item.color, width: '1.1rem', height: '1.1rem' }} />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-[#cafd00] transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline-variant group-hover:text-[#cafd00] transition-colors" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      {/* ─── Sign Out ─────────────────────────────────────────── */}
      <RevealSection delay={0.2}>
        <motion.button
          id="sign-out-btn"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="w-full py-4 border border-[#ff7351]/20 text-[#ff7351] font-headline font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#ff7351]/5 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </RevealSection>
    </div>
  );
};
