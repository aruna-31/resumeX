/**
 * HR semantic screening: one core evaluator per candidate.
 * No keyword matching; Gemini-only reasoning.
 * Sorts by semanticMatchScore descending.
 */

import { evaluateSemantic } from './semanticCoreEngine';

export interface HRCandidateInput {
    candidateId: string;
    resumeText?: string;
    resumeJson?: Record<string, unknown>;
}

export interface HRCandidateSemanticResult {
    candidateId: string;
    semanticMatchScore: number;
    technicalAlignment: number;
    educationFit: number;
    projectDepthScore: number;
    domainRelevance: number;
    riskFlags: string[];
    reasoning: string;
    strengths: string[];
    missingCompetencies: string[];
}

/**
 * Run semantic evaluation for each candidate against the same job context.
 * Job context = role + description (no static skill list matching).
 */
export async function runSemanticHRScreening(
    jobRole: string,
    jobDescription: string,
    candidates: HRCandidateInput[]
): Promise<HRCandidateSemanticResult[]> {
    const roleContext = [jobRole, jobDescription].filter(Boolean).join('\n\n');
    if (!roleContext.trim() || candidates.length === 0) return [];

    const results: HRCandidateSemanticResult[] = [];

    for (const c of candidates) {
        const resumeInput = (c.resumeText && c.resumeText.trim())
            ? c.resumeText
            : (c.resumeJson ? JSON.stringify(c.resumeJson) : '');
        if (!resumeInput.trim()) {
            results.push({
                candidateId: c.candidateId,
                semanticMatchScore: 0,
                technicalAlignment: 0,
                educationFit: 0,
                projectDepthScore: 0,
                domainRelevance: 0,
                riskFlags: ['No resume content'],
                reasoning: 'No resume content to evaluate.',
                strengths: [],
                missingCompetencies: [],
            });
            continue;
        }

        // Call v2 semantic engine (signature: resume, role)
        const core = await evaluateSemantic(resumeInput, roleContext);

        if (!core) {
            results.push({
                candidateId: c.candidateId,
                semanticMatchScore: 0,
                technicalAlignment: 0,
                educationFit: 0,
                projectDepthScore: 0,
                domainRelevance: 0,
                riskFlags: ['Semantic evaluation unavailable'],
                reasoning: 'Evaluation could not be completed.',
                strengths: [],
                missingCompetencies: [],
            });
            continue;
        }

        results.push({
            candidateId: c.candidateId,
            semanticMatchScore: core.atsScore,
            technicalAlignment: core.competencyBreakdown.skills,
            educationFit: core.competencyBreakdown.education,
            projectDepthScore: core.competencyBreakdown.projects,
            domainRelevance: core.competencyBreakdown.experience, // Mapping experience to domain relevance as proxy
            riskFlags: core.missingSkills, // Using missing skills as risk flags
            reasoning: core.aiExplanation,
            strengths: core.matchingSkills,
            missingCompetencies: core.missingSkills,
        });
    }

    results.sort((a, b) => b.semanticMatchScore - a.semanticMatchScore);
    return results;
}
