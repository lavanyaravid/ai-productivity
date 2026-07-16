import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper-50 dark:bg-ink-950 text-center px-6">
      <Compass size={40} className="text-amber-400 mb-4" />
      <h1 className="font-display text-4xl font-semibold text-ink-900 dark:text-paper-50 mb-2">Page not found</h1>
      <p className="text-ink-500 dark:text-ink-400 mb-6 max-w-sm">
        Looks like this page wandered off your study desk. Let's get you back.
      </p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
