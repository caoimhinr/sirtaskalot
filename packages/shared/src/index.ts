import { z } from 'zod';

export const taskCompletionFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['select', 'number', 'text', 'checkbox']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().min(1),
  description: z.string().default(''),
  date: z.string(),
  allDay: z.boolean(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  completionFields: z.array(taskCompletionFieldSchema).default([]),
  completed: z.boolean().default(false),
});

export const taskCompletionSubmissionSchema = z.object({
  taskId: z.string(),
  values: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskCompletionField = z.infer<typeof taskCompletionFieldSchema>;
export type TaskCompletionSubmission = z.infer<typeof taskCompletionSubmissionSchema>;

export const demoTasks: Task[] = [
  {
    id: '1',
    name: 'Morning meds',
    icon: '💊',
    description: 'Take blood pressure medication',
    date: '2026-03-16',
    allDay: false,
    startTime: '08:00',
    endTime: '08:15',
    completed: false,
    completionFields: [
      { id: 'bp', label: 'Blood pressure', type: 'number', required: true },
    ],
  },
  {
    id: '2',
    name: 'Walk the dog',
    icon: '🐕',
    description: '20 minute walk around the block',
    date: '2026-03-16',
    allDay: true,
    startTime: null,
    endTime: null,
    completed: true,
    completionFields: [
      { id: 'mood', label: 'Dog mood', type: 'select', required: false, options: ['Happy', 'Sleepy', 'Zoomies'] },
    ],
  },
];
