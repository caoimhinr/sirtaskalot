import { GET as getTasks } from '../app/api/tasks/route';
import { POST as createCompletion } from '../app/api/completions/route';

describe('API routes', () => {
  it('returns tasks for the requested date', async () => {
    const response = await getTasks(new Request('http://localhost/api/tasks?date=2026-03-16'));
    const body = await response.json();
    expect(body.tasks).toHaveLength(3);
  });

  it('creates a completion payload', async () => {
    const response = await createCompletion(
      new Request('http://localhost/api/completions', {
        method: 'POST',
        body: JSON.stringify({ taskId: '1', values: { bp: 120 } }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.completion.taskId).toBe('1');
  });
});
