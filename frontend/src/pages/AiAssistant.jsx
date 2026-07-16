import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles, Send, Plus, Trash2, MessageSquare, Search, Menu, X, Bot, User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Economics', 'Other'];

const SUGGESTED_PROMPTS = [
  'Explain this concept in simple terms',
  'Help me create a study plan for my exam',
  'Quiz me on key topics for this subject',
  'What should I study next?',
];

function MessageBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser ? 'bg-violet-400/20 text-violet-500' : 'bg-amber-400/20 text-amber-500'
        }`}
      >
        {isUser ? <UserIcon size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
          isUser
            ? 'bg-ink-900 text-paper-50 dark:bg-ink-800 rounded-tr-sm'
            : 'bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 text-ink-800 dark:text-ink-100 rounded-tl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/20 text-amber-500">
        <Bot size={15} />
      </div>
      <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AiAssistant() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [sending, setSending] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await aiService.getConversations(params);
      setConversations(res.conversations || []);
    } catch {
      toast.error('Could not load your conversations');
    } finally {
      setLoadingList(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadConversations, 250);
    return () => clearTimeout(t);
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation, sending]);

  const openConversation = async (id) => {
    setMobileListOpen(false);
    setLoadingConversation(true);
    try {
      const res = await aiService.getConversation(id);
      setActiveConversation(res.conversation);
      setSubject(res.conversation.subject || 'General');
    } catch {
      toast.error('Could not load this conversation');
    } finally {
      setLoadingConversation(false);
    }
  };

  const startNewChat = () => {
    setActiveConversation(null);
    setInput('');
    setMobileListOpen(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation permanently?')) return;
    try {
      await aiService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversation?._id === id) setActiveConversation(null);
      toast.success('Conversation deleted');
    } catch {
      toast.error('Could not delete conversation');
    }
  };

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    // Optimistic update
    const optimisticUserMsg = { role: 'user', content: text };
    setActiveConversation((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, optimisticUserMsg] }
        : { title: text.slice(0, 60), subject, messages: [optimisticUserMsg] }
    );

    try {
      const res = await aiService.sendMessage({
        conversationId: activeConversation?._id,
        message: text,
        subject,
      });
      setActiveConversation(res.conversation);
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The AI Study Assistant could not respond right now');
      // Roll back optimistic message on failure
      setActiveConversation((prev) =>
        prev ? { ...prev, messages: prev.messages.slice(0, -1) } : null
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50 flex items-center gap-2">
            <Sparkles size={24} className="text-amber-400" /> AI Study Assistant
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Ask questions, get concepts explained, and plan your studying.</p>
        </div>
        <Button
          variant="outline"
          icon={mobileListOpen ? X : Menu}
          className="lg:hidden"
          onClick={() => setMobileListOpen((v) => !v)}
        >
          Conversations
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-[65vh]">
        {/* Conversation list */}
        <Card className={`flex-col p-3 lg:flex ${mobileListOpen ? 'flex' : 'hidden'}`}>
          <Button icon={Plus} onClick={startNewChat} className="w-full mb-3">
            New chat
          </Button>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            {loadingList ? (
              <Loader size={22} label="Loading..." />
            ) : conversations.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">No conversations yet. Ask something to get started!</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => openConversation(c._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm group transition-colors ${
                    activeConversation?._id === c._id
                      ? 'bg-amber-50 dark:bg-amber-400/10'
                      : 'hover:bg-ink-50 dark:hover:bg-ink-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink-800 dark:text-paper-50 truncate flex-1">{c.title}</p>
                    <Trash2
                      size={13}
                      className="text-ink-300 hover:text-coral-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(c._id, e)}
                    />
                  </div>
                  <p className="text-xs text-ink-400 truncate mt-0.5">{c.preview || 'New conversation'}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat window */}
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-ink-100 dark:border-ink-800">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare size={16} className="text-ink-400 shrink-0" />
              <p className="text-sm font-medium text-ink-800 dark:text-paper-50 truncate">
                {activeConversation?.title || 'New conversation'}
              </p>
            </div>
            <Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!!activeConversation}
              className="!w-auto !py-1.5 !text-xs shrink-0"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {loadingConversation ? (
              <Loader label="Loading conversation..." />
            ) : !activeConversation || activeConversation.messages.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title={`Hey ${user?.firstName || 'there'}, what are we studying today?`}
                description="Ask a question, paste a concept you're stuck on, or get help planning your revision."
                action={
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-xs px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-amber-400 hover:text-amber-600 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                }
              />
            ) : (
              <AnimatePresence initial={false}>
                {activeConversation.messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <MessageBubble role={m.role} content={m.content} />
                  </motion.div>
                ))}
                {sending && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="typing">
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 border-t border-ink-100 dark:border-ink-800">
            <div className="flex items-end gap-2 bg-paper-50 dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 px-3 py-2 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a concept, request a study plan, or paste a doubt..."
                rows={1}
                className="flex-1 bg-transparent outline-none text-sm resize-none py-1.5 max-h-32 text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
              />
              <Button
                size="sm"
                icon={Send}
                onClick={() => send()}
                loading={sending}
                disabled={!input.trim()}
              >
                Send
              </Button>
            </div>
            <p className="text-[11px] text-ink-400 mt-1.5 px-1">Press Enter to send, Shift+Enter for a new line.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
