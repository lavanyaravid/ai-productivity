import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Flame, Timer, Target, ArrowRight, Plus, Award,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressRing from '../components/ui/ProgressRing';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { taskService } from '../services/taskService';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dash, week, tasks] = await Promise.all([
          analyticsService.dashboard(),
          analyticsService.weekly(),
          taskService.getAll({ dueDate: 'week', sort: 'dueDate', limit: 5 }),
        ]);
        setSummary(dash.summary);
        setWeekly(week.weekly);
        setUpcoming(tasks.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader size={36} label="Waking up your dashboard..." />;

  const s = summary || {};

  const statCards = [
    {
      label: "Today's focus",
      value: `${s.todayStudyMinutes || 0}m`,
      icon: Timer,
      tone: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-400/10',
    },
    {
      label: 'Study streak',
      value: `${s.studyStreak?.current || 0} days`,
      icon: Flame,
      tone: 'text-coral-500',
      bg: 'bg-coral-50 dark:bg-coral-400/10',
    },
    {
      label: 'Tasks completed',
      value: s.completedTasks || 0,
      icon: CheckSquare,
      tone: 'text-mint-500',
      bg: 'bg-mint-400/10 dark:bg-mint-400/10',
    },
    {
      label: 'Active goals',
      value: s.activeGoals || 0,
      icon: Target,
      tone: 'text-violet-500',
      bg: 'bg-violet-300/20 dark:bg-violet-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Here's how your work is shaping up.</p>
        </div>
        <div className="flex gap-2.5">
          <Link to="/pomodoro"><Button variant="outline" icon={Timer}>Start focus</Button></Link>
          <Link to="/tasks"><Button icon={Plus}>New task</Button></Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, tone, bg }) => (
          <Card key={label} className="p-5" hover>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={tone} />
            </div>
            <p className="text-2xl font-display font-semibold text-ink-900 dark:text-paper-50">{value}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">This week's focus</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400">Minutes studied per day</p>
            </div>
            <Link to="/analytics" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
              Full report <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5B841" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#F5B841" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-200)" />
              <XAxis dataKey="label" stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-ink-900)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13 }}
              />
              <Area type="monotone" dataKey="studyMinutes" stroke="#F5B841" strokeWidth={2.5} fill="url(#studyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Task completion ring */}
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-6">Task completion</h3>
          <ProgressRing size={140} stroke={12} progress={s.taskCompletionRate || 0}>
            <div className="text-center">
              <p className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50">{s.taskCompletionRate || 0}%</p>
              <p className="text-xs text-ink-400">complete</p>
            </div>
          </ProgressRing>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-6">
            {s.completedTasks || 0} of {s.totalTasks || 0} tasks done
          </p>
          {s.overdueTasks > 0 && (
            <Badge tone="coral" className="mt-3">{s.overdueTasks} overdue</Badge>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming tasks */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">Due this week</h3>
            <Link to="/tasks" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">Nothing due this week. Enjoy the breathing room 🌿</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((t) => (
                <div key={t._id} className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-paper-50">{t.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{t.subject || 'General'}</p>
                  </div>
                  <Badge tone={t.priority === 'high' ? 'coral' : t.priority === 'medium' ? 'amber' : 'ink'}>
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Badges */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-500" />
            <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">Achievements</h3>
          </div>
          {(!s.badges || s.badges.length === 0) ? (
            <p className="text-sm text-ink-400 py-4">Complete tasks and focus sessions to earn your first badge.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {s.badges.slice(0, 6).map((b) => (
                <div key={b.name} className="flex flex-col items-center text-center p-2.5 rounded-xl bg-paper-100 dark:bg-ink-800">
                  <span className="text-2xl mb-1">{b.icon || '🏅'}</span>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 leading-tight">{b.name}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
