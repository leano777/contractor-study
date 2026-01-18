import { NextRequest, NextResponse } from 'next/server';
import { createDailyChallenge } from '@/lib/challenge-engine';
import { createAdminClient } from '@/lib/supabase/server';
import { sendDailyChallengeEmail } from '@/lib/email';
import { sendDailyChallengeSMS } from '@/lib/sms';

// ===========================================
// PHASE 4: DAILY CHALLENGES - Cron Job
// ===========================================
// Runs daily at 7:00 AM PT to:
// 1. Create new challenges for License A and B
// 2. Send notifications to all active students

export async function GET(request: NextRequest) {
  // Verify cron secret (protect from unauthorized calls)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const today = new Date();

    // 1. Create challenges for both license types
    const challengeA = await createDailyChallenge('A', today);
    const challengeB = await createDailyChallenge('B', today);

    console.log('Created challenges:', { A: challengeA, B: challengeB });

    // 2. Get all active students
    const { data: students } = await supabase
      .from('students')
      .select('id, email, phone, full_name, license_track, notification_preferences')
      .eq('is_active', true);

    if (!students?.length) {
      return NextResponse.json({
        success: true,
        message: 'No active students to notify',
        challenges: { A: challengeA, B: challengeB },
      });
    }

    // 3. Send notifications
    const notificationResults = {
      emailsSent: 0,
      smsSent: 0,
      errors: 0,
    };

    for (const student of students) {
      const prefs = student.notification_preferences as {
        email?: boolean;
        sms?: boolean;
      };

      // Send email notification
      if (prefs?.email) {
        try {
          await sendDailyChallengeEmail({
            to: student.email,
            name: student.full_name.split(' ')[0],
            challengeDate: today.toISOString().split('T')[0],
          });
          notificationResults.emailsSent++;
        } catch (err) {
          console.error(`Email failed for ${student.email}:`, err);
          notificationResults.errors++;
        }
      }

      // Send SMS notification
      if (prefs?.sms && student.phone) {
        try {
          await sendDailyChallengeSMS({
            to: student.phone,
            name: student.full_name.split(' ')[0],
          });
          notificationResults.smsSent++;
        } catch (err) {
          console.error(`SMS failed for ${student.phone}:`, err);
          notificationResults.errors++;
        }
      }

      // Rate limiting - don't blast all notifications at once
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      challenges: { A: challengeA, B: challengeB },
      notifications: notificationResults,
      studentsNotified: students.length,
    });
  } catch (error) {
    console.error('Daily challenge cron error:', error);
    return NextResponse.json(
      { error: 'Failed to run daily challenge cron' },
      { status: 500 }
    );
  }
}
