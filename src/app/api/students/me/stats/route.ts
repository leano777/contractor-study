import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ===========================================
// STUDENT STATS API
// ===========================================

// GET /api/students/me/stats - Get current student statistics
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return demo stats for unauthenticated users
      return NextResponse.json({
        demo: true,
        stats: getDemoStats(),
      });
    }

    // Get student info
    const { data: student } = await supabase
      .from('students')
      .select('streak_count, longest_streak, license_track')
      .eq('id', user.id)
      .single();

    // Get all responses
    const { data: responses } = await supabase
      .from('challenge_responses')
      .select(`
        is_correct,
        answered_at,
        questions (
          difficulty,
          topic_tags
        )
      `)
      .eq('student_id', user.id);

    // Calculate stats
    const totalAnswered = responses?.length || 0;
    const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // Get challenges completed
    const { count: challengesCompleted } = await supabase
      .from('daily_challenges')
      .select('id', { count: 'exact', head: true })
      .in('id', 
        [...new Set(responses?.map(r => r.challenge_id) || [])]
      );

    // Topic breakdown
    const topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }> = {};
    responses?.forEach(r => {
      const tags = (r.questions as any)?.topic_tags || [];
      tags.forEach((tag: string) => {
        if (!topicBreakdown[tag]) {
          topicBreakdown[tag] = { total: 0, correct: 0, accuracy: 0 };
        }
        topicBreakdown[tag].total++;
        if (r.is_correct) topicBreakdown[tag].correct++;
      });
    });
    Object.keys(topicBreakdown).forEach(tag => {
      topicBreakdown[tag].accuracy = Math.round(
        (topicBreakdown[tag].correct / topicBreakdown[tag].total) * 100
      );
    });

    // Difficulty breakdown
    const difficultyBreakdown: Record<string, { total: number; correct: number; accuracy: number }> = {
      easy: { total: 0, correct: 0, accuracy: 0 },
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 },
    };
    responses?.forEach(r => {
      const difficulty = (r.questions as any)?.difficulty;
      if (difficulty && difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].total++;
        if (r.is_correct) difficultyBreakdown[difficulty].correct++;
      }
    });
    Object.keys(difficultyBreakdown).forEach(diff => {
      if (difficultyBreakdown[diff].total > 0) {
        difficultyBreakdown[diff].accuracy = Math.round(
          (difficultyBreakdown[diff].correct / difficultyBreakdown[diff].total) * 100
        );
      }
    });

    // Recent activity (last 14 days)
    const recentActivity: Array<{ date: string; completed: boolean; score: number }> = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResponses = responses?.filter(r => 
        r.answered_at?.startsWith(dateStr)
      ) || [];
      
      const dayCorrect = dayResponses.filter(r => r.is_correct).length;
      
      recentActivity.push({
        date: dateStr,
        completed: dayResponses.length >= 5,
        score: dayResponses.length > 0 ? Math.round((dayCorrect / dayResponses.length) * 100) : 0,
      });
    }

    return NextResponse.json({
      stats: {
        totalQuestionsAnswered: totalAnswered,
        correctAnswers,
        accuracy,
        currentStreak: student?.streak_count || 0,
        longestStreak: student?.longest_streak || 0,
        challengesCompleted: challengesCompleted || 0,
        topicBreakdown,
        difficultyBreakdown,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDemoStats() {
  return {
    totalQuestionsAnswered: 127,
    correctAnswers: 99,
    accuracy: 78,
    currentStreak: 7,
    longestStreak: 14,
    challengesCompleted: 18,
    topicBreakdown: {
      'Building Codes': { total: 45, correct: 36, accuracy: 80 },
      'Licensing': { total: 32, correct: 28, accuracy: 88 },
      'Safety': { total: 28, correct: 20, accuracy: 71 },
      'Business Law': { total: 22, correct: 15, accuracy: 68 },
    },
    difficultyBreakdown: {
      easy: { total: 50, correct: 45, accuracy: 90 },
      medium: { total: 52, correct: 38, accuracy: 73 },
      hard: { total: 25, correct: 16, accuracy: 64 },
    },
    recentActivity: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.random() > 0.3,
        score: Math.floor(Math.random() * 40) + 60,
      };
    }),
  };
}
