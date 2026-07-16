import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import { taskService } from '../services/taskService';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await taskService.getAll({ limit: 500 });
        setTasks(res.tasks || []);
      } catch {
        toast.error('Could not load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = new Date(t.dueDate).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const today = new Date().toDateString();
  const selectedTasks = selectedDate ? tasksByDate[selectedDate.toDateString()] || [] : [];

  if (loading) return <Loader label="Building your calendar..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Calendar</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">See every deadline laid out across the month.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
            <ChevronLeft size={18} />
          </button>
          <span className="font-display font-semibold w-40 text-center text-ink-900 dark:text-paper-50">
            {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-5">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-ink-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {grid.map((date, i) => {
              if (!date) return <div key={i} />;
              const dayTasks = tasksByDate[date.toDateString()] || [];
              const isToday = date.toDateString() === today;
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-xl p-1.5 flex flex-col items-start border transition-colors ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-400/10'
                      : isToday
                      ? 'border-amber-300/60 bg-white dark:bg-ink-900'
                      : 'border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-amber-200'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-amber-600' : 'text-ink-600 dark:text-ink-300'}`}>{date.getDate()}</span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span key={t._id} className={`w-1.5 h-1.5 rounded-full ${t.priority === 'high' ? 'bg-coral-500' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-ink-300'}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-amber-500" />
            <h3 className="font-display font-semibold text-ink-900 dark:text-paper-50">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
            </h3>
          </div>
          {!selectedDate ? (
            <p className="text-sm text-ink-400">Tap a date to see what's due.</p>
          ) : selectedTasks.length === 0 ? (
            <p className="text-sm text-ink-400">Nothing due this day 🌤️</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((t) => (
                <div key={t._id} className="p-3 rounded-xl bg-paper-100 dark:bg-ink-800">
                  <p className="text-sm font-medium text-ink-800 dark:text-paper-50">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge tone={t.priority === 'high' ? 'coral' : t.priority === 'medium' ? 'amber' : 'ink'}>{t.priority}</Badge>
                    <Badge tone="violet">{t.subject}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
