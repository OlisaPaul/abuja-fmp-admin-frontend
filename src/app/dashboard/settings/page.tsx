'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Shield, Bell, Lock, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/admin-settings', settings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update settings',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage global platform configurations and security policies.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 text-blue-500">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-white">
                Platform Configuration
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  ICT Fee (₦)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={settings?.ictFee || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, ictFee: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-slate-500">
                      Enable platform-wide SMS alerts
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      smsNotificationsEnabled:
                        !settings.smsNotificationsEnabled,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings?.smsNotificationsEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.smsNotificationsEnabled ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 text-amber-500">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-white">
                Security & Lockout
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Max Failed Attempts
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={settings?.maxFailedLoginAttempts || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxFailedLoginAttempts: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Lockout Duration (Minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={settings?.accountLockoutDurationMinutes || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      accountLockoutDurationMinutes: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-6">
            <h3 className="text-blue-500 font-semibold mb-2">Notice</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Updating these settings will affect all users across the platform
              immediately.
            </p>
          </div>
          {message.text && (
            <div
              className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" /> <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
