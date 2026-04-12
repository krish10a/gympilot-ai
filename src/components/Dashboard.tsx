import React, { useRef, useEffect, useState } from 'react';
import {
  Flame, Beef, Droplets, Footprints,
  Calendar, ChevronRight, Trophy,
  Dumbbell, Zap, CheckCircle2
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';

const weightData = [
  { date: 'Mon', weight: 82.5 },
  { date: 'Tue', weight: 82.3 },
  { date: 'Wed', weight: 82.6 },
  { date: 'Thu', weight: 82.1 },
  { date: 'Fri', weight: 81.9 },
  { date: 'Sat', weight: 81.8 },
  { date: 'Sun', weight: 81.7 },
];

const consistencyData = [
  { date: 'M', volume: 80 },
  { date: 'T', volume: 100 },
  { date: 'W', volume: 95 },
  { date: 'T', volume: 40 },
  { date: 'F', volume: 90 },
  { date: 'S', volume: 85 },
  { date: 'S', volume: 98 },
];

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? {} : { opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function BiometricRing({
  value, max, label, sublabel, color, percent, icon: Icon,
}: {
  value: string; max: string; label: string; sublabel: string;
  color: 'lime' | 'cyan'; percent: number; icon: React.ElementType;
}) {
  const stroke = color === 'lime' ? '#cafd00' : '#00eefc';
  const circumference = 2 * Math.PI * 40;
  const dashoffset = circumference * (1 - percent / 100);
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduce ? {} : { y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-[#1a1a1a] p-6 rounded-xl flex items-center gap-6 relative overflow-hidden group"
    >
      <div className="absolute bottom-2 right-3 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
        <Icon className="w-20 h-20" />
      </div>

      <div className="relative w-28 h-28 shrink-0">
        <svg className="w-full h-full biometric-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#20201f" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40"
            fill="transparent"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduce ? { strokeDashoffset: dashoffset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-headline tracking-tighter" style={{ color: stroke }}>
            {percent}%
          </span>
          <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest">{label}</span>
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <h3 className="text-[#adaaaa] font-bold uppercase text-[10px] tracking-widest mb-1">{sublabel}</h3>
        <p className="text-3xl font-headline font-extrabold tracking-tight leading-none mb-1">
          {value}{' '}
          <span className="text-sm font-normal text-[#adaaaa]">/ {max}</span>
        </p>
        <p className="text-xs font-semibold" style={{ color: stroke }}>
          {label === 'Calorie' ? '550 kcal remaining' : '38g remaining'}
        </p>
      </div>
    </motion.div>
  );
}

function BentoTile({
  icon: Icon, label, value, sub, color, delay,
}: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; color: string; delay?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay ?? 0 }}
      whileHover={shouldReduce ? {} : { y: -2 }}
      className="bg-[#20201f] p-5 rounded-xl flex flex-col justify-between aspect-square group cursor-default"
    >
      <div>
        <Icon className="w-6 h-6 mb-3" style={{ color }} />
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">{label}</h4>
      </div>
      <div>
        <p className="text-2xl font-headline font-bold">{value}</p>
        {sub && <p className="text-[10px] text-[#adaaaa] font-bold uppercase mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

interface AlertData {
  color: string;
  title: string;
  desc: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAppStore();
  const [insight, setInsight] = useState('');
  const [alerts, setAlerts] = useState<AlertData[]>([
    { color: '#cafd00', title: 'Protein Target Missed', desc: "You're 38g short of your daily goal." },
    { color: '#00eefc', title: 'New PR! Bench Press', desc: 'You hit 105kg for 5 reps. Excellent work!' }
  ]);

  useEffect(() => {
    if (user) {
      apiService.getCoachInsight(user.uid).then(res => {
        if (res?.insight_text) setInsight(res.insight_text);
        if (res?.alerts?.length > 0) setAlerts(res.alerts);
      }).catch(console.error);
    }
  }, [user]);

  return (
    <div className="space-y-8">

      <RevealSection>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#adaaaa] text-xs font-bold uppercase tracking-widest mb-1">
              Today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight leading-none text-white" style={{ letterSpacing: '-0.02em' }}>
              Hello, {user?.displayName ? user.displayName.split(' ')[0] : 'Athlete'}.
            </h1>
            <p className="text-[#adaaaa] text-sm mt-2">{insight || "You're on track for your goal."}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-[#20201f] px-4 py-2 rounded-xl border border-[#cafd00]/15 shrink-0"
          >
            <Trophy className="w-4 h-4 text-[#ffeea5]" />
            <div className="text-right">
              <span className="block text-lg font-headline font-black text-white">12</span>
              <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">Day Streak</span>
            </div>
          </motion.div>
        </div>
      </RevealSection>

      <RevealSection delay={0.05}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BiometricRing
            value="1,850" max="2,400 kcal"
            label="Calorie" sublabel="Fuel Status"
            color="lime" percent={75} icon={Flame}
          />
          <BiometricRing
            value="82g" max="180g"
            label="Protein" sublabel="Muscle Synthesis"
            color="cyan" percent={45} icon={Beef}
          />
        </div>
      </RevealSection>

      <RevealSection delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BentoTile icon={Droplets} label="Hydration" value="2.4L" sub="Goal: 3.5L" color="#00eefc" delay={0.05} />
          <BentoTile icon={Footprints} label="Steps" value="8,432" sub="Goal: 10k" color="#cafd00" delay={0.1} />
          <BentoTile icon={CheckCircle2} label="Session" value="Push A" sub="Done · 52m" color="#ffeea5" delay={0.15} />
          <BentoTile icon={Zap} label="Recovery" value="64%" sub="Stress High" color="#ff7351" delay={0.2} />
        </div>
      </RevealSection>

      <RevealSection delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg tracking-tight">Weight Trend</h3>
              <div className="flex items-center gap-2 bg-[#20201f] px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#cafd00]" />
                <span className="text-[10px] font-bold text-white uppercase">82.1 KG Avg</span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cafd00" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#cafd00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#484847"
                    tick={{ fill: '#adaaaa', fontSize: 10, fontFamily: 'Inter', fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(202,253,0,0.15)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#cafd00', fontWeight: 700 }}
                    cursor={{ stroke: 'rgba(202,253,0,0.2)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#cafd00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#cafd00', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-[#1a1a1a] p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-4 right-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
              <Dumbbell className="w-20 h-20" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-1">Today's Session</p>
              <h3 className="font-headline text-2xl font-extrabold mb-4 tracking-tight">Push Day A</h3>
              <div className="space-y-2">
                {['Bench Press (4×8)', 'Overhead Press (3×10)', 'Lateral Raises (3×15)'].map((ex) => (
                  <div key={ex} className="flex items-center gap-2 text-sm text-[#adaaaa]">
                    <ChevronRight className="w-3 h-3 text-[#cafd00] shrink-0" />
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button
              id="start-workout-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-full py-3 bg-[#cafd00] text-[#0e0e0e] font-headline font-black uppercase tracking-widest text-sm rounded-lg shadow-neon-lime transition-all"
            >
              Start Workout
            </motion.button>
          </motion.div>
        </div>
      </RevealSection>

      <RevealSection delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <div className="bg-[#1a1a1a] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg tracking-tight">Weekly Discipline</h3>
              <span className="text-[10px] font-bold text-[#00eefc] uppercase tracking-widest">92% Consistency</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-36">
              {consistencyData.map((d, i) => (
                <div key={i} className="flex flex-col justify-end items-center gap-1 h-full relative group">
                  <div className="absolute -top-5 text-[8px] font-bold text-[#00eefc] opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.volume}%
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.volume}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                    className="w-full rounded-lg"
                    style={{
                      backgroundColor: d.volume > 85 ? '#00eefc' : 'rgba(0,238,252,0.2)',
                      boxShadow: d.volume === 98 ? '0 0 15px rgba(0,238,252,0.3)' : 'none',
                    }}
                  />
                  <span className="text-[9px] font-bold text-[#adaaaa] uppercase">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#1a1a1a] p-5 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-full h-full biometric-ring" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" fill="transparent" stroke="#20201f" strokeWidth="5" />
                    <motion.circle
                      cx="30" cy="30" r="24"
                      fill="transparent" stroke="#00eefc"
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - 0.82) }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black font-headline text-[#00eefc]">82</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold">Optimal Recovery</p>
                  <p className="text-xs text-[#adaaaa]">Ready for high intensity today</p>
                </div>
              </div>
              <Calendar className="w-4 h-4 text-[#adaaaa]" />
            </motion.div>

            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Recent Alerts</h4>
              <button className="text-[10px] font-bold text-[#cafd00] hover:text-white transition-colors cursor-pointer">
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 3 }}
                  className="bg-[#20201f] p-4 rounded-xl flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: alert.color }} />
                  <div>
                    <p className="text-xs font-bold">{alert.title}</p>
                    <p className="text-[10px] text-[#adaaaa] mt-0.5">{alert.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
};
