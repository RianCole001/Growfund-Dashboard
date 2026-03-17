import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Users, AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'https://growfun-backend.onrender.com/api/notifications/admin';
const getToken = () => localStorage.getItem('admin_access_token') || localStorage.getItem('user_access_token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const typeIcon = (type) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };
  return icons[type] || <Info className="w-5 h-5 text-blue-500" />;
};

const typeBadge = (type) => ({
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}[type] || 'bg-gray-100 text-gray-600');

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const selectCls = inputCls;

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', targetUsers: '', priority: 'normal' });

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!getToken()) { toast.error('Please login as admin'); return; }
      const res = await fetch(`${API}/notifications/`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const result = await res.json();
      if (result.success) setNotifications(result.data || []);
      else throw new Error(result.error || 'Failed');
    } catch (err) {
      toast.error('Failed to load: ' + err.message);
      setNotifications([]);
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message required'); return; }
    try {
      setSending(true);
      const res = await fetch(`${API}/send/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, target_users: form.target === 'specific_users' ? form.targetUsers : '' }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const result = await res.json();
      if (result.success) {
        setNotifications(n => [result.data, ...n]);
        setShowModal(false);
        setForm({ title: '', message: '', type: 'info', target: 'all', targetUsers: '', priority: 'normal' });
        toast.success(`Sent to ${result.data.sent_count} users`);
      } else throw new Error(result.error || 'Failed');
    } catch (err) { toast.error('Failed to send: ' + err.message); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await fetch(`${API}/notifications/${id}/`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const result = await res.json();
      if (result.success) { setNotifications(n => n.filter(x => x.id !== id)); toast.success('Deleted'); }
      else throw new Error(result.error || 'Failed');
    } catch (err) { toast.error('Failed to delete: ' + err.message); }
  };

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading && notifications.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">Send and manage user notifications</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <Send className="w-4 h-4" /> Send Notification
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Sent Notifications</h3>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="shrink-0 mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{n.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(n.type)}`}>{n.type}</span>
                    {n.priority === 'high' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">High Priority</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{n.sent_count || 0} users</span>
                    <span className="capitalize">{n.target?.replace('_', ' ')}</span>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(n.id)} className="shrink-0 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Send Notification</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={(e) => setF('title', e.target.value)} placeholder="Notification title" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                <textarea value={form.message} onChange={(e) => setF('message', e.target.value)} placeholder="Notification message" rows={4} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setF('type', e.target.value)} className={selectCls}>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setF('priority', e.target.value)} className={selectCls}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Send To</label>
                <select value={form.target} onChange={(e) => setF('target', e.target.value)} className={selectCls}>
                  <option value="all">All Users</option>
                  <option value="verified">Verified Users Only</option>
                  <option value="specific_users">Specific Users</option>
                </select>
              </div>
              {form.target === 'specific_users' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">User Emails (comma-separated)</label>
                  <input type="text" value={form.targetUsers} onChange={(e) => setF('targetUsers', e.target.value)}
                    placeholder="user1@example.com, user2@example.com" className={inputCls} />
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} disabled={sending}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {sending ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Sending...</> : <><Send className="w-4 h-4" /> Send</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
