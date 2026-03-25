import { CalendarView } from '../components/calendar-view';
import { getTasksForDate } from '../lib/tasks';

export default async function HomePage() {
  const tasks = await getTasksForDate('2026-03-16');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-6 md:max-w-5xl md:px-6">
      <section className="rounded-[2rem] border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">SirTaskalot</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">A calendar for every task that matters.</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Built mobile-first for quick check-offs, flexible completion forms, OAuth accounts, Redis caching,
              and observability-friendly automation.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Sign in options</p>
            <ul className="mt-2 space-y-1 pl-4">
              <li>Google OAuth</li>
              <li>GitHub OAuth</li>
              <li>Local account via NextAuth adapter-ready stack</li>
            </ul>
          </div>
        </div>
      </section>
      <CalendarView tasks={tasks} />
    </main>
  );
}
