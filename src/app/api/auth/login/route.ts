import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ===========================================
// AUTH API: Magic Link Login
// ===========================================

// POST /api/auth/login - Send magic link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if email is registered as a student
    const adminClient = createAdminClient();
    const { data: student } = await adminClient
      .from('students')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (!student) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register first.' },
        { status: 404 }
      );
    }

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Magic link sent' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
