import { Resend } from 'resend';

// ===========================================
// PHASE 2: INFRASTRUCTURE - Email Service
// ===========================================
// Uses Resend for transactional emails

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'study@example.com';

interface WelcomeEmailParams {
  to: string;
  name: string;
  licenseTrack: 'A' | 'B' | 'both';
}

export async function sendWelcomeEmail({ to, name, licenseTrack }: WelcomeEmailParams) {
  if (!resend) {
    console.log('📧 [Demo] Would send welcome email to:', to);
    return;
  }

  const trackDescription = 
    licenseTrack === 'A' ? 'General Engineering (License A)' :
    licenseTrack === 'B' ? 'General Building (License B)' :
    'General Engineering & Building (License A & B)';

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to Contractor License Study! 📚',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .highlight { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome, ${name}! 🎉</h1>
            </div>
            <div class="content">
              <p>You've successfully registered for the Contractor License Study System!</p>
              
              <div class="highlight">
                <strong>Your License Track:</strong> ${trackDescription}
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>📱 You'll receive your first daily challenge soon</li>
                <li>📖 Access study materials anytime</li>
                <li>💬 Ask our AI assistant any code compliance questions</li>
                <li>🏆 Build your streak and compete with classmates</li>
              </ul>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                Go to Dashboard →
              </a>
              
              <p style="color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or ask your instructor.
              </p>
            </div>
            <div class="footer">
              <p>Contractor License Study System</p>
              <p>You're receiving this because you registered for exam prep.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

interface ChallengeNotificationParams {
  to: string;
  name: string;
  challengeDate: string;
}

export async function sendDailyChallengeEmail({ to, name, challengeDate }: ChallengeNotificationParams) {
  if (!resend) {
    console.log('📧 [Demo] Would send challenge email to:', to);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🔥 Your daily challenge is ready, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 48px;">🎯</h1>
              <h2 style="margin: 10px 0 0 0;">Daily Challenge Ready!</h2>
            </div>
            <div class="content">
              <p style="font-size: 18px;">Hey ${name}, your 5 questions for today are waiting!</p>
              <p style="color: #6b7280;">Complete them before midnight to keep your streak alive.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/challenge" class="button">
                Start Challenge →
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

interface StreakReminderParams {
  to: string;
  name: string;
  currentStreak: number;
}

export async function sendStreakReminderEmail({ to, name, currentStreak }: StreakReminderParams) {
  if (!resend) {
    console.log('📧 [Demo] Would send streak reminder to:', to);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Don't break your ${currentStreak}-day streak, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .streak { font-size: 64px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="streak">🔥 ${currentStreak}</div>
            <h2>Your streak is at risk!</h2>
            <p>You haven't completed today's challenge yet.</p>
            <p style="color: #6b7280;">Complete it before midnight to keep your ${currentStreak}-day streak alive!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/challenge" class="button">
              Save My Streak →
            </a>
          </div>
        </body>
      </html>
    `,
  });
}
