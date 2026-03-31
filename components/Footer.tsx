import React from 'react';
import Link from 'next/link';
import { Star, Twitter, Facebook, Instagram, Youtube, Mail } from 'lucide-react';

export const Footer = () => (
  <footer id="app-footer" className="bg-white dark:bg-zinc-900 border-t border-emerald-100 dark:border-emerald-900/30 py-12 px-8">
    <div id="footer-content" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div id="footer-brand-section" className="col-span-1 md:col-span-2">
        <div id="footer-logo" className="flex items-center gap-3 mb-6">
          <div id="footer-logo-icon" className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Star size={24} fill="currentColor" className="text-gold" />
          </div>
          <span id="footer-logo-text" className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Nurul Quran</span>
        </div>
        <p id="footer-description" className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
          Spreading the light of Quranic wisdom and spiritual guidance. Join our journey towards inner peace and divine connection.
        </p>
      </div>
      
      <div id="footer-links-section">
        <h4 id="footer-links-title" className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
        <ul id="footer-links-list" className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
          <li><Link href="/quran" className="hover:text-emerald-600 transition-colors">Holy Quran</Link></li>
          <li><Link href="/hadith" className="hover:text-emerald-600 transition-colors">Hadith Library</Link></li>
          <li><Link href="/finance/halal-stocks" className="hover:text-emerald-600 transition-colors">Halal Stocks</Link></li>
          <li><Link href="/community/qa" className="hover:text-emerald-600 transition-colors">Community Board</Link></li>
          <li><Link href="/mission" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
          <li><Link href="/donate" className="hover:text-emerald-600 transition-colors">Support Us</Link></li>
        </ul>
      </div>

      <div id="footer-social-section">
        <h4 id="footer-social-title" className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest text-xs">Connect With Us</h4>
        <div id="footer-social-links" className="flex gap-4 mb-6">
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Twitter size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Facebook size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Instagram size={18} />
          </a>
          <a href="#" className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Youtube size={18} />
          </a>
        </div>
        <div id="footer-contact-info" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Mail size={16} />
          <span>contact@nurulquran.com</span>
        </div>
      </div>
    </div>
    <div id="footer-bottom" className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
      <p>© {new Date().getFullYear()} Nurul Quran. All rights reserved. Made with ❤️ for the Ummah.</p>
    </div>
  </footer>
);
