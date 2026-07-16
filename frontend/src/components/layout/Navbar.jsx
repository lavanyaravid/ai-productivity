import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out. See you soon!');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-white/80 dark:bg-ink-900/80 glass border-b border-ink-100 dark:border-ink-800">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-ink-600 dark:text-ink-300">
          <Menu size={22} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-paper-100 dark:bg-ink-800 rounded-xl px-3.5 py-2 max-w-xs w-full text-ink-400">
          <Search size={16} />
          <input
            placeholder="Search tasks, notes, goals..."
            className="bg-transparent outline-none text-sm w-full text-ink-700 dark:text-ink-200 placeholder:text-ink-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative p-2.5 rounded-xl text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral-500" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl shadow-xl p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-ink-800 dark:text-paper-50">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-amber-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-8">You're all caught up ✨</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors ${
                      !n.isRead ? 'bg-amber-50/60 dark:bg-amber-400/5' : ''
                    }`}
                  >
                    <p className="font-medium text-ink-800 dark:text-paper-50">{n.title}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{n.message}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <img
              src={user?.avatar?.url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || 'student'}`}
              alt={user?.fullName}
              className="w-8 h-8 rounded-lg object-cover bg-amber-100"
            />
            <span className="hidden sm:block text-sm font-medium text-ink-700 dark:text-ink-200 max-w-[100px] truncate">
              {user?.firstName}
            </span>
            <ChevronDown size={14} className="hidden sm:block text-ink-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl shadow-xl p-1.5">
              <button
                onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-sm text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
