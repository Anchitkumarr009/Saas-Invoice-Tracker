'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FileText, Users, Bell, LogOut, Plus } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  client: {
    name: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') redirect('/auth/login');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await axios.get('/api/invoices');
        const allInvoices = response.data;
        setInvoices(allInvoices.slice(0, 5));

        // Calculate stats
        let paidAmount = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;

        allInvoices.forEach((inv: Invoice) => {
          if (inv.status === 'PAID') {
            paidAmount += inv.totalAmount;
          } else if (inv.status === 'OVERDUE') {
            overdueAmount += inv.totalAmount;
          } else {
            pendingAmount += inv.totalAmount;
          }
        });

        setStats({
          totalInvoices: allInvoices.length,
          paidAmount,
          pendingAmount,
          overdueAmount,
        });
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Invoice Tracker</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {session?.user?.name}</span>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Invoices</p>
                <p className="text-3xl font-bold">{stats.totalInvoices}</p>
              </div>
              <FileText className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.paidAmount.toFixed(2)}
                </p>
              </div>
              <Bell className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ${stats.pendingAmount.toFixed(2)}
                </p>
              </div>
              <FileText className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-red-600">
                  ${stats.overdueAmount.toFixed(2)}
                </p>
              </div>
              <Bell className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/invoices">
            <div className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg cursor-pointer transition shadow">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <div>
                  <h3 className="font-semibold">Invoices</h3>
                  <p className="text-sm opacity-90">Manage all invoices</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/clients">
            <div className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg cursor-pointer transition shadow">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <h3 className="font-semibold">Clients</h3>
                  <p className="text-sm opacity-90">Manage your clients</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/reminders">
            <div className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg cursor-pointer transition shadow">
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <div>
                  <h3 className="font-semibold">Reminders</h3>
                  <p className="text-sm opacity-90">Payment reminders</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <Link href="/invoices/create">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                <Plus size={18} />
                New Invoice
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No invoices yet. <Link href="/invoices/create" className="text-blue-600 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        <Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{invoice.client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
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
