import { callAI } from './aiManager';

export interface SemanticAnalysisResult {
    atsScore: number;
    competencyBreakdown: {
        skills: number;
        projects: number;
        education: number;
        experience: number;
    };
    matchingSkills: string[];
    missingSkills: string[];
    projectRelevance: string;
    educationFit: string;
    experienceStrength: string;
    aiExplanation: string;
    improvementRoadmap: string[];
}

function normalizeResult(raw: any): SemanticAnalysisResult {
    const safeNum = (v: any) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
    const safeStr = (v: any) => (typeof v === 'string' ? v : '');
    const safeArr = (v: any) => (Array.isArray(v) ? v.filter((i) => typeof i === 'string') : []);

    return {
        atsScore: safeNum(raw.atsScore),
        competencyBreakdown: {
            skills: safeNum(raw.competencyBreakdown?.skills),
            projects: safeNum(raw.competencyBreakdown?.projects),
            education: safeNum(raw.competencyBreakdown?.education),
            experience: safeNum(raw.competencyBreakdown?.experience),
        },
        matchingSkills: safeArr(raw.matchingSkills),
        missingSkills: safeArr(raw.missingSkills),
        projectRelevance: safeStr(raw.projectRelevance),
        educationFit: safeStr(raw.educationFit),
        experienceStrength: safeStr(raw.experienceStrength),
        aiExplanation: safeStr(raw.aiExplanation),
        improvementRoadmap: safeArr(raw.improvementRoadmap),
    };
}

function buildPrompt(resumeText: string, role: string): string {
    return `You are an AI resume evaluation engine.

TARGET ROLE:
${role}

RESUME:
${resumeText.slice(0, 15000)}

Return ONLY valid JSON (no markdown):
{
  "atsScore": number,
  "competencyBreakdown": { "skills": number, "projects": number, "education": number, "experience": number },
  "matchingSkills": string[],
  "missingSkills": string[],
  "projectRelevance": string,
  "educationFit": string,
  "experienceStrength": string,
  "aiExplanation": string,
  "improvementRoadmap": string[]
}`;
}

export async function evaluateSemantic(
    resumeInput: string | Record<string, unknown>,
    roleOrJobDescription: string
): Promise<SemanticAnalysisResult | null> {
    const resumeText = typeof resumeInput === 'string' ? resumeInput : JSON.stringify(resumeInput);
    if (!resumeText.trim() || !roleOrJobDescription.trim()) {
        return null;
    }

    const result = await callAI<SemanticAnalysisResult>({
        prompt: buildPrompt(resumeText, roleOrJobDescription),
        feature: 'SEMANTIC_EVAL',
        useCache: true,
        parseJSON: true,
        temperature: 0.2,
    });

    if (!result.success || !result.data) {
        console.warn('[Semantic] AI evaluation failed:', result.error);
        return null;
    }

    return normalizeResult(result.data);
}
