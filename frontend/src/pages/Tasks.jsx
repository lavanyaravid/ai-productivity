import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, Search, Trash2, Pencil, Calendar, Tag, ListFilter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Checkbox from '../components/ui/Checkbox';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { taskService } from '../services/taskService';

const priorityTone = { high: 'coral', medium: 'amber', low: 'ink' };

function TaskModal({ open, onClose, onSaved, task }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description,
              subject: task.subject,
              priority: task.priority,
              dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
              tags: (task.tags || []).join(', '),
            }
          : { priority: 'medium', subject: 'General' }
      );
    }
  }, [open, task, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (task) {
        await taskService.update(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Finish chapter 4 problem set"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required', maxLength: { value: 150, message: 'Too long' } })}
        />
        <TextArea label="Description" rows={3} placeholder="Optional details..." {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Subject" placeholder="Mathematics" {...register('subject')} />
          <Select label="Priority" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Due date" type="date" icon={Calendar} {...register('dueDate')} />
          <Input label="Tags" icon={Tag} placeholder="exam, urgent" {...register('tags')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>{task ? 'Save changes' : 'Create task'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await taskService.getAll(params);
      setTasks(res.tasks || []);
    } catch {
      toast.error('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleToggle = async (task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)));
    try {
      await taskService.toggle(task._id);
    } catch {
      toast.error('Could not update task');
      load();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.remove(id);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error('Could not delete task');
    }
  };

  const openNew = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Tasks</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} in view</p>
        </div>
        <Button icon={Plus} onClick={openNew}>New task</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none"
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none"
          >
            <option value="">All priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Loader label="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListFilter}
            title="No tasks yet"
            description="Add your first task and start chipping away at your to-do list."
            action={<Button icon={Plus} onClick={openNew}>Add a task</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-4 flex items-start gap-3.5" hover>
                  <button onClick={() => handleToggle(task)} className="mt-0.5">
                    <Checkbox checked={task.status === 'completed'} onChange={() => handleToggle(task)} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-ink-900 dark:text-paper-50 ${task.status === 'completed' ? 'line-through text-ink-400 dark:text-ink-500' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                      <Badge tone="violet">{task.subject}</Badge>
                      {task.dueDate && (
                        <span className="text-xs text-ink-400 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(task)} className="p-2 rounded-lg text-ink-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-ink-800 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-2 rounded-lg text-ink-400 hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-ink-800 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} task={editingTask} />
    </div>
  );
}
