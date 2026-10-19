import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NutritionLog } from './components/NutritionLog';
import { WorkoutLog } from './components/WorkoutLog';
import { Profile } from './components/Profile';
import { Onboarding } from './components/Onboarding';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

const TOASTER_STYLE = {
  style: {
    background: '#1a1a1a',
    border: '1px solid rgba(202,253,0,0.2)',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
  },
};

const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const { user, setUser, setIsLoading, isLoading } = useAppStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              display_name: firebaseUser.displayName ?? undefined,
              photo_url: firebaseUser.photoURL ?? undefined,
              onboarded: false,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setUser({
              ...data.profile,
              uid: data.uid,
              email: data.email,
              displayName: data.display_name,
              photoURL: data.photo_url,
              onboarded: data.onboarded,
              createdAt: data.profile?.createdAt ?? Date.now(),
              updatedAt: data.profile?.updatedAt ?? Date.now(),
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Athlete',
              photoURL: firebaseUser.photoURL || undefined,
              onboarded: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        } catch (err) {
          console.error('Profile sync failed:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Athlete',
            photoURL: firebaseUser.photoURL || undefined,
            onboarded: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [setUser, setIsLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-16 h-16">
            <svg className="w-full h-full biometric-ring" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="transparent" stroke="#20201f" strokeWidth="4" />
              <motion.circle
                cx="30" cy="30" r="26"
                fill="transparent"
                stroke="#cafd00"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="163.4"
                initial={{ strokeDashoffset: 163.4 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#cafd00] animate-pulse-neon" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-headline font-black text-xl italic uppercase tracking-tighter text-[#cafd00]">
              GymPilot AI
            </p>
            <p className="text-[#adaaaa] text-xs uppercase tracking-[0.2em] font-bold">
              Calibrating your protocol...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex relative overflow-hidden">
        <Toaster position="top-right" theme="dark" richColors toastOptions={TOASTER_STYLE} />

        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#cafd00]/8 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 -left-1/4 w-1/3 h-1/3 bg-[#00eefc]/5 blur-[120px] rounded-full" />
        </div>

        <div className="fixed top-12 left-1/2 -translate-x-1/2 pointer-events-none hidden md:block opacity-[0.03] select-none z-0">
          <span className="font-headline font-black text-[200px] leading-none uppercase tracking-tighter text-white">
            PILOT
          </span>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden md:flex flex-col justify-between w-1/3 p-12 bg-[#0e0e0e] border-r border-white/5 relative z-10"
        >
          <div>
            <h1 className="font-headline font-black italic text-4xl text-[#cafd00] uppercase tracking-tighter mb-10">
              GymPilot AI
            </h1>
            <div className="space-y-6">
              <h2 className="font-headline text-5xl font-extrabold tracking-tight leading-none text-white" style={{ letterSpacing: '-0.02em' }}>
                ENGINEERED <br />
                FOR <span className="text-[#cafd00]">ELITE</span> <br />
                RESULTS.
              </h2>
              <p className="text-[#adaaaa] text-lg max-w-sm leading-relaxed">
                Data-driven training powered by surgical AI precision. Your transformation begins with your metrics.
              </p>
            </div>
          </div>
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-[#cafd00]" />
              <span className="font-headline font-bold text-xs tracking-widest uppercase text-[#cafd00]">
                Phase 01: Authentication
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="block text-2xl font-black font-headline text-white italic">4.9/5</span>
                <span className="text-[#adaaaa] text-[10px] uppercase tracking-widest font-bold">App Rating</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-headline text-white italic">12K+</span>
                <span className="text-[#adaaaa] text-[10px] uppercase tracking-widest font-bold">Pro Athletes</span>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10"
        >
          <div className="md:hidden w-full mb-12">
            <h1 className="font-headline font-black italic text-2xl text-[#cafd00] uppercase tracking-tighter">
              GymPilot AI
            </h1>
          </div>

          <div className="w-full max-w-sm space-y-10">
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-extrabold tracking-tight text-white uppercase" style={{ letterSpacing: '-0.02em' }}>
                Welcome Back.
              </h3>
              <p className="text-[#adaaaa] text-sm">
                Sign in to access your performance dashboard.
              </p>
            </div>

            <motion.button
              id="google-signin-btn"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signInWithGoogle().catch(() => {})}
              className="w-full py-4 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-sm rounded-lg shadow-neon-lime hover:shadow-[0_12px_32px_rgba(202,253,0,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#0e0e0e" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#0e0e0e" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#0e0e0e" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#0e0e0e" />
              </svg>
              Continue with Google
            </motion.button>

            <p className="text-[#adaaaa] text-[10px] uppercase font-bold tracking-widest text-center">
              Your data is encrypted and secured.
            </p>
          </div>
        </motion.main>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="fixed bottom-8 right-8 hidden lg:block z-20"
        >
          <div className="glass-panel p-5 rounded-xl border border-white/8 max-w-xs space-y-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#cafd00] animate-pulse-neon" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">AI Engine Active</span>
            </div>
            <p className="text-[#adaaaa] text-xs leading-relaxed">
              Neural training models online. Authentication required to access your protocol.
            </p>
            <div className="h-1 w-full bg-[#20201f] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#cafd00] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user.onboarded) {
    return (
      <div className="min-h-screen bg-[#0e0e0e]">
        <Onboarding />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" theme="dark" richColors toastOptions={TOASTER_STYLE} />
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nutrition" element={<NutritionLog />} />
            <Route path="/workout" element={<WorkoutLog />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
}
