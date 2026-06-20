import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
    },
});

export interface ScreeningExplanation {
    matching_skills: string[];
    missing_skills: string[];
    explanation: string;
}

const PROMPT = `You are an ATS screening analyst. Given a resume (JSON), the job's required skills, and the computed similarity score, produce a concise screening explanation.

Return ONLY valid JSON with this exact structure:
{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "explanation": "2-4 sentence human-readable explanation of the match. Include: how well the candidate fits, key strengths from matching skills, gaps from missing skills, and overall recommendation."
}

Rules:
- matching_skills: skills from required_skills that appear in the resume (exact or close match)
- missing_skills: skills from required_skills NOT found in the resume
- explanation: brief, professional, actionable
- Consider skills from resume.skills and resume.experience[].description and resume.projects[].tech`;

/**
 * Generate AI screening explanation from resume JSON, required skills, and match score.
 */
export async function generateScreeningExplanation(
    resumeJson: Record<string, unknown> | null,
    requiredSkills: string[],
    similarityScore: number
): Promise<ScreeningExplanation | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set');
        return null;
    }

    const skillsStr = Array.isArray(requiredSkills) ? JSON.stringify(requiredSkills) : '[]';
    const resumeStr = resumeJson ? JSON.stringify(resumeJson) : '{}';

    const prompt = `${PROMPT}

RESUME JSON:
${resumeStr}

REQUIRED SKILLS:
${skillsStr}

SIMILARITY SCORE (0-100): ${similarityScore}

Return the JSON object only.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) return null;

        let jsonStr = text.trim();
        const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlock) {
            jsonStr = codeBlock[1].trim();
        } else {
            const braceMatch = text.match(/\{[\s\S]*\}/);
            if (braceMatch) jsonStr = braceMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        return {
            matching_skills: Array.isArray(parsed.matching_skills) ? parsed.matching_skills : [],
            missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
            explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
        };
    } catch (err: any) {
        console.error('generateScreeningExplanation error:', err.message);
        return null;
    }
}
