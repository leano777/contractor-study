import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// ADMIN HANDOUTS API
// ===========================================

// GET /api/admin/handouts - List all handouts
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data: handouts, error } = await supabase
      .from('handouts')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching handouts:', error);
      return NextResponse.json({ error: 'Failed to fetch handouts' }, { status: 500 });
    }

    // Get question counts for each handout
    const { data: questionCounts } = await supabase
      .from('questions')
      .select('handout_id')
      .not('handout_id', 'is', null);

    const countMap = new Map<string, number>();
    questionCounts?.forEach(q => {
      countMap.set(q.handout_id, (countMap.get(q.handout_id) || 0) + 1);
    });

    const enrichedHandouts = handouts?.map(h => ({
      ...h,
      questions_generated: countMap.get(h.id) || 0,
    }));

    return NextResponse.json({ handouts: enrichedHandouts });
  } catch (error) {
    console.error('Handouts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/handouts - Upload a new handout
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const licenseType = formData.get('licenseType') as string;
    const chapter = formData.get('chapter') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Determine file type
    const fileName = file.name.toLowerCase();
    let fileType: 'pdf' | 'docx' | 'image' | 'txt' = 'txt';
    if (fileName.endsWith('.pdf')) fileType = 'pdf';
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) fileType = 'docx';
    else if (file.type.startsWith('image/')) fileType = 'image';

    // Upload file to storage
    const filePath = `handouts/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('handouts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Create handout record
    const { data: handout, error } = await supabase
      .from('handouts')
      .insert({
        title,
        description,
        file_url: filePath,
        file_type: fileType,
        license_type: licenseType || 'both',
        chapter,
        is_processed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating handout:', error);
      return NextResponse.json({ error: 'Failed to create handout record' }, { status: 500 });
    }

    return NextResponse.json({ handout });
  } catch (error) {
    console.error('Handout upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/handouts?id=xxx - Delete a handout
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Handout ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get handout to find file path
    const { data: handout } = await supabase
      .from('handouts')
      .select('file_url')
      .eq('id', id)
      .single();

    if (handout?.file_url) {
      // Delete file from storage
      await supabase.storage.from('handouts').remove([handout.file_url]);
    }

    // Delete handout record (cascades to chunks and questions)
    const { error } = await supabase
      .from('handouts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting handout:', error);
      return NextResponse.json({ error: 'Failed to delete handout' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete handout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
