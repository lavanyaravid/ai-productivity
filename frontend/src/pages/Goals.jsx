import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Target, Trash2, Pencil, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
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
import ProgressRing from '../components/ui/ProgressRing';
import { goalService } from '../services/goalService';

const categoryTone = { academic: 'amber', personal: 'violet', career: 'mint', skill: 'coral', other: 'ink' };

function GoalModal({ open, onClose, onSaved, goal }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? { title: goal.title, description: goal.description, category: goal.category, targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '' }
          : { category: 'academic' }
      );
    }
  }, [open, goal, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (goal) {
        await goalService.update(goal._id, data);
        toast.success('Goal updated');
      } else {
        await goalService.create(data);
        toast.success('Goal created');
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
    <Modal open={open} onClose={onClose} title={goal ? 'Edit goal' : 'New goal'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" placeholder="Finish research paper draft" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
        <TextArea label="Description" rows={3} placeholder="Why does this goal matter?" {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" {...register('category')}>
            <option value="academic">Academic</option>
            <option value="personal">Personal</option>
            <option value="career">Career</option>
            <option value="skill">Skill</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Target date" type="date" icon={Calendar} {...register('targetDate')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>{goal ? 'Save changes' : 'Create goal'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function GoalCard({ goal, onEdit, onDelete, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    setAdding(true);
    try {
      await goalService.addMilestone(goal._id, { title: milestoneTitle.trim() });
      setMilestoneTitle('');
      onRefresh();
    } catch {
      toast.error('Could not add milestone');
    } finally {
      setAdding(false);
    }
  };

  const toggleMilestone = async (milestoneId) => {
    try {
      await goalService.toggleMilestone(goal._id, milestoneId);
      onRefresh();
    } catch {
      toast.error('Could not update milestone');
    }
  };

  return (
    <Card className="p-5" hover>
      <div className="flex items-start gap-4">
        <ProgressRing size={64} stroke={6} progress={goal.progress} color={goal.status === 'completed' ? 'var(--color-mint-500)' : 'var(--color-amber-400)'}>
          <span className="text-sm font-display font-semibold text-ink-900 dark:text-paper-50">{goal.progress}%</span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-ink-900 dark:text-paper-50">{goal.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg text-ink-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-ink-800">
                <Pencil size={14} />
              </button>
              <button onClick={() => onDelete(goal._id)} className="p-1.5 rounded-lg text-ink-400 hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-ink-800">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {goal.description && <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 line-clamp-2">{goal.description}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <Badge tone={categoryTone[goal.category]}>{goal.category}</Badge>
            {goal.status === 'completed' && <Badge tone="mint">Completed 🎉</Badge>}
            {goal.targetDate && (
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <Calendar size={12} /> {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-amber-600 mt-4 font-medium"
      >
        {goal.milestones?.length || 0} milestone{goal.milestones?.length !== 1 ? 's' : ''}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 pt-3 border-t border-ink-100 dark:border-ink-800">
          {(goal.milestones || []).map((m) => (
            <div key={m._id} className="flex items-center gap-2.5">
              <Checkbox checked={m.isCompleted} onChange={() => toggleMilestone(m._id)} />
              <span className={`text-sm ${m.isCompleted ? 'line-through text-ink-400' : 'text-ink-700 dark:text-ink-200'}`}>{m.title}</span>
            </div>
          ))}
          <form onSubmit={addMilestone} className="flex gap-2 pt-1">
            <input
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="Add a milestone..."
              className="flex-1 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none focus:border-amber-400"
            />
            <Button type="submit" size="sm" loading={adding}>Add</Button>
          </form>
        </div>
      )}
    </Card>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalService.getAll(statusFilter ? { status: statusFilter } : {});
      setGoals(res.goals || []);
    } catch {
      toast.error('Could not load goals');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalService.remove(id);
      toast.success('Goal deleted');
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch {
      toast.error('Could not delete goal');
    }
  };

  const openNew = () => { setEditingGoal(null); setModalOpen(true); };
  const openEdit = (goal) => { setEditingGoal(goal); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Goals</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Break big ambitions into milestones you can check off.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>New goal</Button>
      </div>

      <div className="flex gap-2">
        {['active', 'completed', 'abandoned', ''].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-ink-900 text-paper-50 dark:bg-amber-400 dark:text-ink-950' : 'bg-white dark:bg-ink-900 text-ink-500 dark:text-ink-400 border border-ink-100 dark:border-ink-800'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading goals..." />
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No goals here"
            description="Set a goal, break it into milestones, and watch the ring fill up."
            action={<Button icon={Plus} onClick={openNew}>Set a goal</Button>}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onEdit={openEdit} onDelete={handleDelete} onRefresh={load} />
          ))}
        </div>
      )}

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} goal={editingGoal} />
    </div>
  );
}
