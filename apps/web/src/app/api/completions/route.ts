import { NextResponse } from 'next/server';
import { completeTask } from '../../../lib/tasks';

export async function POST(request: Request) {
  const body = await request.json();
  const completion = await completeTask(body);
  return NextResponse.json({ completion }, { status: 201 });
}
