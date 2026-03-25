import React from 'react';
import type { Task } from '@sirtaskalot/shared';

type TaskCardProps = {
  task: Task;
  onComplete: (task: Task) => void;
  compact?: boolean;
};

export function TaskCard({ task, onComplete, compact = false }: TaskCardProps) {
  return (
    <article
      className={[
        'h-full rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-lg shadow-slate-950/20',
        compact ? 'p-4' : 'p-3',
      ].join(' ')}
    >
      <div className={compact ? 'flex items-start justify-between gap-3' : 'flex h-full flex-col justify-between gap-3'}>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
            {task.allDay ? 'All day' : `${task.startTime} - ${task.endTime}`}
          </p>
          <h3 className={compact ? 'mt-2 text-lg font-semibold text-white' : 'mt-1 text-base font-semibold text-white'}>
            <span className="mr-2" aria-hidden="true">{task.icon}</span>
            {task.name}
          </h3>
          <p className={compact ? 'mt-1 text-sm text-slate-300' : 'mt-1 line-clamp-2 text-xs text-slate-300'}>{task.description}</p>
        </div>

        <div className={compact ? 'flex flex-col items-end gap-3' : 'mt-auto flex items-end justify-between gap-3'}>
          <button
            type="button"
            onClick={() => onComplete(task)}
            className="min-h-11 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            aria-label={`Complete ${task.name}`}
          >
            {task.completed ? 'Done' : 'Quick done'}
          </button>
          {task.completionFields.length > 0 ? (
            <p className="text-xs text-slate-400">Needs follow-up info.</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
