import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';
import { sendWelcomeSMS } from '@/lib/sms';

// ===========================================
// PHASE 1: QUICK WIN - Registration API
// ===========================================
// Handles student registration submissions.
// Phase 1: Stores to localStorage/JSON (demo mode)
// Phase 2+: Stores to Supabase + sends notifications
// Also sends to Google Sheets via webhook

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  licenses: string[]; // Array of license codes (e.g., ['A', 'B', 'C-10', 'C-36'])
  preferredContact: 'email' | 'sms' | 'both';
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  language?: 'en' | 'es';
}

// Send registration data to Google Sheets
async function sendToGoogleSheets(data: RegistrationData): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Google Sheets webhook URL not configured, skipping...');
    return;
  }

  try {
    // Map field names to match Google Apps Script expectations
    const payload = {
      fullName: data.fullName,
      phoneNumber: data.phone, // Script expects phoneNumber
      email: data.email,
      licenseType: data.licenses.join(', '), // Script expects licenseType as string
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Google Sheets webhook error:', response.status, await response.text());
    } else {
      console.log('✅ Registration sent to Google Sheets');
    }
  } catch (error) {
    console.error('Failed to send to Google Sheets:', error);
    // Don't throw - we don't want to fail registration if sheets fails
  }
}

// Helper to determine legacy license_track from licenses array
function getLegacyLicenseTrack(licenses: string[]): 'A' | 'B' | 'both' {
  const hasA = licenses.includes('A');
  const hasB = licenses.includes('B');
  if (hasA && hasB) return 'both';
  if (hasA) return 'A';
  if (hasB) return 'B';
  // If only specialty licenses, default to 'B' (General Building) as the closest match
  return 'B';
}

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();

    // Validate required fields
    if (!data.fullName || !data.email || !data.phone || !data.licenses || data.licenses.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && supabaseUrl !== 'https://xxxxx.supabase.co') {
      // ========================================
      // PHASE 2+: Store in Supabase
      // ========================================
      const supabase = await createClient();

      // Check for existing registration
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 409 }
        );
      }

      // Insert new student
      const { data: student, error } = await supabase
        .from('students')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          // Store both formats for compatibility
          license_track: getLegacyLicenseTrack(data.licenses),
          licenses: data.licenses,
          preferred_contact: data.preferredContact,
          preferred_language: data.language || 'en',
          referral_source: data.referralSource,
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
          notification_preferences: {
            email: data.preferredContact === 'email' || data.preferredContact === 'both',
            sms: data.preferredContact === 'sms' || data.preferredContact === 'both',
            push: true,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to save registration' },
          { status: 500 }
        );
      }

      // Send welcome notifications (non-blocking)
      const notifications: Promise<void>[] = [];

      if (data.preferredContact === 'email' || data.preferredContact === 'both') {
        notifications.push(
          sendWelcomeEmail({
            to: data.email,
            name: data.fullName,
            licenseTrack: getLegacyLicenseTrack(data.licenses),
            language: data.language,
          }).catch(console.error) as Promise<void>
        );
      }

      if (data.preferredContact === 'sms' || data.preferredContact === 'both') {
        notifications.push(
          sendWelcomeSMS({
            to: data.phone,
            name: data.fullName,
            language: data.language,
          }).catch(console.error) as Promise<void>
        );
      }

      // Don't await - let notifications send in background
      Promise.all(notifications);

      // Send to Google Sheets (non-blocking)
      sendToGoogleSheets(data).catch(console.error);

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        studentId: student.id,
      });
    } else {
      // ========================================
      // PHASE 1: Demo Mode (no Supabase)
      // ========================================
      // In demo mode, we just log the registration
      // This lets you test the form without setting up Supabase

      console.log('📝 New registration (demo mode):', {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        licenses: data.licenses,
        license_track: getLegacyLicenseTrack(data.licenses),
        preferred_contact: data.preferredContact,
        preferred_language: data.language || 'en',
        referral_source: data.referralSource,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        enrolled_at: new Date().toISOString(),
      });

      // Send to Google Sheets (this works even in demo mode!)
      await sendToGoogleSheets(data);

      // Simulate a slight delay like a real API
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        message: 'Registration successful (demo mode)',
        demo: true,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list registrations (admin only - Phase 2)
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || supabaseUrl === 'https://xxxxx.supabase.co') {
    return NextResponse.json({
      students: [],
      demo: true,
      message: 'Configure Supabase to see real registrations',
    });
  }

  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('enrolled_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }

  return NextResponse.json({ students });
}
