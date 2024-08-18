import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { email, password, newEmail, newPassword } = await request.json();

  if (!email || !password || !newEmail || !newPassword) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      email: newEmail,
      password: hashedNewPassword,
    },
  });

  return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
}
