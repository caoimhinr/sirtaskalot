import { CalendarView } from '../components/calendar-view';
import { AppShell } from '../components/app-shell';
import { getTasksForDate } from '../lib/tasks';

export default async function HomePage() {
  const tasks = await getTasksForDate('2026-03-16');

  return (
    <AppShell>
      <CalendarView tasks={tasks} />
    </AppShell>
  );
}
