import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';

const QUOTES = [
  {
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Study smarter, not longer',
  },
  {
    text: 'Small, consistent focus sessions beat last-minute all-nighters, every time.',
    author: 'Your future self will thank you',
  },
  {
    text: 'A goal without a plan is just a wish. Break it into blocks and start today.',
    author: 'One task at a time',
  },
];

export default function AuthLayout({ children, image, quote }) {
  const q = quote || QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper-50 dark:bg-ink-950">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-10 relative">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center glow-ring">
            <Sparkles size={17} className="text-ink-950" />
          </div>
          <span className="font-display font-semibold text-xl text-ink-900 dark:text-paper-50">StudyDesk</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          {children}
        </motion.div>
      </div>

      {/* Right: background image + quote */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src={image}
          alt="A calm, focused study space"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-ink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-violet-500/20" />

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <Quote size={28} className="text-amber-400 mb-4" />
          <p className="font-display text-2xl text-paper-50 leading-snug mb-3 max-w-md">"{q.text}"</p>
          <p className="text-sm text-ink-200">{q.author}</p>
        </div>

        <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-paper-50 text-sm">
            🔥 12-day streaks, made simple
          </div>
        </div>
      </div>
    </div>
  );
}
