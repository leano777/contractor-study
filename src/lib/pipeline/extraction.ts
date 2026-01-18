import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// PHASE 3: CONTENT PIPELINE - Text Extraction
// ===========================================
// Extracts text from PDFs and images using Claude Vision

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface ExtractionResult {
  text: string;
  pageCount?: number;
  method: 'text' | 'vision';
  sections?: Array<{
    title: string;
    content: string;
    pageNumber?: number;
  }>;
}

/**
 * Extract text from a PDF file
 */
export async function extractFromPDF(
  fileBuffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  // Try text extraction first using pdf-parse
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(fileBuffer);

    if (pdfData.text.trim().length > 100) {
      return {
        text: pdfData.text,
        pageCount: pdfData.numpages,
        method: 'text',
      };
    }
  } catch (error) {
    console.log('PDF text extraction failed, falling back to vision:', error);
  }

  // If text extraction fails or returns little content, use Claude Vision
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY required for scanned PDF extraction');
  }

  // Convert PDF to images (you'd need a service like pdf2image)
  // For now, we'll indicate this needs external processing
  return {
    text: `[PDF requires OCR processing: ${filename}]`,
    method: 'vision',
  };
}

/**
 * Extract text from an image using Claude Vision
 */
export async function extractFromImage(
  imageBase64: string,
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
): Promise<ExtractionResult> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY required for image extraction');
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Extract all text from this image. This is a contractor license course handout.
            
Instructions:
- Preserve the structure and formatting as much as possible
- Include all headings, bullet points, and numbered lists
- Include any tables or diagrams described in text
- Include any code references or regulation numbers
- If there are multiple sections, clearly separate them

Output the extracted text in a clean, readable format.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    text,
    method: 'vision',
  };
}

/**
 * Analyze document structure and identify sections
 */
export async function analyzeDocumentStructure(
  text: string
): Promise<Array<{ title: string; startIndex: number; endIndex: number; summary: string }>> {
  if (!anthropic) {
    // Return simple chunking if no API key
    return [{
      title: 'Document Content',
      startIndex: 0,
      endIndex: text.length,
      summary: text.slice(0, 200),
    }];
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze this contractor license course document and identify its logical sections.

Document:
${text.slice(0, 15000)}  // Limit to avoid token limits

Return a JSON array with the following structure:
[
  {
    "title": "Section title",
    "startIndex": 0,
    "endIndex": 500,
    "summary": "Brief 1-2 sentence summary of this section"
  }
]

Focus on identifying:
- Major topic areas
- Code sections or regulations
- Procedures or processes
- Definitions or terminology sections
- Examples or case studies

Return ONLY valid JSON, no other text.`,
      },
    ],
  });

  try {
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '[]';
    return JSON.parse(responseText);
  } catch {
    // Fallback to simple sections
    return [{
      title: 'Document Content',
      startIndex: 0,
      endIndex: text.length,
      summary: text.slice(0, 200),
    }];
  }
}

/**
 * Process a handout through the full extraction pipeline
 */
export async function processHandout(handoutId: string): Promise<void> {
  const supabase = createAdminClient();

  // Get handout record
  const { data: handout, error } = await supabase
    .from('handouts')
    .select('*')
    .eq('id', handoutId)
    .single();

  if (error || !handout) {
    throw new Error(`Handout not found: ${handoutId}`);
  }

  // Download file from storage
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('handouts')
    .download(handout.file_url);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${handout.file_url}`);
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  let extractedText: string;

  // Extract based on file type
  if (handout.file_type === 'pdf') {
    const result = await extractFromPDF(buffer, handout.title);
    extractedText = result.text;
  } else if (handout.file_type === 'image') {
    const base64 = buffer.toString('base64');
    const result = await extractFromImage(base64, 'image/png');
    extractedText = result.text;
  } else {
    // Plain text
    extractedText = buffer.toString('utf-8');
  }

  // Update handout with extracted text
  await supabase
    .from('handouts')
    .update({
      extracted_text: extractedText,
      is_processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq('id', handoutId);

  console.log(`✅ Processed handout: ${handout.title}`);
}
