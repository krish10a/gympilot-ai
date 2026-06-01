import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  age: z.coerce.number().min(13).max(100),
  sex: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(300),
  goal: z.enum(['bulk', 'cut', 'maintain', 'recomposition']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  trainingStyle: z.enum(['bodybuilding', 'powerlifting', 'crossfit', 'calisthenics', 'general_fitness']),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { id: 1, title: 'Profile Baseline', desc: 'Define your physiological starting point.' },
  { id: 2, title: 'Primary Goal', desc: 'What result are you engineering toward?' },
  { id: 3, title: 'Training Style', desc: 'How do you like to train?' },
];

const GOALS = [
  { id: 'bulk', label: 'Bulk', desc: 'Gain lean muscle mass and strength.' },
  { id: 'cut', label: 'Cut', desc: 'Lose fat while preserving muscle tissue.' },
  { id: 'maintain', label: 'Maintain', desc: 'Sustain your current physique and health.' },
  { id: 'recomposition', label: 'Recomp', desc: 'Lose fat and gain muscle simultaneously.' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Office job, little exercise' },
  { id: 'light', label: 'Lightly Active', desc: 'Light exercise 1–3 days/week' },
  { id: 'moderate', label: 'Moderately Active', desc: 'Exercise 3–5 days/week' },
  { id: 'active', label: 'Very Active', desc: 'Hard exercise 6–7 days/week' },
  { id: 'very_active', label: 'Extra Active', desc: 'Physical job + hard training' },
];

const TRAINING_STYLES = [
  { id: 'bodybuilding', label: 'Bodybuilding', desc: 'Muscle size, symmetry & aesthetics' },
  { id: 'powerlifting', label: 'Powerlifting', desc: 'Squat, Bench, Deadlift — max strength' },
  { id: 'crossfit', label: 'CrossFit', desc: 'High-intensity functional fitness' },
  { id: 'calisthenics', label: 'Calisthenics', desc: 'Bodyweight strength & control' },
  { id: 'general_fitness', label: 'General Fitness', desc: 'Overall health and longevity' },
];

const INPUT_FIELDS = [
  { id: 'age', label: 'Age', placeholder: '25', type: 'number' },
  { id: 'height', label: 'Height (cm)', placeholder: '175', type: 'number' },
  { id: 'weight', label: 'Weight (kg)', placeholder: '82.5', type: 'number' },
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setUser } = useAppStore();
  const shouldReduce = useReducedMotion();

  const { register, handleSubmit, setValue, watch } = useForm<any>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: 25, height: 175, weight: 70,
      sex: 'male', goal: 'maintain',
      activityLevel: 'moderate', trainingStyle: 'general_fitness',
    },
  });

  const onSubmit = async (data: OnboardingData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      // 1. Save to Firebase Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...data, uid: user.uid, email: user.email,
        onboarded: true, role: 'client',
        createdAt: Date.now(), updatedAt: Date.now(),
      });

      // 2. Sync with the FastAPI backend database
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          display_name: user.displayName || null,
          photo_url: user.photoURL || null,
          onboarded: true,
          profile: {
            age: data.age,
            sex: data.sex,
            height: data.height,
            weight: data.weight,
            goal: data.goal,
            activity_level: data.activityLevel,
            training_style: data.trainingStyle,
          },
        }),
      });

      if (res.ok) {
        const syncedUser = await res.json();
        // 3. Update the global Zustand store to trigger routing transition
        setUser({
          ...syncedUser.profile,
          uid: syncedUser.uid,
          email: syncedUser.email,
          displayName: syncedUser.display_name,
          photoURL: syncedUser.photo_url,
          onboarded: syncedUser.onboarded,
        });
        toast.success('Welcome to GymPilot AI — Protocol Initialized!');
      } else {
        throw new Error('Backend sync failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#cafd00]/6 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -left-1/4 w-1/3 h-1/3 bg-[#00eefc]/4 blur-[120px] rounded-full" />
      </div>

      <div className="fixed top-8 left-1/2 -translate-x-1/2 pointer-events-none hidden md:block opacity-[0.025] select-none z-0">
        <span className="font-headline font-black text-[200px] leading-none uppercase tracking-tighter text-white">
          PILOT
        </span>
      </div>

      <motion.aside
        initial={shouldReduce ? {} : { opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-col justify-between w-[360px] shrink-0 p-12 bg-[#0e0e0e] border-r border-white/5 relative z-10"
      >
        <div>
          <h1 className="font-headline font-black italic text-3xl text-[#cafd00] uppercase tracking-tighter mb-10">
            GymPilot AI
          </h1>
          <div className="space-y-5">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight leading-none text-white" style={{ letterSpacing: '-0.02em' }}>
              ENGINEERED<br />
              FOR <span className="text-[#cafd00]">ELITE</span><br />
              RESULTS.
            </h2>
            <p className="text-[#adaaaa] text-base max-w-xs leading-relaxed">
              Data-driven programs powered by surgical AI precision. Your transformation starts now.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-1 w-10 bg-[#cafd00]" />
            <span className="font-headline font-bold text-xs tracking-widest uppercase text-[#cafd00]">
              Phase {String(step).padStart(2, '0')}: Onboarding
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
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

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        <div className="md:hidden w-full mb-10 flex items-center justify-between">
          <h1 className="font-headline font-black italic text-xl text-[#cafd00] uppercase tracking-tighter">
            GymPilot AI
          </h1>
          <span className="text-[#adaaaa] text-[10px] font-bold uppercase tracking-widest">Step {step}/{STEPS.length}</span>
        </div>

        <div className="w-full max-w-xl">
          <div className="flex gap-2 mb-10">
            {STEPS.map((s) => (
              <motion.div key={s.id} className="h-1 flex-1 rounded-full overflow-hidden bg-[#20201f]">
                <motion.div
                  className="h-full bg-[#cafd00] rounded-full"
                  animate={{ width: step >= s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={shouldReduce ? {} : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10"
                >
                  <div>
                    <h3 className="font-headline text-3xl font-extrabold tracking-tight text-white uppercase mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {STEPS[0].title}
                    </h3>
                    <p className="text-[#adaaaa] text-sm">{STEPS[0].desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {INPUT_FIELDS.map((field) => (
                      <div key={field.id} className="relative group">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-2 group-focus-within:text-[#cafd00] transition-colors">
                          {field.label}
                        </label>
                        <input
                          {...register(field.id as any)}
                          type={field.type}
                          placeholder={field.placeholder}
                          className="input-minimal"
                        />
                      </div>
                    ))}

                    <div className="relative group">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-3">Sex</label>
                      <div className="flex gap-3">
                        {['male', 'female', 'other'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue('sex', s as any)}
                            className={`flex-1 py-2.5 border font-headline font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                              watch('sex') === s
                                ? 'border-[#cafd00] bg-[#cafd00]/10 text-[#cafd00]'
                                : 'border-outline-variant/40 text-[#adaaaa] hover:border-[#adaaaa] hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-12 py-5 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-sm rounded-lg shadow-neon-lime hover:shadow-[0_12px_32px_rgba(202,253,0,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Define Protocol →
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={shouldReduce ? {} : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-headline text-3xl font-extrabold tracking-tight text-white uppercase mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {STEPS[1].title}
                    </h3>
                    <p className="text-[#adaaaa] text-sm">{STEPS[1].desc}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map((g) => {
                      const isSelected = watch('goal') === g.id;
                      return (
                        <motion.button
                          key={g.id}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setValue('goal', g.id as any)}
                          className={`flex flex-col items-start p-5 rounded-xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'border-[#cafd00] bg-[#cafd00]/8'
                              : 'border-[#262626] bg-[#20201f] hover:border-outline-variant'
                          }`}
                        >
                          <p className={`text-xs font-headline font-black uppercase tracking-tighter mb-1 ${isSelected ? 'text-[#cafd00]' : 'text-white'}`}>
                            {g.label}
                          </p>
                          <p className="text-[10px] text-[#adaaaa]">{g.desc}</p>
                          {isSelected && <div className="mt-3 w-4 h-1 bg-[#cafd00] rounded-full" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-4">
                      Daily Activity Level
                    </label>
                    <div className="space-y-2">
                      {ACTIVITY_LEVELS.map((level) => (
                        <motion.button
                          key={level.id}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue('activityLevel', level.id as any)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all cursor-pointer text-left ${
                            watch('activityLevel') === level.id
                              ? 'border-[#cafd00]/40 bg-[#cafd00]/6'
                              : 'border-[#262626] bg-[#20201f] hover:border-outline-variant'
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-bold ${watch('activityLevel') === level.id ? 'text-[#cafd00]' : 'text-white'}`}>
                              {level.label}
                            </p>
                            <p className="text-[10px] text-[#adaaaa]">{level.desc}</p>
                          </div>
                          {watch('activityLevel') === level.id && (
                            <Check className="w-4 h-4 text-[#cafd00] shrink-0" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 border border-outline-variant/40 text-[#adaaaa] font-headline font-bold uppercase tracking-widest text-xs rounded-lg hover:border-[#adaaaa] hover:text-white transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-sm rounded-lg shadow-neon-lime hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                    >
                      Select Training →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={shouldReduce ? {} : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-headline text-3xl font-extrabold tracking-tight text-white uppercase mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {STEPS[2].title}
                    </h3>
                    <p className="text-[#adaaaa] text-sm">{STEPS[2].desc}</p>
                  </div>

                  <div className="space-y-2">
                    {TRAINING_STYLES.map((s) => {
                      const isSelected = watch('trainingStyle') === s.id;
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue('trainingStyle', s.id as any)}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-[#cafd00] bg-[#cafd00]/8'
                              : 'border-[#262626] bg-[#20201f] hover:border-outline-variant'
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-headline font-black uppercase tracking-tight ${isSelected ? 'text-[#cafd00]' : 'text-white'}`}>
                              {s.label}
                            </p>
                            <p className="text-[10px] text-[#adaaaa] mt-0.5">{s.desc}</p>
                          </div>
                          <motion.div animate={isSelected ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}>
                            <Check className="w-4 h-4 text-[#cafd00]" />
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-4 border border-outline-variant/40 text-[#adaaaa] font-headline font-bold uppercase tracking-widest text-xs rounded-lg hover:border-[#adaaaa] hover:text-white transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={isSubmitting ? {} : { scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-4 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-sm rounded-lg shadow-neon-lime hover:shadow-[0_12px_32px_rgba(202,253,0,0.35)] transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block w-4 h-4 border-2 border-[#0e0e0e] border-t-transparent rounded-full"
                          />
                          Initializing...
                        </span>
                      ) : (
                        'Initialize Protocol ✓'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 hidden lg:block z-20"
      >
        <div className="glass-panel p-5 rounded-xl border border-border max-w-[260px] space-y-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#cafd00] animate-pulse-neon" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">AI Engine Status</span>
          </div>
          <p className="text-[#adaaaa] text-xs leading-relaxed">
            Calculating metabolic baseline. Your plan will be tailored after {4 - step} more step{(4 - step) !== 1 ? 's' : ''}.
          </p>
          <div className="h-1 w-full bg-[#20201f] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#cafd00] rounded-full"
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
