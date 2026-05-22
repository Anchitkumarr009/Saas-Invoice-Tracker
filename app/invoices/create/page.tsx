'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export default function CreateInvoicePage() {
  const { status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    dueDate: '',
    tax: 0,
    notes: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') redirect('/auth/login');

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    }

    fetchClients();
  }, []);

  function addItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0 }],
    });
  }

  function removeItem(index: number) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/invoices', formData);
      router.push('/invoices');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  }

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const total = subtotal + formData.tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/invoices" className="text-2xl font-bold text-blue-600">
            Invoice Tracker
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <Link href="/clients" className="text-blue-600 hover:underline text-sm mt-2 block">
              Create new client
            </Link>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={`$${(item.quantity * item.rate).toFixed(2)}`}
                    disabled
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg"
            >
              Add Item
            </button>
          </div>

          {/* Tax and Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax
              </label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total
              </label>
              <input
                type="text"
                value={`$${total.toFixed(2)}`}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <Link href="/invoices" className="flex-1">
              <button type="button" className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-4 rounded-lg transition">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
