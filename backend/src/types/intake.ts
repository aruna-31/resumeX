/**
 * Common candidate schema after intake processing (CSV, PDF, DOCX, ZIP).
 */
export interface NormalizedCandidate {
    name: string;
    email: string;
    skills: string[];
    experience_years: number;
    education: string[];
    projects: Array<{ name?: string; description?: string; tech?: string[] }>;
    parsed_text: string;
}

export function emptyCandidate(name: string, email: string): NormalizedCandidate {
    return {
        name: name || 'Unknown',
        email: email || `candidate-${Date.now()}@import.local`,
        skills: [],
        experience_years: 0,
        education: [],
        projects: [],
        parsed_text: '',
    };
}
