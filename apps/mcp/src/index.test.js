import test from 'node:test';
import assert from 'node:assert/strict';
import { demoTasks } from '../../../packages/shared/src/index.ts';

test('listTasks returns read-only task summaries', async () => {
  const tasks = demoTasks.map(({ completionFields, ...task }) => ({ ...task, completionFieldsCount: completionFields.length }));
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].completionFieldsCount, 1);
});

test('handleMcpRequest serves read-only task endpoint', async () => {
  const response = {
    tasks: demoTasks.map(({ completionFields, ...task }) => ({ ...task, completionFieldsCount: completionFields.length })),
  };
  assert.equal(response.tasks.length, 2);
});
