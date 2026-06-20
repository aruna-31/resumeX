import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
    },
});

export interface RoleProfile {
    core_skills: string[];
    tools: string[];
    experience_expectation: string;
    soft_skills: string[];
}

export interface SemanticEvaluationResult {
    overall_score: number;
    strong_matches: string[];
    partial_matches: string[];
    missing_skills: Array<{
        skill: string;
        why_important: string;
        how_to_improve: string;
    }>;
    summary: string;
}

export interface VisualizationData {
    radar_chart: {
        technical_skills: number;
        tools_match: number;
        experience_alignment: number;
        soft_skills: number;
    };
    bar_chart: Array<{ category: 'Strong' | 'Partial' | 'Missing'; value: number }>;
}

export interface HRRoleProfile {
    core_skills: string[];
    tools: string[];
    experience_required: number;
    soft_skills: string[];
}

export interface RankedCandidate {
    candidate_name: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    risk_flags: string[];
    why_shortlisted: string;
}

export interface HRAnalyticsSummary {
    average_match_score: number;
    top_5_distribution: Array<{ candidate_name: string; score: number }>;
    skill_gap_heatmap: Array<{ skill: string; count: number }>;
    experience_distribution: Array<{ bucket: string; count: number }>;
}

export interface OptimizedResume {
    summary: string;
    technical_skills: string[];
    work_experience: Array<{
        company?: string;
        role?: string;
        duration?: string;
        description?: string;
        achievements?: string[];
    }>;
    projects: Array<{
        name?: string;
        description?: string;
        tech?: string[];
        impact?: string;
    }>;
    education: Array<{
        degree?: string;
        field?: string;
        institution?: string;
        graduation_year?: string;
        notes?: string;
    }>;
}

export interface EducationRelevanceResult {
    education_score: number;
    education_relevance_level: 'High' | 'Medium' | 'Low';
    strengths: string[];
    gaps: string[];
    reasoning: string;
}

export interface SemanticHireEvaluationResult {
    overall_score: number;
    skills_score: number;
    project_score: number;
    experience_score: number;
    education_score: number;
    impact_score: number;
    strengths: string[];
    gaps: string[];
    risk_flags: string[];
    summary: string;
}

