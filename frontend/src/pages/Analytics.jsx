import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { TrendingUp, Clock, Flame, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { analyticsService } from '../services/analyticsService';

const PALETTE = ['#F5B841', '#7C86FF', '#4FD1A5', '#FF8577', '#a3a3ac', '#eea62c'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [taskDist, setTaskDist] = useState({ byStatus: [], byPriority: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dash, week, subj, dist] = await Promise.all([
          analyticsService.dashboard(),
          analyticsService.weekly(),
          analyticsService.subjects(),
          analyticsService.taskDistribution(),
        ]);
        setSummary(dash.summary);
        setWeekly(week.weekly);
        setSubjects(subj.breakdown);
        setTaskDist(dist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Crunching your numbers..." />;

  const s = summary || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Analytics</h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">A clear picture of where your time and effort go.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total study time', value: `${Math.round((s.totalStudyMinutes || 0) / 60)}h`, icon: Clock, tone: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-400/10' },
          { label: 'Longest streak', value: `${s.studyStreak?.longest || 0} days`, icon: Flame, tone: 'text-coral-500', bg: 'bg-coral-50 dark:bg-coral-400/10' },
          { label: 'Tasks completed', value: s.totalTasksCompleted || 0, icon: TrendingUp, tone: 'text-mint-500', bg: 'bg-mint-400/10' },
          { label: 'Badges earned', value: s.badges?.length || 0, icon: Award, tone: 'text-violet-500', bg: 'bg-violet-300/20 dark:bg-violet-400/10' },
        ].map(({ label, value, icon: Icon, tone, bg }) => (
          <Card key={label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={tone} />
            </div>
            <p className="text-2xl font-display font-semibold text-ink-900 dark:text-paper-50">{value}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-6">Weekly study minutes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-200)" />
              <XAxis dataKey="label" stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-ink-900)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="studyMinutes" fill="#F5B841" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-6">Tasks completed per day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-200)" />
              <XAxis dataKey="label" stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-ink-400)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--color-ink-900)', border: 'none', borderRadius: 12, color: '#fff' }} />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#7C86FF" strokeWidth={2.5} dot={{ fill: '#7C86FF', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-6">Time by subject</h3>
          {subjects.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-16">Log study sessions to see this breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={subjects} dataKey="totalMinutes" nameKey="_id" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {subjects.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-ink-900)', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-6">Task status distribution</h3>
          {taskDist.byStatus.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-16">Create tasks to see this breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={taskDist.byStatus} dataKey="count" nameKey="_id" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {taskDist.byStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-ink-900)', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
