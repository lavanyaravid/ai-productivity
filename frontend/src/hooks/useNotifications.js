import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getAll();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      /* silent — non-critical UI */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    load();
  };

  return { notifications, unreadCount, markRead, markAllRead, reload: load };
}