export async function generateRoleProfile(roleTitle: string): Promise<RoleProfile | null> {
    if (!roleTitle || !roleTitle.trim()) {
        throw new Error('roleTitle is required');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping generateRoleProfile');
        return null;
    }

    const prompt = `
You are an expert hiring manager and career architect.

Task: For the given role title, infer concise, realistic expectations used in modern hiring pipelines.

Role Title: ${roleTitle}

Requirements:
- Work for ANY role title (technical, non-technical, leadership, niche).
- Do NOT hardcode skill lists; reason from the title itself.
- Use specific, industry-relevant expectations.
- Avoid generic corporate buzzwords or inflated language.

Return ONLY a JSON object with this exact structure:
{
  "core_skills": ["...", "..."],
  "tools": ["...", "..."],
  "experience_expectation": "short natural sentence or two",
  "soft_skills": ["...", "..."]
}

Guidelines:
- "core_skills": primary technical / domain capabilities for the role.
- "tools": concrete frameworks, platforms, or systems commonly used.
- "experience_expectation": 1–2 sentences, realistic ranges (e.g. "3–5 years building...").
- "soft_skills": interpersonal and execution skills, but avoid vague hype words.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as RoleProfile;

    return {
        core_skills: Array.isArray(parsed.core_skills) ? parsed.core_skills : [],
        tools: Array.isArray(parsed.tools) ? parsed.tools : [],
        experience_expectation: parsed.experience_expectation || '',
        soft_skills: Array.isArray(parsed.soft_skills) ? parsed.soft_skills : [],
    };
}

export async function evaluateCandidateSemantically(
    roleProfile: RoleProfile,
    resumeJson: any
): Promise<SemanticEvaluationResult | null> {
    if (!roleProfile) {
        throw new Error('roleProfile is required');
    }
    if (!resumeJson) {
        throw new Error('resumeJson is required');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping evaluateCandidateSemantically');
        return null;
    }

    const roleProfileText = JSON.stringify(roleProfile);
    const resumeText = JSON.stringify(resumeJson);

    const prompt = `
You are an ATS-style evaluator doing SEMANTIC matching between a role profile and a candidate resume.

Role Profile (JSON):
${roleProfileText}

Candidate Resume (JSON):
${resumeText}

Your job:
- Compare the resume against the role profile using semantic reasoning, not raw keyword overlap.
- Consider transferable skills (e.g. related frameworks, adjacent domains, similar responsibilities).
- Identify:
  - Strong matches (clear, direct alignment with the role profile expectations).
  - Partial matches (related or adjacent experience that could transfer).
  - Missing competencies (important gaps given the role profile).
- Provide concise, human-readable explanations.
- Avoid buzzword stuffing, repetition, or exaggerated claims.
- Use a natural, professional tone.

Return ONLY a JSON object with this exact structure:
{
  "overall_score": 0,
  "strong_matches": ["...", "..."],
  "partial_matches": ["...", "..."],
  "missing_skills": [
    {
      "skill": "",
      "why_important": "",
      "how_to_improve": ""
    }
  ],
  "summary": ""
}

Scoring guidelines:
- 0–49: weak alignment.
- 50–69: some relevant overlap, notable gaps.
- 70–84: solid match with a few gaps.
- 85–100: strong match with only minor gaps.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as SemanticEvaluationResult;

    return {
        overall_score: typeof parsed.overall_score === 'number' ? parsed.overall_score : 0,
        strong_matches: Array.isArray(parsed.strong_matches) ? parsed.strong_matches : [],
        partial_matches: Array.isArray(parsed.partial_matches) ? parsed.partial_matches : [],
        missing_skills: Array.isArray(parsed.missing_skills)
            ? parsed.missing_skills.map((m) => ({
                  skill: m.skill || '',
                  why_important: m.why_important || '',
                  how_to_improve: m.how_to_improve || '',
              }))
            : [],
        summary: parsed.summary || '',
    };
}

/**
 * Transform raw candidate text into a structured, ATS-friendly resume JSON.
 */
export async function transformRawTextToResume(rawText: string): Promise<OptimizedResume | null> {
    if (!rawText || rawText.trim().length < 30) {
        throw new Error('rawText is too short');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping transformRawTextToResume');
        return null;
    }

    const prompt = `
You are a professional resume writer.

Transform the following raw candidate text into a fully ATS-optimized resume.

Requirements:
- Generate a strong professional summary.
- Rewrite experience using clear action verbs.
- Quantify impact where the text supports it (do not invent numbers).
- Structure into:
  Summary
  Technical Skills
  Work Experience
  Projects
  Education

Return ONLY structured JSON in this exact shape:
{
  "summary": "",
  "technical_skills": [],
  "work_experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": "",
      "achievements": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": [],
      "impact": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "institution": "",
      "graduation_year": "",
      "notes": ""
    }
  ]
}

RAW TEXT:
${rawText}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as OptimizedResume;

    return {
        summary: parsed.summary || '',
        technical_skills: Array.isArray(parsed.technical_skills) ? parsed.technical_skills : [],
        work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
    };
}

/**
 * Evaluate education relevance for a given role and job description.
 */
export async function evaluateEducationRelevance(
    roleTitle: string,
    jobDescription: string,
    educationJson: unknown
): Promise<EducationRelevanceResult | null> {
    if (!roleTitle || !roleTitle.trim()) {
        throw new Error('roleTitle is required');
    }
    if (!educationJson) {
        throw new Error('educationJson is required');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping evaluateEducationRelevance');
        return null;
    }

    const eduText = typeof educationJson === 'string' ? educationJson : JSON.stringify(educationJson);

    const prompt = `
You are an expert technical recruiter.

Evaluate the candidate’s education relevance for the given job role.

Consider:
- Degree field relevance
- Level of education (Bachelor, Master, PhD)
- Specialization alignment
- Institutional strength (if mentioned)
- Field-to-role mapping

Job Role:
${roleTitle}

Job Description:
${jobDescription}

Candidate Education (JSON):
${eduText}

Return ONLY JSON:

{
  "education_score": 0,
  "education_relevance_level": "High",
  "strengths": [],
  "gaps": [],
  "reasoning": ""
}

Rules:
- education_score: integer 0-100.
- education_relevance_level: one of "High", "Medium", "Low".
- Use a natural, professional tone, no buzzwords or fluff.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as EducationRelevanceResult;

    const score =
        typeof parsed.education_score === 'number'
            ? Math.max(0, Math.min(100, Math.round(parsed.education_score)))
            : 0;
    const level =
        parsed.education_relevance_level === 'High' ||
        parsed.education_relevance_level === 'Medium' ||
        parsed.education_relevance_level === 'Low'
            ? parsed.education_relevance_level
            : 'Low';

    return {
        education_score: score,
        education_relevance_level: level,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
        reasoning: parsed.reasoning || '',
    };
}

