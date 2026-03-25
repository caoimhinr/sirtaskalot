import {
  demoTasks,
  taskCompletionSubmissionSchema,
  taskSchema,
  type Task,
  type TaskCompletionSubmission,
} from '../../../../packages/shared/src/index';
import { trackUserAction } from './telemetry';
import { redis } from './redis';

const cache = new Map<string, Task[]>();

export async function getTasksForDate(date: string): Promise<Task[]> {
  const inMemory = cache.get(date);
  if (inMemory) return inMemory;

  try {
    const cached = await redis.get(`tasks:${date}`);
    if (cached) {
      const parsed = JSON.parse(cached) as Task[];
      cache.set(date, parsed);
      return parsed;
    }
  } catch {
    // ignore cache failures in local/dev
  }

  const tasks = demoTasks.filter((task) => task.date === date).map((task) => taskSchema.parse(task));
  cache.set(date, tasks);

  try {
    await redis.set(`tasks:${date}`, JSON.stringify(tasks), 'EX', 60);
  } catch {
    // ignore cache failures in local/dev
  }

  return tasks;
}

export async function completeTask(input: TaskCompletionSubmission) {
  const parsed = taskCompletionSubmissionSchema.parse(input);
  await trackUserAction({
    action: 'task.completed',
    metadata: { taskId: parsed.taskId, fieldCount: Object.keys(parsed.values).length },
  });
  return parsed;
}

export function clearTaskCache() {
  cache.clear();
}
