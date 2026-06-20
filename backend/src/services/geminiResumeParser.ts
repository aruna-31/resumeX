import { callAI } from './aiManager';

export interface ParsedResume {
    skills: string[];
    experience: Array<{ company?: string; role?: string; duration?: string; description?: string }>;
    projects: Array<{ name?: string; description?: string; tech?: string[] }>;
    total_years: number;
}

const EXTRACTION_PROMPT = `You are an advanced resume parser.
Extract the following from the resume text. Return valid JSON only.

Required structure:
{
  "skills": ["skill1"],
  "experience": [{ "company": "", "role": "", "duration": "", "description": "" }],
  "projects": [{ "name": "", "description": "", "tech": [] }],
  "total_years": 0
}`;

export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume | null> {
    if (!resumeText || resumeText.trim().length < 50) {
        return null;
    }

    const result = await callAI<ParsedResume>({
        prompt: `${EXTRACTION_PROMPT}\n\nRESUME TEXT:\n${resumeText.slice(0, 12000)}`,
        feature: 'PARSE_RESUME',
        useCache: true,
        parseJSON: true,
    });

    if (!result.success || !result.data) {
        console.warn('[ResumeParser] AI parse failed:', result.error);
        return null;
    }

    const parsed = result.data;
    return {
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        total_years: typeof parsed.total_years === 'number' ? parsed.total_years : 0,
    };
}