/**
 * Deep semantic evaluation of a candidate profile against a target role.
 */
export async function semanticHireEvaluation(
    roleTitle: string,
    jobDescription: string,
    candidateJson: unknown
): Promise<SemanticHireEvaluationResult | null> {
    if (!roleTitle || !roleTitle.trim()) {
        throw new Error('roleTitle is required');
    }
    if (!candidateJson) {
        throw new Error('candidateJson is required');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping semanticHireEvaluation');
        return null;
    }

    const candidateText = typeof candidateJson === 'string' ? candidateJson : JSON.stringify(candidateJson);

    const prompt = `
You are a semantic hiring intelligence engine.

Evaluate the candidate against the given role using deep semantic reasoning.

Do NOT use keyword matching.
Analyze contextual meaning.

Evaluate across:

1. Skills Alignment
2. Project Relevance
3. Experience Depth
4. Education Alignment
5. Practical Impact

Job Role:
${roleTitle}

Job Description:
${jobDescription}

Candidate Profile (Structured JSON):
${candidateText}

Return ONLY JSON:

{
  "overall_score": 0,
  "skills_score": 0,
  "project_score": 0,
  "experience_score": 0,
  "education_score": 0,
  "impact_score": 0,
  "strengths": [],
  "gaps": [],
  "risk_flags": [],
  "summary": ""
}

Rules:
- All scores are integers 0-100.
- Use semantic reasoning, including transferable skills and domain adjacencies.
- No buzzword stuffing or repetition; keep explanations natural and specific.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as SemanticHireEvaluationResult;

    const clampScore = (v: unknown) =>
        typeof v === 'number' ? Math.max(0, Math.min(100, Math.round(v))) : 0;

    return {
        overall_score: clampScore(parsed.overall_score),
        skills_score: clampScore(parsed.skills_score),
        project_score: clampScore(parsed.project_score),
        experience_score: clampScore(parsed.experience_score),
        education_score: clampScore(parsed.education_score),
        impact_score: clampScore(parsed.impact_score),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
        risk_flags: Array.isArray(parsed.risk_flags) ? parsed.risk_flags : [],
        summary: parsed.summary || '',
    };
}

/**
 * Convert a detailed semantic evaluation (with component scores) into
 * chart-ready visualization data.
 *
 * This helper expects an object shaped like the "AI career intelligence system"
 * output (overall_score + per-dimension scores).
 */
export function toVisualizationData(evaluation: {
    overall_score: number;
    skills_alignment_score: number;
    project_relevance_score: number;
    experience_depth_score: number;
    education_alignment_score: number;
    practical_impact_score: number;
    strengths: string[];
    areas_to_improve: Array<{ area: string; reason: string; improvement_suggestion: string }>;
}): VisualizationData {
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

    const technical_skills = clamp(evaluation.skills_alignment_score);
    const tools_match = clamp((evaluation.practical_impact_score + evaluation.skills_alignment_score) / 2);
    const experience_alignment = clamp(evaluation.experience_depth_score);
    const soft_skills = clamp((evaluation.education_alignment_score + evaluation.practical_impact_score) / 2);

    const strongCount = evaluation.strengths.length;
    const missingCount = evaluation.areas_to_improve.length;
    const estimatedTotal = Math.max(strongCount + missingCount, 1);
    const partialCount = Math.max(
        0,
        Math.round((evaluation.overall_score / 100) * estimatedTotal) - strongCount
    );

    return {
        radar_chart: {
            technical_skills,
            tools_match,
            experience_alignment,
            soft_skills,
        },
        bar_chart: [
            { category: 'Strong', value: strongCount },
            { category: 'Partial', value: partialCount },
            { category: 'Missing', value: missingCount },
        ],
    };
}

/**
 * Generate an HR-facing role profile by normalizing inputs into a measurable structure.
 */
export function generateHRRoleProfile(
    roleTitle: string,
    jobDescription: string,
    requiredSkills: string[],
    experienceRequired: number
): HRRoleProfile {
    const normalizeList = (items: string[]) =>
        Array.from(
            new Set(
                (items || [])
                    .map((s) => s.trim())
                    .filter(Boolean)
            )
        );

    const baseSkills = normalizeList(requiredSkills);

    // Naive extraction of additional skills from JD (comma / newline separated phrases)
    const jdPhrases = jobDescription
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3 && s.length < 80);

    const jdSkills = jdPhrases.filter((p) =>
        /(experience|proficient|hands-on|expertise|knowledge|familiar)/i.test(p)
    );

    const core_skills = normalizeList([...baseSkills, ...jdSkills]);

    // Simple heuristic: classify some items as tools / platforms
    const toolKeywords = /(aws|azure|gcp|kubernetes|docker|react|node|sql|postgres|mysql|salesforce|figma|excel|power bi|tableau)/i;
    const tools = core_skills.filter((s) => toolKeywords.test(s));

    const softSkillKeywords = [
        'communication',
        'stakeholder management',
        'mentoring',
        'leadership',
        'ownership',
        'collaboration',
        'problem solving',
        'decision making',
        'conflict resolution',
    ];

    const soft_skills = softSkillKeywords.filter((k) =>
        (jobDescription + ' ' + roleTitle).toLowerCase().includes(k.toLowerCase())
    );

    const years = Number.isFinite(experienceRequired) ? experienceRequired : 0;

    return {
        core_skills,
        tools,
        experience_required: years,
        soft_skills,
    };
}

/**
 * Rank candidates semantically for a given role profile using Gemini.
 * Expects candidateResumeList items of shape: { name: string, resume: any }.
 */
export async function rankCandidatesSemantically(
    roleProfile: HRRoleProfile,
    candidateResumeList: Array<{ name: string; resume: any }>
): Promise<{ ranked_candidates: RankedCandidate[] } | null> {
    if (!roleProfile) {
        throw new Error('roleProfile is required');
    }
    if (!candidateResumeList || candidateResumeList.length === 0) {
        throw new Error('candidateResumeList is required');
    }
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, skipping rankCandidatesSemantically');
        return null;
    }

    const roleText = JSON.stringify(roleProfile);
    const candidatesText = JSON.stringify(
        candidateResumeList.map((c) => ({ candidate_name: c.name, resume: c.resume }))
    );

    const prompt = `
You are an AI recruitment intelligence engine.

Rank multiple candidates semantically for a given role.

Do NOT use simple keyword matching.
Evaluate depth and contextual relevance.

ROLE PROFILE (JSON):
${roleText}

CANDIDATE LIST (JSON):
${candidatesText}

For each candidate evaluate:

1. Skills alignment (35%)
2. Project relevance (25%)
3. Experience depth (20%)
4. Education alignment (10%)
5. Practical impact (10%)

Provide ONLY a JSON object with this exact structure:
{
  "ranked_candidates": [
    {
      "candidate_name": "",
      "overall_score": 0,
      "skills_score": 0,
      "projects_score": 0,
      "experience_score": 0,
      "education_score": 0,
      "impact_score": 0,
      "strength_summary": "",
      "risk_flags": [],
      "recommendation": ""
    }
  ]
}

Sort by overall_score descending. Use a natural, professional tone without buzzwords or repetition in summaries.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
        jsonStr = codeBlock[1].trim();
    } else {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as {
        ranked_candidates: Array<{
            candidate_name: string;
            overall_score: number;
            skills_score: number;
            projects_score: number;
            experience_score: number;
            education_score: number;
            impact_score: number;
            strength_summary: string;
            risk_flags: string[];
            recommendation: string;
        }>;
    };

    const ranked_candidates: RankedCandidate[] = (parsed.ranked_candidates || []).map((c) => ({
        candidate_name: c.candidate_name || '',
        score: typeof c.overall_score === 'number' ? c.overall_score : 0,
        strengths: c.strength_summary ? [c.strength_summary] : [],
        weaknesses: (c.risk_flags || []).map((f) => f),
        risk_flags: Array.isArray(c.risk_flags) ? c.risk_flags : [],
        why_shortlisted: c.recommendation || '',
    }));

    // Ensure sorted descending by score
    ranked_candidates.sort((a, b) => b.score - a.score);

    return { ranked_candidates };
}

