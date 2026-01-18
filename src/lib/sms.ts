import twilio from 'twilio';

// ===========================================
// PHASE 2: INFRASTRUCTURE - SMS Service
// ===========================================
// Uses Twilio for SMS notifications

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface WelcomeSMSParams {
  to: string;
  name: string;
  language?: 'en' | 'es';
}

export async function sendWelcomeSMS({ to, name }: WelcomeSMSParams) {
  if (!client || !FROM_NUMBER) {
    console.log('📱 [Demo] Would send welcome SMS to:', to);
    return;
  }

  await client.messages.create({
    body: `Welcome to Contractor License Study, ${name}! 📚 Your first daily challenge is coming soon. Reply STOP to unsubscribe.`,
    from: FROM_NUMBER,
    to: formatPhoneNumber(to),
  });
}

interface ChallengeSMSParams {
  to: string;
  name: string;
}

export async function sendDailyChallengeSMS({ to, name }: ChallengeSMSParams) {
  if (!client || !FROM_NUMBER) {
    console.log('📱 [Demo] Would send challenge SMS to:', to);
    return;
  }

  await client.messages.create({
    body: `🎯 Hey ${name}! Your daily challenge is ready. 5 questions waiting for you. Keep that streak alive! ${process.env.NEXT_PUBLIC_APP_URL}/challenge`,
    from: FROM_NUMBER,
    to: formatPhoneNumber(to),
  });
}

interface StreakReminderSMSParams {
  to: string;
  name: string;
  currentStreak: number;
}

export async function sendStreakReminderSMS({ to, name, currentStreak }: StreakReminderSMSParams) {
  if (!client || !FROM_NUMBER) {
    console.log('📱 [Demo] Would send streak reminder SMS to:', to);
    return;
  }

  await client.messages.create({
    body: `🔥 ${name}, your ${currentStreak}-day streak is at risk! Complete today's challenge before midnight. ${process.env.NEXT_PUBLIC_APP_URL}/challenge`,
    from: FROM_NUMBER,
    to: formatPhoneNumber(to),
  });
}

// Helper to format phone numbers for Twilio (E.164 format)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 prefix for US numbers if not present
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as-is if already formatted
  return phone.startsWith('+') ? phone : `+${digits}`;
}
