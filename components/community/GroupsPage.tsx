import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, Clock, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { db, collection, query, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  icon: string;
  description: string;
  memberCount: number;
  lastActivity: any;
}

const GROUPS_DATA: Group[] = [
  { id: 'quran-study', name: 'Quran Study', icon: '📖', description: 'Deep dives into Quranic verses and Tafsir.', memberCount: 0, lastActivity: new Date().toISOString() },
  { id: 'daily-dhikr', name: 'Daily Dhikr', icon: '🕌', description: 'Remembrance of Allah and spiritual practices.', memberCount: 0, lastActivity: new Date().toISOString() },
  { id: 'halal-finance', name: 'Halal Finance', icon: '💰', description: 'Discussing Islamic banking and investments.', memberCount: 0, lastActivity: new Date().toISOString() },
  { id: 'ramadan-prep', name: 'Ramadan Prep', icon: '🌙', description: 'Preparing for the blessed month of fasting.', memberCount: 0, lastActivity: new Date().toISOString() },
  { id: 'family-parenting', name: 'Family & Parenting', icon: '👨‍👩‍👧', description: 'Islamic guidance for family life.', memberCount: 0, lastActivity: new Date().toISOString() },
  { id: 'new-muslims', name: 'New Muslims', icon: '🎓', description: 'A welcoming space for reverts to learn.', memberCount: 0, lastActivity: new Date().toISOString() },
];

export const GroupsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load joined groups from Firestore or localStorage
    if (user) {
      const fetchUserGroups = async () => {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          setJoinedGroups(userSnap.data().joined_groups || []);
        }
        setLoading(false);
      };
      fetchUserGroups();
    } else if (typeof window !== 'undefined') {
      const localGroups = JSON.parse(localStorage.getItem('joined_groups') || '[]');
      setJoinedGroups(localGroups);
      setLoading(false);
    }
  }, [user]);

  const handleJoin = async (e: React.MouseEvent, gId: string) => {
    e.stopPropagation();
    if (joinedGroups.includes(gId)) return;

    const nextGroups = [...joinedGroups, gId];
    setJoinedGroups(nextGroups);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          joined_groups: arrayUnion(gId)
        });
      } catch (err) {
        console.error('Error joining group in Firestore:', err);
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('joined_groups', JSON.stringify(nextGroups));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
            <Users size={24} />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">Discussion Groups</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">Join topic-based rooms to discuss and learn together.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {GROUPS_DATA.map((group, i) => (
          <motion.div
            key={group.id}
            id={`group-card-${group.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => router.push(`/community/groups/${group.id}`)}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
              {group.icon}
            </div>
            
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2 group-hover:text-emerald-600 transition-colors">
              {group.name}
            </h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              {group.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {group.memberCount} Members
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Active
                </span>
              </div>
              <button
                id={`group-join-btn-${group.id}`}
                onClick={(e) => handleJoin(e, group.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  joinedGroups.includes(group.id)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20'
                }`}
              >
                {joinedGroups.includes(group.id) ? (
                  <>
                    <CheckCircle2 size={14} />
                    Joined
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Join
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-emerald-900 text-white rounded-[32px] text-center">
        <p className="text-sm font-medium opacity-80">"Be respectful. This is an Islamic space. Offensive content will be removed."</p>
      </div>
    </div>
  );
};
