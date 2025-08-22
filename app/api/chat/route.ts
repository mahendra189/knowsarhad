
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmbedding } from '@/lib/embedding';


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





    // Get the latest user message
    const userQuery = messages[messages.length - 1]?.content || '';
    let contextEntries: Array<{ question: string; answer: string }> = [];
    if (userQuery) {
      // Semantic search using embedding
      const embedding = await getEmbedding(userQuery);
  const similar = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT question, answer, 1 - (embedding <=> $1::vector) AS similarity FROM "KnowledgeEntry" WHERE embedding IS NOT NULL ORDER BY embedding <=> $1::vector LIMIT 5`,
        embedding
      );
      // Use a similarity threshold if needed, or just take the top 5
  contextEntries = Array.isArray(similar) ? (similar as { question: string; answer: string }[]) : [];
    }

    // Build context string for the AI
    let contextString = '';
    if (contextEntries.length > 0) {
      contextString = contextEntries.map((e, i) => `Q${i+1}: ${e.question}\nA${i+1}: ${e.answer}`).join('\n');
    }

    // Add context as a system prompt if available
    const systemMessage: ChatMessage = {
      role: 'system',
      content:
        'You are a helpful AI assistant created for a college student project. Be helpful, informative, and educational in your responses. Use the following knowledge base as context if relevant.\n' +
        (contextString ? `Knowledge Base:\n${contextString}\n` : ''),
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