/**
 * Structured resume JSON schema for template engine.
 * Shared across all templates; fully editable via controlled inputs.
 */

export interface ExperienceEntry {
    id?: string;
    company: string;
    role: string;
    duration: string;
    description: string;
}

export interface EducationEntry {
    id?: string;
    institution: string;
    degree: string;
    duration: string;
    details?: string;
}

export interface ProjectEntry {
    id?: string;
    name: string;
    description: string;
    tech?: string[];
}

export interface HeaderContent {
    name: string;
    contact: string;
}

export interface StructuredResume {
    header: HeaderContent;
    summary: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    projects: ProjectEntry[];
    skills: string[];
}

export const EMPTY_RESUME: StructuredResume = {
    header: { name: '', contact: '' },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
};
