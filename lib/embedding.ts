import { execSync } from 'child_process';

export async function getEmbedding(text: string): Promise<number[]> {
  // Call the local Python script to get the embedding
  try {
    const result = execSync(`python3 scripts/embed.py "${text.replace(/"/g, '\"')}"`).toString();
    return result.trim().split(',').map(Number);
  } catch (err) {
    console.error('Failed to generate embedding with local model:', err);
    throw new Error('Failed to generate embedding');
  }
}
