import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, Search, Pin, Archive, Trash2, Pencil, StickyNote as StickyIcon,
  FileText, Sparkles, Download, Upload, ListChecks, BookOpenCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { noteService } from '../services/noteService';

const COLORS = ['#F5B841', '#7C86FF', '#4FD1A5', '#FF8577', '#A3A3AC'];

function NoteModal({ open, onClose, onSaved, note }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const color = watch('color');

  useEffect(() => {
    if (open) {
      reset(
        note
          ? { title: note.title, content: note.content, subject: note.subject, color: note.color, tags: (note.tags || []).join(', ') }
          : { color: COLORS[0], subject: 'General' }
      );
    }
  }, [open, note, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (note) {
        await noteService.update(note._id, payload);
        toast.success('Note updated');
      } else {
        await noteService.create(payload);
        toast.success('Note created');
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
    <Modal open={open} onClose={onClose} title={note ? 'Edit note' : 'New note'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" placeholder="Lecture 5 — Thermodynamics" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
        <TextArea label="Content" rows={6} placeholder="Write your notes here..." {...register('content')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Subject" placeholder="Physics" {...register('subject')} />
          <Input label="Tags" placeholder="exam, chapter3" {...register('tags')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Color</label>
          <div className="flex gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-ink-900 dark:border-paper-50 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>{note ? 'Save changes' : 'Create note'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PdfSummaryModal({ open, onClose, note, onUpdated }) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, note?._id]);

  const hasSummary = !!note?.aiSummary?.summary;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      toast.error('PDF must be under 15MB');
      return;
    }
    setFile(selected);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await noteService.uploadPdf(note._id, formData);
      toast.success('AI summary generated!');
      onUpdated(res.note);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process this PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await noteService.downloadSummary(note._id);
      const url = window.URL.createObjectURL(new Blob([blob.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.title || 'note'}-summary.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download summary');
    } finally {
      setDownloading(false);
    }
  };

  if (!note) return null;

  return (
    <Modal open={open} onClose={onClose} title="PDF Summary" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-paper-100 dark:bg-ink-800 rounded-xl p-3.5">
          <label className="flex-1 flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
            <Upload size={16} className="text-ink-400 shrink-0" />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white dark:file:bg-ink-900 file:text-ink-700 dark:file:text-ink-200 file:text-xs w-full"
            />
          </label>
          <Button size="sm" icon={Sparkles} onClick={handleGenerate} loading={processing} disabled={!file}>
            {hasSummary ? 'Regenerate' : 'Generate summary'}
          </Button>
        </div>

        {processing && <Loader label="Reading your PDF and generating study materials..." />}

        {!processing && !hasSummary && (
          <EmptyState
            icon={FileText}
            title="No summary yet"
            description="Upload a lecture PDF above to generate an AI summary, key points, revision notes, and important topics."
          />
        )}

        {!processing && hasSummary && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-400">
                From <span className="font-medium text-ink-600 dark:text-ink-300">{note.aiSummary.sourceFileName}</span>
                {note.aiSummary.generatedAt && ` · ${new Date(note.aiSummary.generatedAt).toLocaleString()}`}
              </p>
              <Button size="sm" variant="outline" icon={Download} onClick={handleDownload} loading={downloading}>
                Download
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink-800 dark:text-paper-50 flex items-center gap-1.5 mb-1.5">
                <Sparkles size={14} className="text-amber-500" /> Summary
              </h4>
              <p className="text-sm text-ink-600 dark:text-ink-300 whitespace-pre-line leading-relaxed">{note.aiSummary.summary}</p>
            </div>

            {note.aiSummary.keyPoints?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-ink-800 dark:text-paper-50 flex items-center gap-1.5 mb-1.5">
                  <ListChecks size={14} className="text-mint-500" /> Key Points
                </h4>
                <ul className="space-y-1.5">
                  {note.aiSummary.keyPoints.map((p, i) => (
                    <li key={i} className="text-sm text-ink-600 dark:text-ink-300 flex gap-2">
                      <span className="text-mint-500 mt-0.5">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {note.aiSummary.revisionNotes && (
              <div>
                <h4 className="text-sm font-semibold text-ink-800 dark:text-paper-50 flex items-center gap-1.5 mb-1.5">
                  <BookOpenCheck size={14} className="text-violet-500" /> Revision Notes
                </h4>
                <p className="text-sm text-ink-600 dark:text-ink-300 whitespace-pre-line leading-relaxed bg-paper-50 dark:bg-ink-800 rounded-xl p-3.5">
                  {note.aiSummary.revisionNotes}
                </p>
              </div>
            )}

            {note.aiSummary.importantTopics?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-ink-800 dark:text-paper-50 mb-2">Important Topics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {note.aiSummary.importantTopics.map((t) => (
                    <Badge key={t} tone="coral">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalNote, setPdfModalNote] = useState(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { archived: showArchived };
      if (search) params.search = search;
      const res = await noteService.getAll(params);
      setNotes(res.notes || []);
    } catch {
      toast.error('Could not load notes');
    } finally {
      setLoading(false);
    }
  }, [search, showArchived]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const togglePin = async (id) => {
    try {
      await noteService.togglePin(id);
      load();
    } catch {
      toast.error('Could not update note');
    }
  };

  const toggleArchive = async (id) => {
    try {
      await noteService.toggleArchive(id);
      toast.success(showArchived ? 'Note restored' : 'Note archived');
      load();
    } catch {
      toast.error('Could not update note');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note permanently?')) return;
    try {
      await noteService.remove(id);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error('Could not delete note');
    }
  };

  const openNew = () => { setEditingNote(null); setModalOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setModalOpen(true); };
  const openPdfModal = (note) => { setPdfModalNote(note); setPdfModalOpen(true); };
  const handlePdfSummaryUpdated = (updatedNote) => {
    setPdfModalNote(updatedNote);
    setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">Notes</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Your lecture notes and quick thoughts, all searchable.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>New note</Button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <Button variant={showArchived ? 'primary' : 'outline'} icon={Archive} onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Viewing archive' : 'Archived'}
        </Button>
      </Card>

      {loading ? (
        <Loader label="Loading notes..." />
      ) : notes.length === 0 ? (
        <Card>
          <EmptyState
            icon={StickyIcon}
            title={showArchived ? 'No archived notes' : 'No notes yet'}
            description="Capture what matters from your lectures and readings."
            action={!showArchived && <Button icon={Plus} onClick={openNew}>Write a note</Button>}
          />
        </Card>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="break-inside-avoid"
              >
                <Card className="p-5 border-t-4" style={{ borderTopColor: note.color }} hover>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-semibold text-ink-900 dark:text-paper-50">{note.title}</h3>
                    <button onClick={() => togglePin(note._id)}>
                      <Pin size={15} className={note.isPinned ? 'fill-amber-400 text-amber-400' : 'text-ink-300'} />
                    </button>
                  </div>
                  <p className="text-sm text-ink-500 dark:text-ink-400 whitespace-pre-line line-clamp-6">{note.content}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge tone="violet">{note.subject}</Badge>
                    {note.aiSummary?.summary && (
                      <Badge tone="mint" className="inline-flex items-center gap-1">
                        <Sparkles size={10} /> AI Summary
                      </Badge>
                    )}
                    {(note.tags || []).map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-ink-100 dark:border-ink-800">
                    <button
                      onClick={() => openPdfModal(note)}
                      title="PDF Summary"
                      className={`p-2 rounded-lg hover:bg-mint-400/10 ${note.aiSummary?.summary ? 'text-mint-500' : 'text-ink-400 hover:text-mint-500'}`}
                    >
                      <FileText size={14} />
                    </button>
                    <button onClick={() => openEdit(note)} className="p-2 rounded-lg text-ink-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-ink-800">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleArchive(note._id)} className="p-2 rounded-lg text-ink-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-ink-800">
                      <Archive size={14} />
                    </button>
                    <button onClick={() => handleDelete(note._id)} className="p-2 rounded-lg text-ink-400 hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-ink-800">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <NoteModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} note={editingNote} />
      <PdfSummaryModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        note={pdfModalNote}
        onUpdated={handlePdfSummaryUpdated}
      />
    </div>
  );
}
