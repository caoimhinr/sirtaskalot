'use client';

import React, { useMemo, useState } from 'react';
import type { Task } from '@sirtaskalot/shared';
import { TaskCard } from './task-card';
import { CompletionSheet } from './completion-sheet';

type CalendarViewProps = {
  tasks: Task[];
};

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const HOUR_ROW_HEIGHT = 72;

function parseTimeToMinutes(value: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const grouped = useMemo(() => {
    const allDay = tasks.filter((task) => task.allDay || !task.startTime || !task.endTime);
    const scheduled = tasks
      .filter((task) => !task.allDay && task.startTime && task.endTime)
      .map((task) => {
        const startMinutes = parseTimeToMinutes(task.startTime);
        const endMinutes = parseTimeToMinutes(task.endTime);
        const dayStartMinutes = DAY_START_HOUR * 60;
        const dayEndMinutes = DAY_END_HOUR * 60;

        const safeStart = Math.max(startMinutes ?? dayStartMinutes, dayStartMinutes);
        const safeEnd = Math.min(endMinutes ?? safeStart + 30, dayEndMinutes);
        const top = ((safeStart - dayStartMinutes) / 60) * HOUR_ROW_HEIGHT;
        const height = Math.max(((Math.max(safeEnd, safeStart + 30) - safeStart) / 60) * HOUR_ROW_HEIGHT, 56);

        return {
          task,
          top,
          height,
        };
      })
      .sort((a, b) => a.top - b.top);

    return { allDay, scheduled };
  }, [tasks]);

  const hourLabels = useMemo(
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => DAY_START_HOUR + index),
    [],
  );

  const timelineHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_ROW_HEIGHT;

  async function saveCompletion() {
    if (!selectedTask) return;
    const response = await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: selectedTask.id, values: formValues }),
    });
    if (response.ok) {
      setStatus(`${selectedTask.name} completed`);
      setSelectedTask(null);
      setFormValues({});
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Today</p>
            <h2 className="text-2xl font-semibold text-white">Calendar</h2>
          </div>
          <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{tasks.length} tasks</div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">All day</h3>
          <span className="text-xs text-slate-500">Untimed tasks stay pinned at the top</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {grouped.allDay.length > 0 ? (
            grouped.allDay.map((task) => <TaskCard key={task.id} task={task} onComplete={setSelectedTask} compact />)
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 p-4 text-sm text-slate-400">
              No all-day tasks.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Scheduled</h3>
          <span className="text-xs text-slate-500">Timed tasks are placed on the day timeline</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[320px]">
            <div className="grid grid-cols-[4rem_1fr] gap-3">
              <div className="relative" style={{ height: `${timelineHeight}px` }}>
                {hourLabels.slice(0, -1).map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 text-right text-xs text-slate-500"
                    style={{ top: `${index * HOUR_ROW_HEIGHT - 9}px` }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              <div className="relative rounded-[1.75rem] border border-slate-800 bg-slate-950/60" style={{ height: `${timelineHeight}px` }}>
                {hourLabels.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-slate-800/80"
                    style={{ top: `${index * HOUR_ROW_HEIGHT}px` }}
                  />
                ))}

                {grouped.scheduled.length > 0 ? (
                  grouped.scheduled.map(({ task, top, height }) => (
                    <div
                      key={task.id}
                      className="absolute left-3 right-3"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <TaskCard task={task} onComplete={setSelectedTask} />
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No scheduled tasks.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedTask ? (
        <CompletionSheet
          task={selectedTask}
          values={formValues}
          onClose={() => setSelectedTask(null)}
          onSave={saveCompletion}
          onChange={(fieldId, value) => setFormValues((current) => ({ ...current, [fieldId]: value }))}
        />
      ) : null}

      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </div>
  );
}
