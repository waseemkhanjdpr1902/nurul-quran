import React from 'react';
import { motion } from 'motion/react';
import { Shield, Globe, Heart, Lock, Cookie, Mail, Calendar, BookOpen } from 'lucide-react';

export const MissionPage = () => {
  const sections = [
    {
      icon: Globe,
      title: "Our Mission",
      content: "Nurul Quran was created to make Islamic knowledge accessible to every Muslim worldwide. We believe in the power of digital technology to bridge the gap between traditional wisdom and modern life.",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: Calendar,
      title: "Founded",
      content: "Nurul Quran was founded in 2026 with a vision to provide a comprehensive, ad-free, and spiritually focused platform for the global Ummah.",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: BookOpen,
      title: "What We Offer",
      content: "Our platform provides access to the Holy Quran with translations, an authentic Hadith library, daily Azkar tracking, Tasawwuf (spiritual purification) guidance, and an AI-powered spiritual assistant.",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
    },
    {
      icon: Shield,
      title: "Data We Collect",
      content: "To provide a personalized experience, we collect basic profile information (name, email) and spiritual progress data (Quran verses read, Tasbeeh counts, and chat history with our AI guide).",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Heart,
      title: "How We Use Your Data",
      content: "Your data is used exclusively to help you track your spiritual growth, provide personalized recommendations, and maintain your chat history for a continuous guidance experience.",
      color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20"
    },
    {
      icon: Lock,
      title: "Privacy Commitment",
      content: "We hold your spiritual journey in the highest trust. We never sell your personal data to third parties. Your information is used only to serve your spiritual needs.",
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      icon: Cookie,
      title: "Cookie Usage",
      content: "We use essential cookies to keep you signed in and remember your preferences, such as dark mode and language settings. We do not use tracking cookies for advertising.",
      color: "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/20"
    },
    {
      icon: Mail,
      title: "Data Requests",
      content: "You have the right to access or delete your data at any time. For any data-related inquiries, please contact us at waseemkhanjdpr@gmail.com.",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32 md:pb-16">
      <motion.div 
        id="mission-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div id="mission-icon-container" className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-900/20">
          <Shield size={40} />
        </div>
        <h1 id="mission-title" className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">Mission & Privacy</h1>
        <p id="mission-subtitle" className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Transparency and trust are the foundations of our spiritual community. Learn about our mission and how we protect your journey.
        </p>
      </motion.div>

      <div id="mission-sections-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            id={`mission-section-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-all"
          >
            <div id={`mission-section-icon-${index}`} className={`w-12 h-12 ${section.color} rounded-2xl flex items-center justify-center mb-6`}>
              <section.icon size={24} />
            </div>
            <h3 id={`mission-section-title-${index}`} className="text-xl font-bold mb-3 dark:text-white">{section.title}</h3>
            <p id={`mission-section-content-${index}`} className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        id="mission-cta-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 p-8 bg-emerald-600 rounded-[40px] text-white text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 id="mission-cta-title" className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p id="mission-cta-description" className="mb-8 opacity-90 max-w-xl mx-auto">
            Help us spread the light of Quranic wisdom. Your support keeps this platform free and accessible for everyone.
          </p>
          <a 
            id="mission-cta-donate-link"
            href="/donate" 
            className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
          >
            Support Nurul Quran
          </a>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </motion.div>
    </div>
  );
};
