import { NextRequest, NextResponse } from 'next/server';
import { getRelevantF1Info } from '../../../lib/f1-knowledge';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // For now, use clean knowledge base for all responses to ensure quality
    const cleanResponse = getRelevantF1Info(message);
    const response = `🏎️ **Formula 1 Information:**\n\n${cleanResponse}`;
    
    return NextResponse.json({
      message: response,
      sources: ['Curated F1 Knowledge Base'],
      foundResults: 1
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
