import { completeTask, getTasksForDate, clearTaskCache } from '../lib/tasks';

describe('task service', () => {
  beforeEach(() => clearTaskCache());

  it('returns tasks for a date', async () => {
    const tasks = await getTasksForDate('2026-03-16');
    expect(tasks).toHaveLength(3);
    expect(tasks[0]?.name).toBe('Morning meds');
  });

  it('validates completion payloads', async () => {
    await expect(completeTask({ taskId: '1', values: { bp: 120 } })).resolves.toMatchObject({ taskId: '1' });
  });
});
