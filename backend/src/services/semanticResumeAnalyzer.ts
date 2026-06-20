/**
 * Candidate-facing semantic resume analysis.
 * Uses semanticCoreEngine only; no keyword matching or static lists.
 */

import { evaluateSemantic, SemanticAnalysisResult } from './semanticCoreEngine';

// Re-export the type so other files can use it
export type { SemanticAnalysisResult };

/**
 * Analyze resume semantically against the candidate's target role.
 */
export async function analyzeResumeSemantic(
    resumeTextOrJson: string | Record<string, unknown>,
    targetRole: string
): Promise<SemanticAnalysisResult | null> {
    const core = await evaluateSemantic(resumeTextOrJson, targetRole);
    if (!core) return null;

    return core;
}
