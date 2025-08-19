import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  let results;
  if (query) {
    results = await prisma.knowledgeEntry.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  } else {
    results = await prisma.knowledgeEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, answer, tags, author } = body;
  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
  }
  try {
    const entry = await prisma.knowledgeEntry.create({
      data: {
        question,
        answer,
        tags: tags || [],
        author: author || 'Anonymous',
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save entry', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
