import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmbedding } from '@/lib/embedding';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  let results;
  if (query) {
    // Semantic search using embedding
    const embedding = await getEmbedding(query);
    // Use raw SQL for vector similarity search
    // 0.8 is a typical similarity threshold, adjust as needed
    const threshold = 0.8;
    const similar = await prisma.$queryRawUnsafe<any[]>(
      `SELECT *, 1 - (embedding <=> $1) AS similarity FROM "KnowledgeEntry" WHERE embedding IS NOT NULL ORDER BY embedding <=> $1 LIMIT 10`,
      embedding
    );
    // If no sufficiently similar result, fallback to keyword search
    if (Array.isArray(similar) && similar.length && similar[0].similarity > threshold) {
      results = similar;
    } else {
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
    }
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
  console.log('Received POST:', { question, answer, tags, author });
  if (!question || !answer) {
    console.log('Missing question or answer');
    return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
  }
  try {
    // Generate embedding for the question
    const embedding = await getEmbedding(question);
    console.log('Generated embedding:', embedding?.slice(0, 5), '...');
    // Use raw SQL to insert embedding
    const entry = await prisma.$queryRawUnsafe(
      `INSERT INTO "KnowledgeEntry" (id, question, answer, tags, author, "createdAt", embedding) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), $5) RETURNING id, question, answer, tags, author, "createdAt"`,
      question,
      answer,
      tags || [],
      author || 'Anonymous',
      embedding
    );
    console.log('DB insert result:', entry);
    return NextResponse.json(Array.isArray(entry) ? entry[0] : entry, { status: 201 });
  } catch (error) {
    console.error('Failed to save entry:', error);
    return NextResponse.json({ error: 'Failed to save entry', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
