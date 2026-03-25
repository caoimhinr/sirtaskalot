import { NextResponse } from 'next/server';
import { getTasksForDate } from '../../../lib/tasks';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? '2026-03-16';
  const tasks = await getTasksForDate(date);
  return NextResponse.json({ tasks });
}
