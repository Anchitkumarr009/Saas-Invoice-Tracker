'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { LogOut, Send } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface Reminder {
  id: string;
  status: string;
  sentAt: string;
  createdAt: string;
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    client: {
      name: string;
      email: string;
    };
  };
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') redirect('/auth/login');

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    try {
      const response = await axios.get('/api/reminders');
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendReminders() {
    setSending(true);

    try {
      const response = await axios.post('/api/reminders/send');
      alert(`${response.data.count} reminders sent!`);
      await fetchReminders();
    } catch (error) {
      console.error('Failed to send reminders:', error);
      alert('Failed to send reminders');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Invoice Tracker
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Reminders</h1>
          <button
            onClick={sendReminders}
            disabled={sending}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold disabled:opacity-50"
          >
            <Send size={20} />
            {sending ? 'Sending...' : 'Send Reminders'}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Tip:</strong> Click "Send Reminders" to automatically send payment reminders for all overdue invoices.
            Reminders are sent only once per day per invoice.
          </p>
        </div>

        {/* Reminders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : reminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No reminders yet. All invoices are up to date!
                    </td>
                  </tr>
                ) : (
                  reminders.map((reminder) => (
                    <tr key={reminder.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        <Link href={`/invoices/${reminder.invoice.invoiceNumber}`}>
                          {reminder.invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{reminder.invoice.client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${reminder.invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(reminder.invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reminder.status === 'SENT'
                              ? 'bg-green-100 text-green-800'
                              : reminder.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reminder.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reminder.sentAt
                          ? new Date(reminder.sentAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
