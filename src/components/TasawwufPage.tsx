import React, { useState } from 'react';
import { Heart, Send, Sparkles, Info } from 'lucide-react';
import { TASAWWUF_ARTICLES } from '../constants';
import { motion } from 'motion/react';

export const TasawwufPage = () => {
  const [selectedArticle, setSelectedArticle] = useState(TASAWWUF_ARTICLES[0]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Articles */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
            <Heart className="text-emerald-600" size={20} />
            Spiritual Path
          </h2>
          {TASAWWUF_ARTICLES.map((article) => (
            <button
              key={article.id}
              id={`tasawwuf-article-btn-${article.id}`}
              onClick={() => setSelectedArticle(article)}
              className={`w-full p-4 rounded-2xl text-left transition-all border ${
                selectedArticle.id === article.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none'
                  : 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-900/30 text-zinc-600 hover:border-emerald-400'
              }`}
            >
              <h3 className="font-bold mb-1">{article.title}</h3>
              <p className={`text-xs ${selectedArticle.id === article.id ? 'text-emerald-100' : 'text-zinc-400'}`}>
                Read more about {article.title.toLowerCase()}
              </p>
            </button>
          ))}

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 mt-8">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-3">
              <Sparkles size={18} />
              <span>Muraqaba Tip</span>
            </div>
            <p className="text-sm text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">
              Find a quiet place, close your eyes, and imagine your heart is saying "Allah, Allah" with every beat.
            </p>
          </div>
        </div>

        {/* Article Content */}
        <div className="lg:col-span-2">
          <motion.div
            key={selectedArticle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
          >
            <h1 className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-8">{selectedArticle.title}</h1>
            <div className="prose prose-emerald dark:prose-invert max-w-none">
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-loose mb-12">
                {selectedArticle.content}
              </p>

              {selectedArticle.keyTakeaways && (
                <div className="mb-12 p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
                    <Sparkles className="text-emerald-600" size={20} />
                    Key Takeaways
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArticle.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedArticle.sections && (
                <div className="space-y-12">
                  {selectedArticle.sections.map((section, idx) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900/30">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white dark:border-zinc-900" />
                      <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{section.heading}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-16 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <Info className="text-emerald-600 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Did you know?</h4>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      The word Tasawwuf comes from the root 'safa', meaning purity. It is the spiritual dimension of Islam that focuses on the internal state of the believer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
