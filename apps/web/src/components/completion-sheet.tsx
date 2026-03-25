'use client';

import React from 'react';
import type { Task } from '@sirtaskalot/shared';

type CompletionSheetProps = {
  task: Task;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function CompletionSheet({ task, values, onChange, onClose, onSave }: CompletionSheetProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/30 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Complete task</p>
          <h3 className="text-lg font-semibold text-white">{task.name}</h3>
        </div>
        <button className="text-sm text-slate-400" onClick={onClose}>Close</button>
      </div>
      <div className="mt-4 space-y-3">
        {task.completionFields.map((field) => (
          <label key={field.id} className="block text-sm text-slate-200">
            <span className="mb-1 block">{field.label}</span>
            {field.type === 'select' ? (
              <select
                aria-label={field.label}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3"
                value={values[field.id] ?? ''}
                onChange={(event) => onChange(field.id, event.target.value)}
              >
                <option value="">Select</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                aria-label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3"
                value={values[field.id] ?? ''}
                onChange={(event) => onChange(field.id, event.target.value)}
              />
            )}
          </label>
        ))}
        <button type="button" onClick={onSave} className="min-h-11 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">
          Save completion
        </button>
      </div>
    </section>
  );
}
