import api from './api';

export const analyticsService = {
  dashboard: () => api.get('/analytics/dashboard').then((r) => r.data),
  weekly: () => api.get('/analytics/weekly').then((r) => r.data),
  subjects: () => api.get('/analytics/subjects').then((r) => r.data),
  taskDistribution: () => api.get('/analytics/tasks-distribution').then((r) => r.data),
};
