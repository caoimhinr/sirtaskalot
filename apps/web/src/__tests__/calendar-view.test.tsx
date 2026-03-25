import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from '../components/calendar-view';
import { demoTasks } from '../../../../packages/shared/src/index';

describe('CalendarView', () => {
  it('renders all-day tasks above the scheduled timeline', () => {
    render(<CalendarView tasks={demoTasks} />);

    const allDayHeading = screen.getByRole('heading', { level: 3, name: 'All day' });
    const scheduledHeading = screen.getByRole('heading', { level: 3, name: 'Scheduled' });

    const allDaySection = allDayHeading.closest('section');
    const scheduledSection = scheduledHeading.closest('section');

    expect(allDaySection).not.toBeNull();
    expect(scheduledSection).not.toBeNull();

    expect(within(allDaySection as HTMLElement).getByText('Walk the dog')).toBeInTheDocument();
    expect(within(scheduledSection as HTMLElement).getByText('Morning meds')).toBeInTheDocument();
    expect(within(scheduledSection as HTMLElement).getByText('8 AM')).toBeInTheDocument();
  });

  it('shows completion form after quick done', async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /complete morning meds/i }));

    expect(screen.getByText('Complete task')).toBeInTheDocument();
    expect(screen.getByLabelText('Blood pressure')).toBeInTheDocument();
  });

  it('submits task completion', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as typeof fetch;

    render(<CalendarView tasks={demoTasks} />);

    await user.click(screen.getByRole('button', { name: /complete morning meds/i }));
    await user.type(screen.getByLabelText('Blood pressure'), '120');
    await user.click(screen.getByRole('button', { name: /save completion/i }));

    await waitFor(() => expect(screen.getByText(/morning meds completed/i)).toBeInTheDocument());
  });
});
