"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Target, Users, Shield, BookOpen, Globe } from 'lucide-react';

export const MissionPage = () => {
  const values = [
    {
      icon: <Target className="text-emerald-600" />,
      title: "Authenticity",
      description: "We are committed to providing authentic Islamic knowledge based on the Quran and Sunnah, verified by qualified scholars."
    },
    {
      icon: <Users className="text-blue-600" />,
      title: "Community",
      description: "Building a supportive and inclusive space for Muslims to grow together, share experiences, and seek guidance."
    },
    {
      icon: <Shield className="text-amber-600" />,
      title: "Integrity",
      description: "Maintaining the highest ethical standards in our financial guidance, community interactions, and educational content."
    },
    {
      icon: <Globe className="text-purple-600" />,
      title: "Accessibility",
      description: "Making Islamic education and spiritual tools accessible to everyone, everywhere, through innovative digital solutions."
    }
  ];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mission/1920/1080')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-900" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Our <span className="text-emerald-400">Mission</span>
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Empowering the Ummah through authentic knowledge, spiritual growth, 
            and ethical financial guidance in the digital age.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-12 relative z-20">
        {/* Core Vision */}
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[48px] shadow-2xl border border-emerald-100 dark:border-emerald-900/20 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Heart size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-6">Spreading the Light of Wisdom</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-8">
              Nurul Quran was founded with a simple yet profound goal: to bridge the gap between traditional Islamic wisdom and the modern digital lifestyle. We believe that spiritual growth and ethical living should be accessible, engaging, and integrated into our daily lives.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">10k+</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Students</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">50+</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Courses</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">100%</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Authentic</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">24/7</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-50 dark:border-emerald-900/10 shadow-lg"
              >
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{value.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-emerald-900 rounded-[48px] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Join Us in Our Journey</h2>
          <p className="text-emerald-100/80 max-w-xl mx-auto mb-10 relative z-10">
            Whether you're a student seeking knowledge, a professional looking for ethical finance, 
            or someone searching for spiritual peace, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="px-8 py-4 bg-white text-emerald-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl">
              Get Started
            </button>
            <button className="px-8 py-4 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all border border-emerald-700">
              Support Our Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
