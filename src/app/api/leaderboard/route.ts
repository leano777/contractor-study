import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ===========================================
// LEADERBOARD API
// ===========================================

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'streak'; // streak | accuracy | total
    const licenseTrack = searchParams.get('license');
    const limit = parseInt(searchParams.get('limit') || '20');

    const adminClient = createAdminClient();

    // Build query based on type
    let query = adminClient
      .from('students')
      .select('id, full_name, license_track, streak_count, longest_streak')
      .eq('is_active', true);

    // Filter by license track if specified
    if (licenseTrack && licenseTrack !== 'all') {
      query = query.or(`license_track.eq.${licenseTrack},license_track.eq.both`);
    }

    // Get students
    const { data: students, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Get response stats for each student
    const { data: allResponses } = await adminClient
      .from('challenge_responses')
      .select('student_id, is_correct');

    // Calculate stats per student
    const studentStats = new Map<string, { total: number; correct: number }>();
    allResponses?.forEach(r => {
      const stats = studentStats.get(r.student_id) || { total: 0, correct: 0 };
      stats.total++;
      if (r.is_correct) stats.correct++;
      studentStats.set(r.student_id, stats);
    });

    // Build leaderboard entries
    const leaderboard = students?.map(s => {
      const stats = studentStats.get(s.id) || { total: 0, correct: 0 };
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      return {
        id: s.id,
        name: s.full_name,
        initials: getInitials(s.full_name),
        licenseTrack: s.license_track,
        streak: s.streak_count,
        longestStreak: s.longest_streak,
        totalAnswered: stats.total,
        accuracy,
        score: calculateScore(s.streak_count, stats.total, accuracy),
      };
    }) || [];

    // Sort based on type
    switch (type) {
      case 'streak':
        leaderboard.sort((a, b) => b.streak - a.streak);
        break;
      case 'accuracy':
        leaderboard.sort((a, b) => {
          if (a.totalAnswered < 10 && b.totalAnswered >= 10) return 1;
          if (b.totalAnswered < 10 && a.totalAnswered >= 10) return -1;
          return b.accuracy - a.accuracy;
        });
        break;
      case 'total':
        leaderboard.sort((a, b) => b.totalAnswered - a.totalAnswered);
        break;
      default:
        leaderboard.sort((a, b) => b.score - a.score);
    }

    // Add rank
    const rankedLeaderboard = leaderboard.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Get current user's rank if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let currentUserRank = null;
    if (user) {
      const userIndex = leaderboard.findIndex(e => e.id === user.id);
      if (userIndex !== -1) {
        currentUserRank = {
          ...leaderboard[userIndex],
          rank: userIndex + 1,
        };
      }
    }

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUser: currentUserRank,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function calculateScore(streak: number, total: number, accuracy: number): number {
  // Weighted score: streak (40%) + volume (30%) + accuracy (30%)
  const streakScore = Math.min(streak * 10, 100);
  const volumeScore = Math.min(total, 100);
  const accuracyScore = accuracy;
  
  return Math.round(streakScore * 0.4 + volumeScore * 0.3 + accuracyScore * 0.3);
}
