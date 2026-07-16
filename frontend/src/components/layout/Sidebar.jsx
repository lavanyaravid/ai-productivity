import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, StickyNote, Target, CalendarClock,
  Timer, BarChart3, CalendarDays, User, Sparkles, X, Bot,
} from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/study-planner', label: 'Study Planner', icon: CalendarClock },
  { to: '/pomodoro', label: 'Focus Timer', icon: Timer },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-ink-950/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-ink-900 border-r border-ink-100 dark:border-ink-800 z-50 lg:z-0 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center glow-ring">
              <Sparkles size={16} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">StudyDesk</span>
          </a>
          <button onClick={onClose} className="lg:hidden text-ink-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 dark:from-amber-400/10 dark:to-violet-400/10 text-center">
          <p className="text-xs text-ink-300 dark:text-ink-400 mb-2">Keep the streak alive 🔥</p>
          <p className="font-display text-sm text-paper-50 dark:text-paper-50">Small sessions, every day.</p>
        </div>
      </motion.aside>
    </>
  );
}
