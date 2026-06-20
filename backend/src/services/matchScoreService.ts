import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function getEmbedding(text: string, taskType: TaskType = TaskType.RETRIEVAL_DOCUMENT): Promise<number[]> {
    const result = await embeddingModel.embedContent({
        content: { role: 'user', parts: [{ text }] },
        taskType,
    });
    return result.embedding.values;
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Calculate match score between resume and job requirement text using Gemini embeddings and cosine similarity.
 * @param resumeText - Raw resume text
 * @param jobText - Job requirement text (title + description + skills)
 * @returns Match percentage 0-100, or null if embedding fails
 */
export async function calculateMatchScore(resumeText: string, jobText: string): Promise<number | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set');
        return null;
    }

    const resume = (resumeText || '').trim();
    const job = (jobText || '').trim();
    if (resume.length < 10 || job.length < 10) {
        return null;
    }

    try {
        const [resumeEmbedding, jobEmbedding] = await Promise.all([
            getEmbedding(resume, TaskType.RETRIEVAL_DOCUMENT),
            getEmbedding(job, TaskType.RETRIEVAL_QUERY),
        ]);

        const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
        // Cosine similarity is [-1, 1]; map to [0, 100]
        const percent = Math.max(0, Math.min(100, ((similarity + 1) / 2) * 100));
        return Math.round(percent * 10) / 10;
    } catch (err: any) {
        console.error('calculateMatchScore error:', err.message);
        return null;
    }
}
