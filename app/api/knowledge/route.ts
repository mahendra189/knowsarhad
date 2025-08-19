import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeEntry } from '@/types/knowledge';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for MVP (replace with DB in production)
let knowledgeBase: KnowledgeEntry[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  let results = knowledgeBase;
  if (query) {
    results = knowledgeBase.filter(entry =>
      entry.question.toLowerCase().includes(query) ||
      entry.answer.toLowerCase().includes(query) ||
      (entry.tags?.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, answer, tags, author } = body;
  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
  }
  const entry: KnowledgeEntry = {
    id: uuidv4(),
    question,
    answer,
    tags: tags || [],
    author: author || 'Anonymous',
    createdAt: new Date().toISOString(),
  };
  knowledgeBase.push(entry);
  return NextResponse.json(entry, { status: 201 });
}
