import React from 'react';
import type { Task } from '@sirtaskalot/shared';

type TaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
  compact?: boolean;
};

function getTaskVisualState(task: Task) {
  const status = task.status ?? (task.completed ? 'completed' : 'default');

  if (status === 'completed') {
    return {
      accentText: 'text-emerald-300/90',
      cardClasses: 'border-emerald-500/40 bg-emerald-950/20',
      badgeClasses: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      badgeLabel: 'Completed',
    };
  }

  if (status === 'abandoned') {
    return {
      accentText: 'text-rose-300/90',
      cardClasses: 'border-rose-500/40 bg-rose-950/20',
      badgeClasses: 'border border-rose-500/40 bg-rose-500/15 text-rose-300',
      badgeLabel: 'Abandoned',
    };
  }

  return {
    accentText: 'text-cyan-300/80',
    cardClasses: 'border-slate-700/70 bg-slate-900/80',
    badgeClasses: 'border border-slate-700 text-slate-300',
    badgeLabel: 'Open',
  };
}

export function TaskCard({ task, onOpen, compact = false }: TaskCardProps) {
  const visual = getTaskVisualState(task);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onOpen(task)}
        className={`h-full overflow-hidden border p-4 text-left shadow-lg shadow-slate-950/20 transition hover:border-slate-600 ${visual.cardClasses}`}
        aria-label={`Open ${task.name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`truncate text-xs uppercase tracking-[0.25em] ${visual.accentText}`}>
              {task.allDay ? 'All day' : `${task.startTime} - ${task.endTime}`}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white" title={task.name}>
              <span className="mr-2" aria-hidden="true">{task.icon}</span>
              {task.name}
            </h3>
            <p className="mt-1 text-sm text-slate-300" title={task.description}>{task.description}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 text-xs ${visual.badgeClasses}`}>{visual.badgeLabel}</span>
            {task.completionFields.length > 0 ? <p className="text-xs text-slate-400">Needs follow-up info.</p> : null}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className={`flex h-full min-h-0 w-full overflow-hidden border p-3 text-left shadow-lg shadow-slate-950/20 transition hover:border-slate-600 ${visual.cardClasses}`}
      aria-label={`Open ${task.name}`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[10px] uppercase tracking-[0.22em] sm:text-[11px] ${visual.accentText}`}>
              {task.startTime} - {task.endTime}
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold text-white sm:text-base" title={task.name}>
              <span className="mr-2" aria-hidden="true">{task.icon}</span>
              {task.name}
            </h3>
          </div>
          <span className={`shrink-0 px-2 py-1 text-[10px] font-semibold sm:text-[11px] ${visual.badgeClasses}`}>{visual.badgeLabel}</span>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-[11px] text-slate-400 sm:text-xs" title={task.description}>
            {task.description}
          </p>
        </div>

        {task.completionFields.length > 0 ? (
          <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">Needs follow-up info.</p>
        ) : null}
      </div>
    </button>
  );
}