/**
 * Generate aggregate HR analytics from ranked candidates.
 */
export function generateHRAnalytics(rankedCandidates: RankedCandidate[]): HRAnalyticsSummary {
    if (!rankedCandidates || rankedCandidates.length === 0) {
        return {
            average_match_score: 0,
            top_5_distribution: [],
            skill_gap_heatmap: [],
            experience_distribution: [],
        };
    }

    const average_match_score =
        rankedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / rankedCandidates.length;

    const top_5 = [...rankedCandidates]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((c) => ({ candidate_name: c.candidate_name, score: c.score }));

    // Approximate skill gaps by aggregating weakness phrases
    const skillCounts = new Map<string, number>();
    rankedCandidates.forEach((c) => {
        c.weaknesses.forEach((w) => {
            const key = w.trim();
            if (!key) return;
            skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
        });
    });

    const skill_gap_heatmap = Array.from(skillCounts.entries()).map(([skill, count]) => ({
        skill,
        count,
    }));

    // Simple experience buckets inferred from risk flags mentioning experience gaps
    const buckets = new Map<string, number>([
        ['Strong Experience', 0],
        ['Moderate Experience', 0],
        ['Experience Risk', 0],
    ]);

    rankedCandidates.forEach((c) => {
        const hasExperienceRisk = c.risk_flags.some((f) =>
            /experience gap|junior for role|insufficient years/i.test(f)
        );
        if (hasExperienceRisk) {
            buckets.set('Experience Risk', (buckets.get('Experience Risk') || 0) + 1);
        } else if (c.score >= 80) {
            buckets.set('Strong Experience', (buckets.get('Strong Experience') || 0) + 1);
        } else {
            buckets.set('Moderate Experience', (buckets.get('Moderate Experience') || 0) + 1);
        }
    });

    const experience_distribution = Array.from(buckets.entries()).map(([bucket, count]) => ({
        bucket,
        count,
    }));

    return {
        average_match_score: Number(average_match_score.toFixed(1)),
        top_5_distribution: top_5,
        skill_gap_heatmap,
        experience_distribution,
    };
}


