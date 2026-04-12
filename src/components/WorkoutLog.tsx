import React, { useState, useRef } from 'react';
import {
  Dumbbell, Plus, History, ChevronRight,
  Timer, Search, CheckCircle2, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

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

// Session data representing an active Push Day A workout
const MOCK_ACTIVE_EXERCISES = [
  { name: 'Bench Press', sets: [{ weight: 100, reps: 8, done: true }, { weight: 100, reps: 8, done: true }, { weight: 100, reps: 6, done: false }] },
  { name: 'Overhead Press', sets: [{ weight: 60, reps: 10, done: true }, { weight: 60, reps: 10, done: false }] },
];

const RECENT_HISTORY = [
  { date: 'Yesterday', name: 'Pull Day B', volume: '14,200 kg', duration: '62 min', color: '#00eefc' },
  { date: '3 days ago', name: 'Leg Day A', volume: '18,500 kg', duration: '75 min', color: '#ffeea5' },
];

export const WorkoutLog: React.FC = () => {
  const { user } = useAppStore();
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const shouldReduce = useReducedMotion();

  const filteredExercises = EXERCISE_LIBRARY.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSession = async () => {
    if (!isWorkoutActive) {
      setIsWorkoutActive(true);
      return;
    }
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    setIsFinishing(true);
    try {
      const sampleWorkout = {
        name: 'Push Day A',
        duration: 24,
        volume: 2400,
        exercises: [
          { name: 'Bench Press', sets: [{ weight: 100, reps: 8 }, { weight: 100, reps: 8 }, { weight: 100, reps: 6 }] },
          { name: 'Overhead Press', sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }] },
        ],
      };
      const logged = await apiService.logWorkout(user.uid, sampleWorkout);
      if (logged) {
        toast.success('Workout logged!');
        setIsWorkoutActive(false);
      } else {
        toast.error('Failed to save workout.');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="space-y-8">

      <RevealSection>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#adaaaa] text-[10px] font-bold uppercase tracking-widest mb-1">Log</p>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Workouts
            </h1>
          </div>
          <motion.button
            id="session-toggle-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleToggleSession}
            disabled={isFinishing}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-headline font-black uppercase tracking-widest text-xs transition-all cursor-pointer ${
              isFinishing ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isWorkoutActive
                ? 'bg-[#00eefc]/10 border border-[#00eefc]/40 text-[#00eefc]'
                : 'bg-[#cafd00] text-[#0e0e0e] shadow-neon-lime'
            }`}
          >
            {isWorkoutActive ? (
              <><X className="w-4 h-4" /> {isFinishing ? 'Saving...' : 'Finish Session'}</>
            ) : (
              <><Plus className="w-4 h-4" /> Start Session</>
            )}
          </motion.button>
        </div>
      </RevealSection>

      <AnimatePresence>
        {isWorkoutActive && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -16 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="bg-[#1a1a1a] border-l-4 border-[#cafd00] p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-1">Active Session</p>
                <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white">Push Day A</h2>
                <p className="text-xs text-[#adaaaa] mt-1">3 exercises logged</p>
              </div>
              <div className="flex items-center gap-2 bg-[#cafd00]/10 border border-[#cafd00]/30 px-4 py-2 rounded-xl">
                <Timer className="w-4 h-4 text-[#cafd00]" />
                <span className="text-sm font-mono font-black text-[#cafd00]">24:15</span>
              </div>
            </div>

            {MOCK_ACTIVE_EXERCISES.map((ex, i) => (
              <motion.div
                key={i}
                initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#20201f] rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                  <h3 className="font-headline font-bold text-sm uppercase tracking-tight">{ex.name}</h3>
                  <button className="text-[10px] font-bold text-[#cafd00] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                    + Add Set
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {ex.sets.map((set, si) => (
                    <motion.div
                      key={si}
                      whileHover={{ x: 3 }}
                      className={`flex items-center gap-4 p-3 rounded-lg ${set.done ? 'bg-[#cafd00]/5' : 'bg-[#1a1a1a]'}`}
                    >
                      <span className="text-[10px] font-black text-[#adaaaa] uppercase w-5">S{si + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-headline font-black">{set.weight}</span>
                          <span className="text-[10px] font-bold text-[#adaaaa] uppercase">kg</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-headline font-black">{set.reps}</span>
                          <span className="text-[10px] font-bold text-[#adaaaa] uppercase">reps</span>
                        </div>
                      </div>
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${set.done ? 'text-[#cafd00]' : 'text-outline-variant'}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full border-2 border-dashed border-[#262626] py-5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#adaaaa] hover:border-[#cafd00]/40 hover:text-[#cafd00] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Exercise
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <RevealSection delay={0.05}>
        <div>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] shrink-0">Exercise Library</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline-variant" />
              <input
                id="exercise-search"
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#20201f] pl-9 pr-4 py-2.5 text-[11px] rounded-lg outline-none border border-transparent focus:border-[#cafd00]/30 text-white placeholder:text-outline-variant transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExercises.slice(0, 6).map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2 }}
                className="bg-[#20201f] rounded-xl overflow-hidden flex h-20 group cursor-pointer"
              >
                <div className="w-20 h-full bg-[#1a1a1a] relative overflow-hidden shrink-0">
                  <img
                    src={ex.visualUrl}
                    alt={ex.name}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-[#20201f] to-transparent" />
                </div>
                <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-[#cafd00] transition-colors">{ex.name}</h4>
                  <div className="flex gap-1.5 mt-1">
                    {ex.muscleGroups.slice(0, 2).map((m: string) => (
                      <span key={m} className="text-[9px] font-bold uppercase text-[#adaaaa] tracking-wider bg-[#1a1a1a] px-2 py-0.5 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 flex items-center">
                  <ChevronRight className="w-4 h-4 text-outline-variant group-hover:text-[#cafd00] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection delay={0.1}>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-4">Recent History</h3>
          <div className="space-y-4">
            {RECENT_HISTORY.map((h, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="bg-[#20201f] p-4 rounded-xl flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${h.color}15` }}
                  >
                    <History className="w-5 h-5" style={{ color: h.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-wider">{h.date}</p>
                    <p className="text-sm font-headline font-bold group-hover:text-[#cafd00] transition-colors">{h.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-headline font-bold">{h.volume}</p>
                  <p className="text-[10px] text-[#adaaaa]">{h.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>
    </div>
  );
};
