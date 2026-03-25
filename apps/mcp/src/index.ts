import { demoTasks } from '../../../packages/shared/src/index.ts';

export async function listTasks() {
  return demoTasks.map(({ completionFields, ...task }) => ({ ...task, completionFieldsCount: completionFields.length }));
}

export async function handleMcpRequest(path: string) {
  if (path === 'tasks/list') {
    return { tasks: await listTasks() };
  }

  return { error: 'not_found' };
}
