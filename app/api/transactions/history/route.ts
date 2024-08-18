import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  accountNumber: string;
  transactions: Transaction[];
}

function isTransaction(txn: any): txn is Transaction {
  return txn && (txn.type === 'credit' || txn.type === 'debit');
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || '';

  try {
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decodedToken.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { transactions: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balance = user.transactions.reduce((acc: number, txn) => {
      if (isTransaction(txn)) {
        return txn.type === 'credit' ? acc + txn.amount : acc - txn.amount;
      }
      return acc;
    }, 0);

    const accountOverview = {
      balance,
      accountNumber: user.accountNumber,
    };

    // Calculate spending and income by month
    const spendingByMonth = user.transactions.reduce((acc: { [key: string]: number }, txn) => {
      if (isTransaction(txn) && txn.type === 'debit') {
        const month = new Date(txn.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        acc[month] = (acc[month] || 0) + txn.amount;
      }
      return acc;
    }, {});

    const incomeByMonth = user.transactions.reduce((acc: { [key: string]: number }, txn) => {
      if (isTransaction(txn) && txn.type === 'credit') {
        const month = new Date(txn.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        acc[month] = (acc[month] || 0) + txn.amount;
      }
      return acc;
    }, {});

    return NextResponse.json({ transactions: user.transactions, accountOverview, spendingByMonth, incomeByMonth }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
