'use client';

import React, { useState } from 'react';
import type { Task, TaskCompletionField, TaskStatus } from '@sirtaskalot/shared';

type CompletionSheetProps = {
  task: Task;
  values: Record<string, string>;
  isNewTask?: boolean;
  onChange: (fieldId: string, value: string) => void;
  onTaskChange: (field: 'name' | 'description' | 'date' | 'startTime' | 'endTime' | 'allDay' | 'icon', value: string | boolean) => void;
  onAddField: (field: TaskCompletionField) => void;
  onDeleteField: (fieldId: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onSetStatus: (status: TaskStatus) => void;
};

function getTaskVisualState(task: Task) {
  const status = task.status ?? (task.completed ? 'completed' : 'default');

  if (status === 'completed') {
    return {
      accentText: 'text-emerald-300',
      accentBorder: 'border-emerald-500/40',
      primaryButton: 'bg-emerald-400',
      statusLabel: 'Completed',
    };
  }

  if (status === 'abandoned') {
    return {
      accentText: 'text-rose-300',
      accentBorder: 'border-rose-500/40',
      primaryButton: 'bg-rose-400',
      statusLabel: 'Abandoned',
    };
  }

  return {
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/30',
    primaryButton: 'bg-cyan-400',
    statusLabel: 'Open',
  };
}

export function CompletionSheet({
  task,
  values,
  isNewTask = false,
  onChange,
  onTaskChange,
  onAddField,
  onDeleteField,
  onClose,
  onSave,
  onDelete,
  onSetStatus,
}: CompletionSheetProps) {
  const visual = getTaskVisualState(task);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<TaskCompletionField['type']>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  function handleAddField() {
    if (!newFieldLabel.trim()) return;

    onAddField({
      id: `field-${crypto.randomUUID()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: false,
      options:
        newFieldType === 'select'
          ? newFieldOptions
              .split(',')
              .map((option) => option.trim())
              .filter(Boolean)
          : undefined,
    });

    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close task details"
        className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className={`fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col border bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/50 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[24rem] lg:max-h-none lg:border-l lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:bg-slate-900/95 ${visual.accentBorder}`}>
        <div className="mx-auto mb-3 h-1.5 w-12 bg-slate-700 lg:hidden" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] ${visual.accentText}`}>{isNewTask ? 'New task' : 'Task details'}</p>
            <h3 className="text-lg font-semibold text-white">{isNewTask ? 'Create task' : task.name}</h3>
            {!isNewTask ? <p className="mt-1 text-sm text-slate-400">{task.allDay ? 'All day' : `${task.startTime} - ${task.endTime}`}</p> : null}
          </div>
          <button className="border border-slate-700 px-3 py-2 text-sm text-slate-300" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-400">Current state: <span className={visual.accentText}>{visual.statusLabel}</span></div>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-3 pb-4">
            <label className="block text-sm text-slate-200">
              <span className="mb-1 block">Icon</span>
              <input
                aria-label="Icon"
                className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                value={task.icon}
                onChange={(event) => onTaskChange('icon', event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-200">
              <span className="mb-1 block">Name</span>
              <input
                aria-label="Name"
                className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                value={task.name}
                onChange={(event) => onTaskChange('name', event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-200">
              <span className="mb-1 block">Description</span>
              <textarea
                aria-label="Description"
                className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                rows={3}
                value={task.description}
                onChange={(event) => onTaskChange('description', event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-200">
              <span className="mb-1 block">Date</span>
              <input
                aria-label="Date"
                type="date"
                className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                value={task.date}
                onChange={(event) => onTaskChange('date', event.target.value)}
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                aria-label="All day"
                type="checkbox"
                checked={task.allDay}
                onChange={(event) => onTaskChange('allDay', event.target.checked)}
              />
              All day
            </label>
            {!task.allDay ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-slate-200">
                  <span className="mb-1 block">Start</span>
                  <input
                    aria-label="Start"
                    type="time"
                    className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                    value={task.startTime ?? ''}
                    onChange={(event) => onTaskChange('startTime', event.target.value)}
                  />
                </label>
                <label className="block text-sm text-slate-200">
                  <span className="mb-1 block">End</span>
                  <input
                    aria-label="End"
                    type="time"
                    className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                    value={task.endTime ?? ''}
                    onChange={(event) => onTaskChange('endTime', event.target.value)}
                  />
                </label>
              </div>
            ) : null}

            <div className="border border-slate-800 p-3">
              <p className="mb-2 text-sm font-semibold text-white">Follow-up inputs</p>
              <div className="space-y-2">
                {task.completionFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between gap-3 border border-slate-800 px-3 py-2 text-xs text-slate-300">
                    <div>
                      <p className="font-semibold text-white">{field.label}</p>
                      <p className="text-slate-400">{field.type}{field.type === 'select' && field.options?.length ? `: ${field.options.join(', ')}` : ''}</p>
                    </div>
                    <button type="button" className="border border-rose-500/40 px-2 py-1 text-rose-300" onClick={() => onDeleteField(field.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <input
                  aria-label="New field label"
                  placeholder="Field label"
                  className="w-full border border-slate-700 bg-slate-900 px-3 py-3 text-sm"
                  value={newFieldLabel}
                  onChange={(event) => setNewFieldLabel(event.target.value)}
                />
                <select
                  aria-label="New field type"
                  className="w-full border border-slate-700 bg-slate-900 px-3 py-3 text-sm"
                  value={newFieldType}
                  onChange={(event) => setNewFieldType(event.target.value as TaskCompletionField['type'])}
                >
                  <option value="text">Text</option>
                  <option value="number">Numeric</option>
                  <option value="select">Select list</option>
                </select>
                {newFieldType === 'select' ? (
                  <input
                    aria-label="Select options"
                    placeholder="Comma separated options"
                    className="w-full border border-slate-700 bg-slate-900 px-3 py-3 text-sm"
                    value={newFieldOptions}
                    onChange={(event) => setNewFieldOptions(event.target.value)}
                  />
                ) : null}
                <button type="button" onClick={handleAddField} className="w-full border border-cyan-400/30 px-3 py-2 text-sm text-cyan-300">
                  Add follow-up field
                </button>
              </div>
            </div>

            {!isNewTask ? (
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => onSetStatus('completed')} className="bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950">
                  Complete
                </button>
                <button type="button" onClick={() => onSetStatus('abandoned')} className="bg-rose-400 px-3 py-2 text-xs font-semibold text-slate-950">
                  Abandon
                </button>
                <button type="button" onClick={() => onSetStatus('default')} className="border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200">
                  Reset
                </button>
              </div>
            ) : null}

            {!isNewTask && task.completionFields.length > 0 ? (
              <div className="space-y-3">
                {task.completionFields.map((field) => (
                  <label key={field.id} className="block text-sm text-slate-200">
                    <span className="mb-1 block">{field.label}</span>
                    {field.type === 'select' ? (
                      <select
                        aria-label={field.label}
                        className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
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
                        className="w-full border border-slate-700 bg-slate-900 px-3 py-3"
                        value={values[field.id] ?? ''}
                        onChange={(event) => onChange(field.id, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onSave} className={`min-h-11 px-4 py-3 font-semibold text-slate-950 ${visual.primaryButton}`}>
                {isNewTask ? 'Create task' : 'Save completion'}
              </button>
              <button type="button" onClick={onDelete} className="min-h-11 border border-rose-500/40 px-4 py-3 font-semibold text-rose-300">
                Delete task
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
