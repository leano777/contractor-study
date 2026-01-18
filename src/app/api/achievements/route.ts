import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ===========================================
// ACHIEVEMENTS API
// ===========================================

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Streak achievements
  { id: 'streak-3', title: 'Getting Started', description: 'Complete a 3-day streak', category: 'streak', requirement: 3, rarity: 'common' },
  { id: 'streak-7', title: 'Week Warrior', description: 'Complete a 7-day streak', category: 'streak', requirement: 7, rarity: 'common' },
  { id: 'streak-14', title: 'Fortnight Fighter', description: 'Complete a 14-day streak', category: 'streak', requirement: 14, rarity: 'rare' },
  { id: 'streak-30', title: 'Monthly Master', description: 'Complete a 30-day streak', category: 'streak', requirement: 30, rarity: 'epic' },
  { id: 'streak-100', title: 'Century Champion', description: 'Complete a 100-day streak', category: 'streak', requirement: 100, rarity: 'legendary' },
  
  // Accuracy achievements
  { id: 'accuracy-perfect', title: 'Perfect Challenge', description: 'Score 100% on a daily challenge', category: 'accuracy', requirement: 1, rarity: 'rare' },
  { id: 'accuracy-80', title: 'Consistent Performer', description: 'Maintain 80% accuracy over 50 questions', category: 'accuracy', requirement: 50, rarity: 'epic' },
  
  // Volume achievements
  { id: 'volume-10', title: 'First Steps', description: 'Answer 10 questions', category: 'volume', requirement: 10, rarity: 'common' },
  { id: 'volume-50', title: 'Studious', description: 'Answer 50 questions', category: 'volume', requirement: 50, rarity: 'common' },
  { id: 'volume-100', title: 'Century Club', description: 'Answer 100 questions', category: 'volume', requirement: 100, rarity: 'rare' },
  { id: 'volume-500', title: 'Knowledge Seeker', description: 'Answer 500 questions', category: 'volume', requirement: 500, rarity: 'epic' },
  { id: 'volume-1000', title: 'Question Crusher', description: 'Answer 1000 questions', category: 'volume', requirement: 1000, rarity: 'legendary' },
  
  // Special achievements
  { id: 'special-early', title: 'Early Bird', description: 'Complete a challenge before 8 AM', category: 'special', requirement: 1, rarity: 'rare' },
  { id: 'special-topics', title: 'Well Rounded', description: 'Answer questions from all topics', category: 'special', requirement: 6, rarity: 'epic' },
];

// GET /api/achievements - Get student's achievements
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Calculate progress for unauthenticated users (demo mode)
    if (!user) {
      return NextResponse.json({
        demo: true,
        achievements: ACHIEVEMENT_DEFINITIONS.map(a => ({
          ...a,
          progress: 0,
          unlocked: false,
          unlockedAt: null,
        })),
      });
    }

    // Get student data
    const { data: student } = await supabase
      .from('students')
      .select('streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    // Get response stats
    const { data: responses } = await supabase
      .from('challenge_responses')
      .select('is_correct, answered_at')
      .eq('student_id', user.id);

    const totalAnswered = responses?.length || 0;
    const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    // Get unlocked achievements from database
    const { data: unlockedAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_id, unlocked_at')
      .eq('student_id', user.id);

    const unlockedMap = new Map(
      unlockedAchievements?.map(a => [a.achievement_id, a.unlocked_at]) || []
    );

    // Calculate progress for each achievement
    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => {
      let progress = 0;
      
      switch (def.category) {
        case 'streak':
          progress = student?.longest_streak || 0;
          break;
        case 'volume':
          progress = totalAnswered;
          break;
        case 'accuracy':
          if (def.id === 'accuracy-80' && accuracy >= 80) {
            progress = totalAnswered;
          }
          break;
      }

      const unlocked = unlockedMap.has(def.id);
      
      return {
        ...def,
        progress,
        unlocked,
        unlockedAt: unlockedMap.get(def.id) || null,
      };
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/achievements/check - Check and unlock achievements
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student data
    const { data: student } = await supabase
      .from('students')
      .select('streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    // Get response stats
    const { data: responses } = await supabase
      .from('challenge_responses')
      .select('is_correct')
      .eq('student_id', user.id);

    const totalAnswered = responses?.length || 0;
    const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    // Get already unlocked achievements
    const { data: unlockedAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', user.id);

    const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

    // Check which achievements should be unlocked
    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedIds.has(def.id)) continue;

      let shouldUnlock = false;
      
      switch (def.category) {
        case 'streak':
          shouldUnlock = (student?.longest_streak || 0) >= def.requirement;
          break;
        case 'volume':
          shouldUnlock = totalAnswered >= def.requirement;
          break;
        case 'accuracy':
          if (def.id === 'accuracy-80') {
            shouldUnlock = totalAnswered >= def.requirement && accuracy >= 80;
          }
          break;
      }

      if (shouldUnlock) {
        // Insert achievement
        await supabase
          .from('student_achievements')
          .insert({
            student_id: user.id,
            achievement_id: def.id,
            unlocked_at: new Date().toISOString(),
          });
        
        newlyUnlocked.push(def.id);
      }
    }

    return NextResponse.json({
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `Unlocked ${newlyUnlocked.length} new achievement(s)!`
        : 'No new achievements',
    });
  } catch (error) {
    console.error('Achievement check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
