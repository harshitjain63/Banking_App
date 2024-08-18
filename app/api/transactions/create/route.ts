import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { userId, type, amount, description } = await request.json();

  if (!userId || !type || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      description,
    },
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
