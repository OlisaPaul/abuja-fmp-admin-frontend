'use client';

import {
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  FileText,
} from 'lucide-react';

const stats = [
  {
    label: 'Total Parishes',
    value: '124',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Monthly Collection',
    value: '₦12,450,000',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Pending Reports',
    value: '15',
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'Wallet Balance',
    value: '₦45,200,000',
    icon: ArrowUpRight,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-blue-500/10 transition-shadow"
          >
            <div className={`p-3 rounded-xl w-fit ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Payments</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold">
                    P{i}
                  </div>
                  <div>
                    <p className="font-medium">St. Jude Parish</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-500">+₦50,000</p>
                  <p className="text-xs text-slate-500">Confirmed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Pending Verifications</h2>
          <div className="space-y-4 text-center py-12">
            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-500">
              No reports waiting for verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
