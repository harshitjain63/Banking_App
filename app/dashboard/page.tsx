"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string; 
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [accountOverview, setAccountOverview] = useState({ balance: 0, accountNumber: '' });
  const [spendingByMonth, setSpendingByMonth] = useState<{ [key: string]: number }>({});
  const [incomeByMonth, setIncomeByMonth] = useState<{ [key: string]: number }>({});
  const router = useRouter(); 

  const fetchTransactions = async () => {
    const response = await fetch('/api/transactions/history');
    const data = await response.json();
    setTransactions(data.transactions);
    setAccountOverview(data.accountOverview);
    setSpendingByMonth(data.spendingByMonth);
    setIncomeByMonth(data.incomeByMonth);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFundTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const recipientAccountNumber = formData.get('accountNumber') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!recipientAccountNumber || isNaN(amount) || amount <= 0) {
      alert('Please provide valid inputs.');
      return;
    }

    try {
      const response = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAccountNumber,
          amount,
          description,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Fund transfer successful');
        fetchTransactions();
      } else {
        alert(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error during fund transfer:', error);
    }
  };

  const spendingData = {
    labels: Object.keys(spendingByMonth),
    datasets: [
      {
        label: 'Spending',
        data: Object.values(spendingByMonth),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const incomeData = {
    labels: Object.keys(incomeByMonth),
    datasets: [
      {
        label: 'Income',
        data: Object.values(incomeByMonth),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Banking Dashboard</h1>
          <FaUserCircle 
            className="text-3xl cursor-pointer" 
            onClick={handleProfileClick} 
            title="Go to Profile"
          />
        </div>
      </header>

      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Account Overview</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <p><strong>Account Number:</strong> {accountOverview.accountNumber}</p>
          <p><strong>Balance:</strong> ${accountOverview.balance.toFixed(2)}</p>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Transaction History</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Type</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Description</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.type}</td>
                    <td>${transaction.amount.toFixed(2)}</td>
                    <td>{transaction.description}</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Fund Transfer</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleFundTransfer}>
            <div className="mb-4">
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Recipient Account Number</label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Transfer</button>
          </form>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Spending & Income Analytics</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Monthly Spending</h4>
          <Bar data={spendingData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Spending' } } }} />

          <h4 className="text-lg font-semibold mt-8 mb-4">Monthly Income</h4>
          <Bar data={incomeData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Income' } } }} />
        </div>
      </div>
    </div>
  );
}
