import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ===========================================
// STREAK FREEZE API
// ===========================================

// POST /api/students/me/streak-freeze - Use streak freeze
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current student data
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('streak_freeze_available, streak_count')
      .eq('id', user.id)
      .single();

    if (fetchError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.streak_freeze_available) {
      return NextResponse.json(
        { error: 'No streak freeze available' },
        { status: 400 }
      );
    }

    // Use the streak freeze
    const { error: updateError } = await supabase
      .from('students')
      .update({
        streak_freeze_available: false,
        streak_freeze_used_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to use streak freeze' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Streak freeze activated! Your streak is protected for today.',
      streakCount: student.streak_count,
    });
  } catch (error) {
    console.error('Streak freeze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/students/me/streak-freeze - Check streak freeze status
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: student, error } = await supabase
      .from('students')
      .select('streak_freeze_available, streak_freeze_used_at, streak_count')
      .eq('id', user.id)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      available: student.streak_freeze_available,
      lastUsed: student.streak_freeze_used_at,
      currentStreak: student.streak_count,
    });
  } catch (error) {
    console.error('Streak freeze status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
