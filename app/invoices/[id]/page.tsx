'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  client: {
    name: string;
  };
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
  payments: {
    amount: number;
    paymentDate: string;
  }[];
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: '',
    notes: '',
  });

  if (status === 'unauthenticated') redirect('/auth/login');

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await axios.get(`/api/invoices/${params.id}`);
        setInvoice(response.data);
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [params.id]);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();

    try {
      await axios.post(`/api/invoices/${params.id}/payments`, paymentForm);
      const response = await axios.get(`/api/invoices/${params.id}`);
      setInvoice(response.data);
      setPaymentForm({ amount: '', method: '', notes: '' });
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.totalAmount - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/invoices" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} />
            Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status and Client Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
            <p className="text-gray-700"><strong>Name:</strong> {invoice.client.name}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              invoice.status === 'PAID'
                ? 'bg-green-100 text-green-800'
                : invoice.status === 'OVERDUE'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-700">Description</th>
                <th className="text-center py-2 text-gray-700">Quantity</th>
                <th className="text-center py-2 text-gray-700">Rate</th>
                <th className="text-right py-2 text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="text-center py-3 text-gray-900">{item.quantity}</td>
                  <td className="text-center py-3 text-gray-900">${item.rate.toFixed(2)}</td>
                  <td className="text-right py-3 text-gray-900">${(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-2 text-right">
            <p className="text-gray-700">
              <strong>Subtotal:</strong> ${(invoice.totalAmount - 0).toFixed(2)}
            </p>
            <p className="text-gray-700">
              <strong>Tax:</strong> $0.00
            </p>
            <p className="text-2xl font-bold text-blue-600">
              <strong>Total:</strong> ${invoice.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Total Due:</strong> ${invoice.totalAmount.toFixed(2)}
              </p>
              <p className="text-green-600">
                <strong>Paid:</strong> ${totalPaid.toFixed(2)}
              </p>
              <p className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                <strong>Remaining:</strong> ${remaining.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
            {invoice.payments.length === 0 ? (
              <p className="text-gray-500">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    <span className="text-green-600 font-semibold">${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Record Payment Form */}
        {remaining > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <input
                    type="text"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    placeholder="e.g., Credit Card, Bank Transfer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Record Payment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
