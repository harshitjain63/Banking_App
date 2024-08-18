import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

function generateAccountNumber() {
  // Generate a random 12-digit account number
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

export async function POST(request: Request) {
  const { name, email, contact, password } = await request.json();

  if (!name || !email || !contact || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const accountNumber = generateAccountNumber();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      contact,
      password: hashedPassword,
      accountNumber, 
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
