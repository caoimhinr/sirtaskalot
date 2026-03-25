'use client';

import React, { useMemo, useState } from 'react';
import type { Task, TaskCompletionField, TaskStatus } from '@sirtaskalot/shared';
import { TaskCard } from './task-card';
import { CompletionSheet } from './completion-sheet';

type CalendarViewProps = {
  tasks: Task[];
};

type ScheduledLayoutItem = {
  task: Task;
  top: number;
  height: number;
  column: number;
  columns: number;
};

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const HOUR_ROW_HEIGHT = 104;
const MIN_EVENT_HEIGHT = 92;

function parseTimeToMinutes(value: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function shiftDate(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

function formatDateLabel(date: string | undefined) {
  if (!date) return 'Today';

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Today';

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

function normalizeTask(task: Task): Task {
  const status = task.status ?? (task.completed ? 'completed' : 'default');
  return {
    ...task,
    status,
    completed: status === 'completed',
  };
}

function buildScheduledLayout(tasks: Task[]): ScheduledLayoutItem[] {
  const scheduled = tasks
    .filter((task) => !task.allDay && task.startTime && task.endTime)
    .map((task) => {
      const startMinutes = parseTimeToMinutes(task.startTime) ?? DAY_START_HOUR * 60;
      const endMinutes = parseTimeToMinutes(task.endTime) ?? startMinutes + 30;
      const dayStartMinutes = DAY_START_HOUR * 60;
      const dayEndMinutes = DAY_END_HOUR * 60;
      const safeStart = Math.max(startMinutes, dayStartMinutes);
      const safeEnd = Math.min(endMinutes, dayEndMinutes);
      const durationMinutes = Math.max(safeEnd - safeStart, 30);

      return {
        task,
        startMinutes: safeStart,
        endMinutes: Math.max(safeEnd, safeStart + 30),
        top: ((safeStart - dayStartMinutes) / 60) * HOUR_ROW_HEIGHT,
        height: Math.max((durationMinutes / 60) * HOUR_ROW_HEIGHT, MIN_EVENT_HEIGHT),
        column: 0,
        columns: 1,
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  const active: typeof scheduled = [];
  let cluster: typeof scheduled = [];

  function finalizeCluster() {
    if (cluster.length === 0) return;
    const totalColumns = Math.max(...cluster.map((item) => item.column)) + 1;
    cluster.forEach((item) => {
      item.columns = totalColumns;
    });
    cluster = [];
  }

  for (const item of scheduled) {
    for (let index = active.length - 1; index >= 0; index -= 1) {
      if (active[index].endMinutes <= item.startMinutes) {
        active.splice(index, 1);
      }
    }

    if (active.length === 0) {
      finalizeCluster();
    }

    let column = 0;
    while (active.some((entry) => entry.column === column)) {
      column += 1;
    }

    item.column = column;
    active.push(item);
    cluster.push(item);
  }

  finalizeCluster();

  return scheduled.map(({ startMinutes: _start, endMinutes: _end, ...item }) => item);
}

function createEmptyTask(date: string): Task {
  return {
    id: `new-${crypto.randomUUID()}`,
    name: 'New task',
    icon: '📝',
    description: '',
    date,
    allDay: false,
    startTime: '09:00',
    endTime: '09:30',
    completionFields: [],
    completed: false,
    status: 'default',
  };
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [taskItems, setTaskItems] = useState(() => tasks.map(normalizeTask));
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(tasks[0]?.date ?? '2026-03-16');

  const visibleTasks = useMemo(() => taskItems.filter((task) => task.date === selectedDate), [selectedDate, taskItems]);

  const selectedTask = useMemo(
    () => taskItems.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, taskItems],
  );

  const grouped = useMemo(() => {
    const allDay = visibleTasks.filter((task) => task.allDay || !task.startTime || !task.endTime);
    const scheduled = buildScheduledLayout(visibleTasks);
    return { allDay, scheduled };
  }, [visibleTasks]);

  const hourLabels = useMemo(
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => DAY_START_HOUR + index),
    [],
  );

  const timelineHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_ROW_HEIGHT;
  const dateLabel = formatDateLabel(selectedDate);

  function openTask(task: Task) {
    setSelectedTaskId(task.id);
    setIsCreatingTask(false);
  }

  function openNewTask() {
    const newTask = createEmptyTask(selectedDate);
    setTaskItems((current) => [...current, newTask]);
    setSelectedTaskId(newTask.id);
    setFormValues({});
    setIsCreatingTask(true);
  }

  function updateSelectedTask(field: 'name' | 'description' | 'date' | 'startTime' | 'endTime' | 'allDay' | 'icon', value: string | boolean) {
    if (!selectedTaskId) return;

    setTaskItems((current) =>
      current.map((task) => {
        if (task.id !== selectedTaskId) return task;

        if (field === 'allDay' && typeof value === 'boolean') {
          return {
            ...task,
            allDay: value,
            startTime: value ? null : task.startTime ?? '09:00',
            endTime: value ? null : task.endTime ?? '09:30',
          };
        }

        return {
          ...task,
          [field]: value,
        } as Task;
      }),
    );
  }

  function addFollowUpField(field: TaskCompletionField) {
    if (!selectedTaskId) return;
    setTaskItems((current) =>
      current.map((task) =>
        task.id === selectedTaskId ? { ...task, completionFields: [...task.completionFields, field] } : task,
      ),
    );
  }

  function deleteFollowUpField(fieldId: string) {
    if (!selectedTaskId) return;
    setTaskItems((current) =>
      current.map((task) =>
        task.id === selectedTaskId
          ? { ...task, completionFields: task.completionFields.filter((field) => field.id !== fieldId) }
          : task,
      ),
    );
    setFormValues((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function setTaskStatus(nextStatus: TaskStatus) {
    if (!selectedTaskId) return;

    setTaskItems((current) =>
      current.map((task) =>
        task.id === selectedTaskId
          ? {
              ...task,
              status: nextStatus,
              completed: nextStatus === 'completed',
            }
          : task,
      ),
    );
  }

  function deleteTask() {
    if (!selectedTaskId) return;
    setTaskItems((current) => current.filter((task) => task.id !== selectedTaskId));
    setSelectedTaskId(null);
    setIsCreatingTask(false);
    setFormValues({});
  }

  async function saveCompletion() {
    if (!selectedTask) return;

    if (isCreatingTask) {
      setStatus(`${selectedTask.name} created`);
      setSelectedTaskId(null);
      setIsCreatingTask(false);
      setFormValues({});
      return;
    }

    const response = await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: selectedTask.id, values: formValues }),
    });
    if (response.ok) {
      setTaskStatus('completed');
      setStatus(`${selectedTask.name} completed`);
      setSelectedTaskId(null);
      setFormValues({});
    }
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-2">
        <section className="flex flex-wrap items-center justify-between gap-2 border border-slate-800 bg-slate-950/55 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setSelectedDate((current) => shiftDate(current, -1))} className="border border-slate-700 px-2 py-1 text-[10px] text-slate-300">
              ←
            </button>
            <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Today</span>
            <span className="h-3 w-px bg-slate-700" aria-hidden="true" />
            <p className="truncate text-xs font-medium text-white">{dateLabel}</p>
            <button type="button" onClick={() => setSelectedDate((current) => shiftDate(current, 1))} className="border border-slate-700 px-2 py-1 text-[10px] text-slate-300">
              →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={openNewTask} className="border border-cyan-400/30 bg-slate-900/80 px-3 py-1 text-[10px] text-cyan-300">
              Add task
            </button>
            <div className="border border-slate-800 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">{visibleTasks.length} tasks</div>
          </div>
        </section>

        <section className="flex flex-col gap-2 overflow-hidden">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {grouped.allDay.length > 0 ? grouped.allDay.map((task) => <TaskCard key={task.id} task={task} onOpen={openTask} compact />) : null}
          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-auto border border-slate-800 bg-slate-950/35 p-2">
          <div className="min-w-[320px]">
            <div className="grid grid-cols-[3rem_1fr] gap-2 sm:grid-cols-[3.5rem_1fr]">
              <div className="relative" style={{ height: `${timelineHeight}px` }}>
                {hourLabels.slice(0, -1).map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 text-right text-[10px] text-slate-500"
                    style={{ top: `${index * HOUR_ROW_HEIGHT - 7}px` }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              <div className="relative border border-slate-800 bg-slate-950/50" style={{ height: `${timelineHeight}px` }}>
                {hourLabels.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-slate-800/80"
                    style={{ top: `${index * HOUR_ROW_HEIGHT}px` }}
                  />
                ))}

                {grouped.scheduled.length > 0 ? (
                  grouped.scheduled.map(({ task, top, height, column, columns }) => {
                    const width = `calc((100% - ${(columns - 1) * 4}px) / ${columns})`;
                    const left = `calc((${column} * ((100% - ${(columns - 1) * 4}px) / ${columns})) + (${column} * 4px))`;

                    return (
                      <div
                        key={task.id}
                        className="absolute"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left,
                          width,
                        }}
                      >
                        <TaskCard task={task} onOpen={openTask} />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No scheduled tasks.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {status ? <p className="text-xs text-emerald-300">{status}</p> : null}
      </div>

      {selectedTask ? (
        <CompletionSheet
          task={selectedTask}
          values={formValues}
          isNewTask={isCreatingTask}
          onClose={() => {
            if (isCreatingTask) {
              deleteTask();
              return;
            }
            setSelectedTaskId(null);
          }}
          onSave={saveCompletion}
          onDelete={deleteTask}
          onSetStatus={setTaskStatus}
          onTaskChange={updateSelectedTask}
          onAddField={addFollowUpField}
          onDeleteField={deleteFollowUpField}
          onChange={(fieldId, value) => setFormValues((current) => ({ ...current, [fieldId]: value }))}
        />
      ) : null}
    </>
  );
}
