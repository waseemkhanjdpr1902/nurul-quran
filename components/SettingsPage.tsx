"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, User, Bell, Shield, Moon, Sun, Globe, HelpCircle, ChevronRight, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

export const SettingsPage = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { name: 'Profile', icon: <User size={18} /> },
    { name: 'Notifications', icon: <Bell size={18} /> },
    { name: 'Privacy', icon: <Shield size={18} /> },
    { name: 'Appearance', icon: <Moon size={18} /> },
    { name: 'Language', icon: <Globe size={18} /> },
    { name: 'Support', icon: <HelpCircle size={18} /> },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
            <Settings className="text-emerald-600" />
            Settings
          </h1>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.name
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white dark:bg-zinc-900 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-xl p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-8">{activeTab} Settings</h2>

            {activeTab === 'Profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 border-4 border-white dark:border-zinc-800 shadow-lg overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all">
                    Change Avatar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ''}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      type="email"
                      disabled
                      defaultValue={session?.user?.email || ''}
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-6">
                {[
                  { title: 'Prayer Times', desc: 'Get notified when it\'s time for prayer.' },
                  { title: 'Daily Verse', desc: 'Receive a daily ayah from the Quran.' },
                  { title: 'Community Updates', desc: 'Stay updated on Q&A and group discussions.' },
                  { title: 'Course Reminders', desc: 'Never miss a lesson in your enrolled courses.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{item.title}</h4>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-2 border-emerald-600 flex flex-col items-center gap-4">
                    <Sun className="text-emerald-600" size={32} />
                    <span className="font-bold text-sm">Light Mode</span>
                  </button>
                  <button className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-2 border-transparent flex flex-col items-center gap-4">
                    <Moon className="text-zinc-400" size={32} />
                    <span className="font-bold text-sm text-zinc-500">Dark Mode</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
