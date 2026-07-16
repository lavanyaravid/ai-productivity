import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressRing from '../components/ui/ProgressRing';
import { pomodoroService } from '../services/sessionService';

const DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_META = {
  work: { label: 'Focus session', icon: Brain, color: 'var(--color-amber-400)' },
  shortBreak: { label: 'Short break', icon: Coffee, color: 'var(--color-mint-400)' },
  longBreak: { label: 'Long break', icon: Coffee, color: 'var(--color-violet-400)' },
};

export default function Pomodoro() {
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [subject, setSubject] = useState('General');
  const [todayStats, setTodayStats] = useState({ completedToday: 0, totalMinutesToday: 0 });
  const intervalRef = useRef(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await pomodoroService.today();
      setTodayStats(res);
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const logCycle = useCallback(async (finishedMode, wasCompleted) => {
    try {
      await pomodoroService.log({
        cycleType: finishedMode,
        durationMinutes: Math.round(DURATIONS[finishedMode] / 60),
        subject,
        wasCompleted,
      });
      loadStats();
    } catch {
      /* silent */
    }
  }, [subject, loadStats]);

  const switchMode = useCallback((nextMode, autoStart = false) => {
    setMode(nextMode);
    setSecondsLeft(DURATIONS[nextMode]);
    setRunning(autoStart);
  }, []);

  const handleComplete = useCallback(() => {
    logCycle(mode, true);
    if (mode === 'work') {
      const nextCycles = cyclesCompleted + 1;
      setCyclesCompleted(nextCycles);
      toast.success('Focus session complete! Take a breather 🌿');
      switchMode(nextCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      toast('Break is over — ready to focus again?', { icon: '⏳' });
      switchMode('work');
    }
  }, [mode, cyclesCompleted, logCycle, switchMode]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(DURATIONS[mode]);
  };

  const skip = () => {
    setRunning(false);
    logCycle(mode, false);
    if (mode === 'work') switchMode(cyclesCompleted % 4 === 3 ? 'longBreak' : 'shortBreak');
    else switchMode('work');
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = ((DURATIONS[mode] - secondsLeft) / DURATIONS[mode]) * 100;
  const Meta = MODE_META[mode];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Focus Timer</h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">Pomodoro sessions to keep your attention where it belongs.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-ink-950 to-ink-900 text-paper-50 border-none">
          <div className="flex gap-2 mb-8">
            {Object.entries(MODE_META).map(([key, m]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  mode === key ? 'bg-amber-400 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
                }`}
              >
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </div>

          <ProgressRing size={280} stroke={14} progress={progress} color={Meta.color} trackColor="rgba(255,255,255,0.1)">
            <div className="text-center">
              <p className="font-display text-6xl font-semibold tabular-nums">{mm}:{ss}</p>
              <p className="text-sm text-ink-400 mt-2">{Meta.label}</p>
            </div>
          </ProgressRing>

          <div className="flex items-center gap-3 mt-10">
            <button onClick={reset} className="p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-paper-50 transition-colors">
              <RotateCcw size={18} />
            </button>
            <Button size="lg" className="px-10" icon={running ? Pause : Play} onClick={() => setRunning((r) => !r)}>
              {running ? 'Pause' : 'Start'}
            </Button>
            <button onClick={skip} className="p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-paper-50 transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="w-full max-w-xs mt-8">
            <Input
              placeholder="What are you focusing on?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="!bg-white/5 !border-white/10 !text-paper-50 placeholder:!text-ink-400"
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Sessions today</p>
            <p className="font-display text-4xl font-semibold text-ink-900 dark:text-paper-50">{todayStats.completedToday}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Minutes focused today</p>
            <p className="font-display text-4xl font-semibold text-ink-900 dark:text-paper-50">{todayStats.totalMinutesToday}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-3">This cycle</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < cyclesCompleted % 4 || (cyclesCompleted > 0 && cyclesCompleted % 4 === 0) ? 'bg-amber-400' : 'bg-ink-100 dark:bg-ink-800'}`} />
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-2">Long break after every 4 sessions</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
