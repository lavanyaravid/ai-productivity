import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, CheckSquare, Timer, Target, StickyNote, BarChart3, CalendarClock,
  ArrowRight, Star, Menu, X, Flame, Moon,
} from 'lucide-react';
import { useState } from 'react';
import ProgressRing from '../components/ui/ProgressRing';
import Button from '../components/ui/Button';
import { IMAGES } from '../utils/images';

const TONE_STYLES = {
  amber: { bg: 'bg-amber-50 dark:bg-ink-800', text: 'text-amber-500' },
  violet: { bg: 'bg-violet-300/20 dark:bg-ink-800', text: 'text-violet-500' },
  mint: { bg: 'bg-mint-400/10 dark:bg-ink-800', text: 'text-mint-500' },
  coral: { bg: 'bg-coral-400/10 dark:bg-ink-800', text: 'text-coral-500' },
};

const FEATURES = [
  { icon: CheckSquare, title: 'Task Management', desc: 'Capture, prioritize, and clear your to-dos with a board built for deadlines.', tone: 'amber' },
  { icon: Timer, title: 'Focus Timer', desc: 'Pomodoro sessions with gentle rings that track your deep-work streaks.', tone: 'violet' },
  { icon: CalendarClock, title: 'Study Planner', desc: 'Block out your week by subject so nothing competes for the same hour.', tone: 'mint' },
  { icon: Target, title: 'Goal Tracking', desc: 'Break big ambitions into milestones you can actually check off.', tone: 'coral' },
  { icon: StickyNote, title: 'Smart Notes', desc: 'Pin, tag, and search lecture notes — attach files when you need to.', tone: 'amber' },
  { icon: BarChart3, title: 'Analytics', desc: 'Daily and weekly charts that show exactly where your hours go.', tone: 'violet' },
];

const STEPS = [
  { n: '01', title: 'Plan your week', desc: 'Drop tasks and study blocks onto your calendar in minutes.' },
  { n: '02', title: 'Run focus sessions', desc: 'Start a Pomodoro, silence the noise, and watch the ring fill in.' },
  { n: '03', title: 'Track your growth', desc: 'Streaks, badges and charts keep momentum visible every day.' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50 overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass bg-paper-50/80 dark:bg-ink-950/80 border-b border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center glow-ring">
              <Sparkles size={18} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold text-xl">StudyDesk</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-600 dark:text-ink-300">
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#how" className="hover:text-amber-500 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-amber-500 transition-colors">Stories</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" icon={ArrowRight}>Get started free</Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-4 border-t border-ink-100 dark:border-ink-800 pt-4">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <Link to="/login"><Button variant="outline" className="w-full">Sign in</Button></Link>
            <Link to="/register"><Button className="w-full">Get started free</Button></Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="absolute -top-20 -left-40 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-ink-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-6">
            <Flame size={13} /> Built for students who finish what they start
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] mb-6">
            The calm desk<br /> for your <span className="italic text-amber-500">whole</span> semester.
          </h1>
          <p className="text-lg text-ink-500 dark:text-ink-400 mb-8 max-w-lg">
            Tasks, study plans, goals, notes, and a focus timer — one warm, distraction-free workspace that keeps your streak alive.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>Start studying free</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">I already have an account</Button>
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-10 text-sm text-ink-500 dark:text-ink-400">
            <div className="flex -space-x-2">
              {['a', 'b', 'c', 'd'].map((s) => (
                <img key={s} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s}`} className="w-8 h-8 rounded-full border-2 border-paper-50 dark:border-ink-950" />
              ))}
            </div>
            <span>Joined by students at 120+ universities</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
          <div className="relative rounded-3xl overflow-hidden border border-ink-100 dark:border-ink-800 shadow-2xl">
            <img src={IMAGES.heroDesk} alt="Focused study desk" className="w-full h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -left-6 -bottom-8 bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-ink-100 dark:border-ink-800 p-4 flex items-center gap-4"
          >
            <ProgressRing size={64} stroke={7} progress={72}>
              <Timer size={20} className="text-amber-500" />
            </ProgressRing>
            <div>
              <p className="text-xs text-ink-400">Focus session</p>
              <p className="font-display font-semibold">18:24 remaining</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="absolute -right-4 -top-6 bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-ink-100 dark:border-ink-800 px-4 py-3 flex items-center gap-2.5"
          >
            <Flame size={18} className="text-coral-500" />
            <div>
              <p className="font-display font-semibold text-sm">12-day streak</p>
              <p className="text-xs text-ink-400">Personal best 🎉</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-ink-100 dark:border-ink-800">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">Everything on one desk</h2>
          <p className="text-ink-500 dark:text-ink-400">No more switching between five apps to get through a study session.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, tone }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-amber-300/60 dark:hover:border-amber-400/30 hover:shadow-lg transition-all"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${TONE_STYLES[tone].bg}`}>
                <Icon size={20} className={TONE_STYLES[tone].text} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-ink-950 text-paper-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">Three steps to a calmer semester</h2>
            <p className="text-ink-400">No steep learning curve. Just open it and start.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-2xl bg-ink-900 border border-ink-800"
              >
                <span className="font-display text-5xl text-amber-400/30 font-semibold">{s.n}</span>
                <h3 className="font-display text-xl font-semibold mt-4 mb-2">{s.title}</h3>
                <p className="text-ink-400 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">Loved by focused students</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Meera, Engineering', text: 'The focus ring genuinely gamified my Pomodoro sessions. My streak is 34 days now.' },
            { name: 'Daniel, Pre-Med', text: 'Study planner + analytics finally showed me I was spending zero time on chemistry.' },
            { name: 'Priya, Design', text: 'Notes with pinning and tags replaced three separate apps I used to juggle.' },
          ].map((t) => (
            <div key={t.name} className="p-6 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
              <div className="flex gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-300 mb-4">"{t.text}"</p>
              <p className="text-sm font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-ink-900 to-ink-950 border border-ink-800 p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <Moon size={28} className="text-amber-400 mx-auto mb-5" />
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-paper-50 mb-4">
            Your best semester starts with today's session.
          </h2>
          <p className="text-ink-400 mb-8 max-w-md mx-auto">Free to use. No credit card. Just you, your goals, and one calm desk.</p>
          <Link to="/register">
            <Button size="lg" icon={ArrowRight}>Create your free account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 dark:border-ink-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
              <Sparkles size={14} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold">StudyDesk</span>
          </div>
          <p className="text-sm text-ink-400">© {new Date().getFullYear()} StudyDesk. Built for focused students.</p>
        </div>
      </footer>
    </div>
  );
}
