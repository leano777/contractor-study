import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// ADMIN STUDENTS API
// ===========================================

// GET /api/admin/students - List all students
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const licenseTrack = searchParams.get('licenseTrack');
    const sortBy = searchParams.get('sortBy') || 'enrolled_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // License track filter
    if (licenseTrack && licenseTrack !== 'all') {
      query = query.eq('license_track', licenseTrack);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data: students, error, count } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    return NextResponse.json({
      students,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > page * pageSize,
    });
  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/students - Create a student (admin)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supabase = createAdminClient();

    const { data: student, error } = await supabase
      .from('students')
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        license_track: data.licenseTrack,
        preferred_contact: data.preferredContact || 'both',
        notification_preferences: {
          email: true,
          sms: true,
          push: true,
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
