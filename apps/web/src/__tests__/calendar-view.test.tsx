import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from '../components/calendar-view';
import { demoTasks } from '../../../../packages/shared/src/index';

describe('CalendarView', () => {
  it('renders all-day tasks and the scheduled timeline in the compact layout', () => {
    render(<CalendarView tasks={demoTasks} />);

    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    expect(screen.getByText('Morning meds')).toBeInTheDocument();
    expect(screen.getByText('Breakfast prep')).toBeInTheDocument();
    expect(screen.getByText('8 AM')).toBeInTheDocument();
    expect(screen.getByText(/mon, mar 16/i)).toBeInTheDocument();
    expect(screen.getByText(/3 tasks/i)).toBeInTheDocument();
  });

  it('opens task details when a task card is clicked', async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /open morning meds/i }));

    expect(screen.getByText('Task details')).toBeInTheDocument();
    expect(screen.getByLabelText('Blood pressure')).toBeInTheDocument();
  });

  it('supports day navigation', async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: '→' }));
    expect(screen.getByText(/0 tasks/i)).toBeInTheDocument();
  });

  it('persists follow-up fields on a created task', async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Laundry');
    await user.type(screen.getByLabelText('New field label'), 'Detergent used');
    await user.selectOptions(screen.getByLabelText('New field type'), 'select');
    await user.type(screen.getByLabelText('Select options'), 'Pods,Liquid');
    await user.click(screen.getByRole('button', { name: /add follow-up field/i }));
    await user.click(screen.getByRole('button', { name: /^create task$/i }));

    await waitFor(() => expect(screen.getByText(/laundry created/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /open laundry/i }));
    expect(screen.getByDisplayValue('Laundry')).toBeInTheDocument();
    expect(screen.getByText(/pods, liquid/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Detergent used')).toBeInTheDocument();
  });

  it('submits task completion', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as typeof fetch;

    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /open morning meds/i }));
    await user.type(screen.getByLabelText('Blood pressure'), '120');
    await user.click(screen.getByRole('button', { name: /save completion/i }));

    await waitFor(() => expect(screen.getByText(/morning meds completed/i)).toBeInTheDocument());
  });

  it('can abandon and reset a task state', async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /open morning meds/i }));
    await user.click(screen.getByRole('button', { name: /abandon/i }));
    expect(screen.getAllByText('Abandoned')[0]).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getAllByText('Open')[0]).toBeInTheDocument();
  });
});
