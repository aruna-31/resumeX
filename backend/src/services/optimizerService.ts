/**
 * AI-powered resume section optimizer.
 * Section-aware LLM enhancement: no generic prefixes/suffixes, no fluff.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export type SectionType = 'summary' | 'experience' | 'project' | 'education' | 'skills';

const SECTION_RULES: Record<SectionType, string> = {
    summary: '3–4 lines, punchy. No fluff. Lead with value, not adjectives.',
    experience: 'Action verb + measurable outcome. Quantify when possible (%, scale, time). Avoid vague duties.',
    project: 'Technical depth and architecture clarity. Stack, problem solved, outcome.',
    education: 'Highlight relevance to role. Degree, institution, coursework if relevant. No filler.',
    skills: 'Group logically. Be specific (e.g., React Hooks vs generic React). No buzzwords.',
};

const BANNED_PHRASES = [
    'Strategically', 'Leveraging', 'Results-driven', 'Passionate about', 'Synergy',
    'to drive business impact', 'to drive measurable impact', 'technical excellence',
    'game-changing', 'thought leader', 'best-in-class', 'cutting-edge solutions',
    'proven track record', 'deep dive', 'circle back', 'move the needle',
];

function buildSectionPrompt(sectionType: SectionType, role: string, originalText: string): string {
    const rules = SECTION_RULES[sectionType];
    const banned = BANNED_PHRASES.join(', ');
    return `You are a professional resume editor. Rewrite the given content for a resume.

Section: ${sectionType}
Target role: ${role || 'General'}

Rules:
1. Do NOT use: ${banned}
2. Do NOT add generic prefixes or suffixes
3. Do NOT repeat similar phrasing
4. ${rules}
5. Add quantification when possible (numbers, scale, time)
6. Improve technical specificity where relevant
7. Remove fluff; keep meaning intact
8. Return ONLY the improved text, no preamble or explanation

Original content:
"""
${originalText}
"""

Return only the rewritten content.`;
}

/**
 * Optimize a resume section with section-aware LLM enhancement.
 */
export async function optimizeSection(
    sectionType: SectionType,
    originalText: string,
    targetRole: string = ''
): Promise<string> {
    try {
        const text = (originalText || '').trim();
        if (!text) return originalText;

        const prompt = buildSectionPrompt(sectionType, targetRole, text);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const improved = response.text().trim();

        if (!improved) return originalText;
        return improved;
    } catch (error) {
        console.error('Optimizer Service Error:', error);
        return originalText; // Fail safe by returning original
    }
}

/**
 * Normalize section name to SectionType.
 */
export function normalizeSectionType(sectionName: string): SectionType {
    const s = (sectionName || '').toLowerCase().trim();
    if (/summary|profile|objective|overview/.test(s)) return 'summary';
    if (/experience|work|employment|professional/.test(s)) return 'experience';
    if (/project|projects/.test(s)) return 'project';
    if (/education|degree|academic/.test(s)) return 'education';
    if (/skill|skills|technical|expertise/.test(s)) return 'skills';
    return 'summary';
}
