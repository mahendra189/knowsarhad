import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeEntry } from '@/types/knowledge';
// Helper to search the knowledge base API for relevant answers
async function searchKnowledgeBase(query: string): Promise<KnowledgeEntry[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/knowledge?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Get the OpenRouter API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const { messages }: { messages: ChatMessage[] } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }


    // Try to answer from the community knowledge base first
    const userQuery = messages[messages.length - 1]?.content || '';
    if (userQuery) {
      const kbResults = await searchKnowledgeBase(userQuery);
      if (kbResults.length > 0) {
        // Return the most relevant answer (first match)
        return NextResponse.json({
          message: kbResults[0].answer,
          source: 'community',
        });
      }
    }

    // If no relevant community answer, call the AI as before
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant created for a college student project. Be helpful, informative, and educational in your responses. Remember that this is part of a learning experience.'
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'College AI Assistant',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo-instruct',
        messages: [systemMessage, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI service',
          details: response.status === 401 ? 'Invalid API key' : 'Service temporarily unavailable'
        },
        { status: response.status }
      );
    }

    const data: OpenRouterResponse = await response.json();
    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    const aiMessage = data.choices[0].message.content;
    return NextResponse.json({
      message: aiMessage,
      model: 'openai/gpt-3.5-turbo-instruct'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}