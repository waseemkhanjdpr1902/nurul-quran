"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, IndianRupee, BookOpen, TrendingUp, Shield, Star, ChevronRight, Search, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      // router.push('/'); // Uncomment for production
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchStats();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
            <TrendingUp size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-zinc-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{value}</h3>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
            <Shield className="text-emerald-600" />
            Admin Dashboard
          </h1>
          <p className="text-zinc-500 mt-1">Welcome back, Administrator</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-zinc-600 hover:text-emerald-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          label="Total Students" 
          value={stats?.totalUsers || '1,284'} 
          trend="+12%" 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={IndianRupee} 
          label="Total Donations" 
          value={`₹${stats?.totalDonations || '45,200'}`} 
          trend="+8%" 
          color="bg-emerald-500" 
        />
        <StatCard 
          icon={BookOpen} 
          label="Course Enrolled" 
          value={stats?.totalEnrollments || '856'} 
          trend="+15%" 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Star} 
          label="Active Session" 
          value={stats?.activeUsers || '42'} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Recent Transactions</h2>
              <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-widest">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            S{i}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Student Name {i}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹500</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase">Success</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">2 mins ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all group">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} />
                  <span className="font-bold">Add New Course</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group">
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span className="font-bold">Manage Students</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group">
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} />
                  <span className="font-bold">System Settings</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-[40px] text-white shadow-xl shadow-emerald-900/20">
            <h3 className="font-bold mb-2">System Health</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
              <span className="text-xs text-emerald-100">All systems operational</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-100">Server Load</span>
                <span className="font-bold">24%</span>
              </div>
              <div className="h-1.5 bg-emerald-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[24%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
