import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// ADMIN QUESTIONS API
// ===========================================

// GET /api/admin/questions - List all questions
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'verified' | 'unverified' | 'all'
    const difficulty = searchParams.get('difficulty');
    const licenseType = searchParams.get('licenseType');

    let query = supabase
      .from('questions')
      .select(`
        *,
        handouts (
          title
        )
      `, { count: 'exact' });

    // Search filter
    if (search) {
      query = query.ilike('question_text', `%${search}%`);
    }

    // Status filter
    if (status === 'verified') {
      query = query.eq('is_verified', true);
    } else if (status === 'unverified') {
      query = query.eq('is_verified', false);
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    // License type filter
    if (licenseType && licenseType !== 'all') {
      query = query.eq('license_type', licenseType);
    }

    // Sorting - unverified first, then by date
    query = query
      .order('is_verified', { ascending: true })
      .order('created_at', { ascending: false });

    // Pagination
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data: questions, error, count } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    // Transform to include source handout title
    const transformedQuestions = questions?.map(q => ({
      ...q,
      source_handout: q.handouts?.title || 'Unknown',
      handouts: undefined,
    }));

    return NextResponse.json({
      questions: transformedQuestions,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > page * pageSize,
    });
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/questions - Create a question manually
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supabase = createAdminClient();

    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        question_text: data.questionText,
        options: data.options,
        correct_answer: data.correctAnswer,
        explanation: data.explanation,
        difficulty: data.difficulty,
        license_type: data.licenseType,
        topic_tags: data.topicTags || [],
        handout_id: data.handoutId || null,
        is_ai_generated: false,
        is_verified: true, // Manual questions are auto-verified
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/questions - Update a question
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Map camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.questionText) dbUpdates.question_text = updates.questionText;
    if (updates.options) dbUpdates.options = updates.options;
    if (updates.correctAnswer) dbUpdates.correct_answer = updates.correctAnswer;
    if (updates.explanation) dbUpdates.explanation = updates.explanation;
    if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
    if (updates.licenseType) dbUpdates.license_type = updates.licenseType;
    if (updates.topicTags) dbUpdates.topic_tags = updates.topicTags;
    if (typeof updates.isVerified === 'boolean') {
      dbUpdates.is_verified = updates.isVerified;
      if (updates.isVerified) {
        dbUpdates.verified_at = new Date().toISOString();
      }
    }

    const { data: question, error } = await supabase
      .from('questions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/questions?id=xxx - Delete a question
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
