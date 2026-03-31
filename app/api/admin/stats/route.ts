import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db, collection, getDocs, query, where } from '@/lib/firebase';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const donationsSnap = await getDocs(collection(db, 'donations'));
    
    let totalDonations = 0;
    donationsSnap.forEach(doc => {
      totalDonations += doc.data().amount || 0;
    });

    return NextResponse.json({
      totalUsers: usersSnap.size,
      totalDonations: totalDonations,
      totalEnrollments: 856, // Mock
      activeUsers: 42, // Mock
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
