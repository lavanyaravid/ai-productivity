import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, CalendarClock, Trash2, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { studyPlanService } from '../services/studyPlanService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_COLORS = ['#F5B841', '#7C86FF', '#4FD1A5', '#FF8577', '#F5B841', '#7C86FF', '#4FD1A5'];

function NewPlanModal({ open, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) reset(); }, [open, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await studyPlanService.create(data);
      toast.success('Study plan created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New weekly study plan">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Plan title" placeholder="Midterms week" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
        <TextArea label="Description" rows={2} {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" error={errors.startDate?.message} {...register('startDate', { required: 'Required' })} />
          <Input label="End date" type="date" error={errors.endDate?.message} {...register('endDate', { required: 'Required' })} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>Create plan</Button>
        </div>
      </form>
    </Modal>
  );
}

function BlockModal({ open, onClose, onSaved, planId }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) reset({ day: 'Monday' }); }, [open, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await studyPlanService.addBlock(planId, data);
      toast.success('Study block added');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add block');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add study block">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Subject" placeholder="Organic Chemistry" error={errors.subject?.message} {...register('subject', { required: 'Required' })} />
        <Select label="Day" {...register('day', { required: true })}>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start time" type="time" error={errors.startTime?.message} {...register('startTime', { required: 'Required' })} />
          <Input label="End time" type="time" error={errors.endTime?.message} {...register('endTime', { required: 'Required' })} />
        </div>
        <TextArea label="Notes" rows={2} {...register('notes')} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>Add block</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StudyPlanner() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studyPlanService.getActive();
      setPlan(res.plan);
    } catch {
      toast.error('Could not load study plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (block) => {
    try {
      await studyPlanService.updateBlock(plan._id, block._id, { isCompleted: !block.isCompleted });
      load();
    } catch {
      toast.error('Could not update block');
    }
  };

  const deleteBlock = async (blockId) => {
    try {
      await studyPlanService.deleteBlock(plan._id, blockId);
      toast.success('Block removed');
      load();
    } catch {
      toast.error('Could not remove block');
    }
  };

  if (loading) return <Loader label="Loading your study plan..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Study Planner</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Block your week out by subject so nothing overlaps.</p>
        </div>
        {plan && <Button icon={Plus} onClick={() => setBlockModalOpen(true)}>Add block</Button>}
      </div>

      {!plan ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="No active study plan"
            description="Create a weekly plan and start scheduling focused study blocks by subject."
            action={<Button icon={Plus} onClick={() => setPlanModalOpen(true)}>Create a plan</Button>}
          />
        </Card>
      ) : (
        <>
          <Card className="p-5 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">{plan.title}</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                {new Date(plan.startDate).toLocaleDateString()} — {new Date(plan.endDate).toLocaleDateString()}
              </p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {DAYS.map((day, i) => {
              const blocks = (plan.blocks || []).filter((b) => b.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DAY_COLORS[i] }} />
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{day.slice(0, 3)}</h3>
                  </div>
                  <div className="space-y-2">
                    {blocks.length === 0 ? (
                      <p className="text-xs text-ink-300 dark:text-ink-600 py-4 text-center border border-dashed border-ink-200 dark:border-ink-800 rounded-xl">Free</p>
                    ) : (
                      blocks.map((b) => (
                        <Card key={b._id} className="p-3" hover>
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-xs font-semibold ${b.isCompleted ? 'line-through text-ink-400' : 'text-ink-900 dark:text-paper-50'}`}>{b.subject}</p>
                            <button onClick={() => deleteBlock(b._id)} className="text-ink-300 hover:text-coral-500">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] text-ink-400 flex items-center gap-1 mt-1">
                            <Clock size={10} /> {b.startTime}–{b.endTime}
                          </p>
                          <button
                            onClick={() => toggleBlock(b)}
                            className={`mt-2 w-full flex items-center justify-center gap-1 text-[11px] py-1 rounded-lg ${
                              b.isCompleted ? 'bg-mint-400/10 text-mint-500' : 'bg-paper-100 dark:bg-ink-800 text-ink-400'
                            }`}
                          >
                            <Check size={11} /> {b.isCompleted ? 'Done' : 'Mark done'}
                          </button>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <NewPlanModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} onSaved={load} />
      {plan && <BlockModal open={blockModalOpen} onClose={() => setBlockModalOpen(false)} onSaved={load} planId={plan._id} />}
    </div>
  );
}
