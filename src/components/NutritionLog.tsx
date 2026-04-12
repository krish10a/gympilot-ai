import React, { useState, useRef } from 'react';
import { Camera, Mic, Type, Plus, History, Sparkles, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

const PRESETS = [
  { name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fat: 8 },
  { name: 'Chicken Breast 150g', calories: 240, protein: 46, carbs: 0, fat: 5 },
  { name: 'Brown Rice 1 cup', calories: 215, protein: 5, carbs: 45, fat: 2 },
  { name: 'Protein Shake', calories: 150, protein: 30, carbs: 3, fat: 2 },
];

const MOCK_MEALS = [
  { time: '08:30 AM', type: 'Breakfast', name: 'Oatmeal & Coffee', kcal: 420, color: '#cafd00' },
  { time: '01:15 PM', type: 'Lunch', name: 'Chicken Salad Bowl', kcal: 580, color: '#00eefc' },
];

const INPUT_TABS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'image', label: 'Image', icon: Camera },
];

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

export const NutritionLog: React.FC = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meals, setMeals] = useState<any[]>(MOCK_MEALS);
  const shouldReduce = useReducedMotion();

  const handleAnalyze = async () => {
    if (!inputText || !user) return;
    setIsAnalyzing(true);
    try {
      const result = await apiService.fuseInput(user.uid, 'meal', { text: inputText });
      if (result?.data) {
        const logged = await apiService.logMeal(user.uid, result.data);
        if (logged) {
          toast.success('Meal logged!');
          setMeals(prev => [{
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'Smart Entry',
            name: result.data.items?.[0]?.name || 'Meal',
            kcal: result.data.totalCalories || 0,
            color: '#cafd00',
          }, ...prev]);
          setInputText('');
        } else {
          toast.error('Failed to save meal.');
        }
      } else {
        toast.error("AI couldn't process this meal.");
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">

      <RevealSection>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#adaaaa] text-[10px] font-bold uppercase tracking-widest mb-1">Log</p>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Nutrition
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-[#20201f] px-3 py-1.5 rounded-xl">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#cafd00]" />
            </motion.div>
            <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-widest">AI Powered</span>
          </div>
        </div>
      </RevealSection>

      <RevealSection delay={0.05}>
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="flex border-b border-white/[0.06] relative">
            {INPUT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer relative ${
                    isActive ? 'text-[#0e0e0e]' : 'text-[#adaaaa] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-[#cafd00]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">

              {activeTab === 'text' && (
                <motion.div
                  key="text"
                  initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <textarea
                    placeholder="e.g., '2 rotis, a bowl of dal, and some salad'"
                    className="w-full bg-[#20201f] rounded-xl p-4 text-sm text-white outline-none min-h-[110px] transition-all resize-none border border-transparent focus:border-[#cafd00]/30 placeholder:text-outline-variant"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <motion.button
                    id="log-meal-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={!inputText || isAnalyzing}
                    className="flex items-center gap-2 px-6 py-3 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-xs rounded-lg shadow-neon-lime-sm disabled:opacity-40 transition-all cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Log Meal with AI'}
                  </motion.button>
                </motion.div>
              )}

              {activeTab === 'voice' && (
                <motion.div
                  key="voice"
                  initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-10 flex flex-col items-center gap-5"
                >
                  <motion.button
                    id="voice-record-btn"
                    whileTap={{ scale: 0.88 }}
                    className="relative w-24 h-24 rounded-full bg-[#cafd00] flex items-center justify-center shadow-neon-lime cursor-pointer"
                  >
                    <Mic className="w-9 h-9 text-[#0e0e0e] stroke-[2.5px]" />
                    <span className="absolute inset-0 rounded-full bg-[#cafd00]/30 animate-ping" />
                  </motion.button>
                  <p className="text-sm text-[#adaaaa]">Tap to describe your meal</p>
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div
                  key="image"
                  initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-10 flex flex-col items-center gap-5 border-2 border-dashed border-[#262626] rounded-xl"
                >
                  <Camera className="w-12 h-12 text-outline-variant" />
                  <div className="text-center">
                    <p className="text-sm font-bold">Take a photo of your food</p>
                    <p className="text-xs text-[#adaaaa] mt-1">AI will extract ingredients and portions</p>
                  </div>
                  <motion.button
                    id="upload-image-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2.5 border border-outline-variant/50 text-sm font-bold text-[#adaaaa] rounded-lg hover:border-[#cafd00]/40 hover:text-white transition-all cursor-pointer"
                  >
                    Upload Image
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </RevealSection>

      <RevealSection delay={0.1}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Quick Presets</h3>
            <button className="text-[10px] font-bold text-[#cafd00] flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <History className="w-3 h-3" /> Recent
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.15 }}
                whileHover={{ y: -3 }}
                className="bg-[#20201f] p-4 rounded-xl cursor-pointer group hover:bg-[#262626] transition-all"
              >
                <p className="text-xs font-bold mb-2 truncate group-hover:text-[#cafd00] transition-colors">{p.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xl font-headline font-bold">{p.calories}</span>
                  <span className="text-[10px] text-[#adaaaa]">kcal</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold text-[#adaaaa] uppercase">P: {p.protein}g</span>
                  <span className="text-[9px] font-bold text-[#adaaaa] uppercase">C: {p.carbs}g</span>
                  <span className="text-[9px] font-bold text-[#adaaaa] uppercase">F: {p.fat}g</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection delay={0.15}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Today's Meals</h3>
            <button
              id="add-meal-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cafd00] text-[#0e0e0e] text-[10px] font-headline font-black uppercase tracking-widest rounded-lg shadow-neon-lime-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Meal
            </button>
          </div>

          <div className="space-y-4">
            {meals.map((m, i) => (
              <motion.div
                key={m.time}
                initial={shouldReduce ? {} : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                whileHover={{ x: 4 }}
                className="bg-[#20201f] p-4 rounded-xl flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${m.color}15` }}
                  >
                    <UtensilsCrossed className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">{m.time}</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ color: m.color, backgroundColor: `${m.color}15` }}
                      >
                        {m.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold">{m.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-headline font-bold">{m.kcal}</p>
                  <p className="text-[9px] text-[#adaaaa] font-bold">kcal</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>
    </div>
  );
};
