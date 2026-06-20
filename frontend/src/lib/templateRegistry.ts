/**
 * Template registry: 50 professional templates
 * 10 job roles × 5 layout styles
 */

export const JOB_ROLES = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps',
    'Marketing',
    'Finance',
    'Consultant',
    'Business Analyst',
    'Academic',
] as const;

export const LAYOUT_STYLES = [
    { id: 'classic', name: 'Classic Single Column' },
    { id: 'sidebar', name: 'Two Column Sidebar' },
    { id: 'executive', name: 'Executive Compact' },
    { id: 'structured', name: 'Structured Corporate' },
    { id: 'minimal', name: 'Minimal ATS Clean' },
] as const;

export type JobRole = (typeof JOB_ROLES)[number];
export type LayoutStyleId = (typeof LAYOUT_STYLES)[number]['id'];

export interface TemplateMeta {
    id: string;
    role: JobRole;
    layout: LayoutStyleId;
    name: string;
    description: string;
}

const ROLE_SLUGS: Record<JobRole, string> = {
    'Software Engineer': 'software_engineer',
    'Data Scientist': 'data_scientist',
    'Product Manager': 'product_manager',
    'UI/UX Designer': 'ui_ux_designer',
    DevOps: 'devops',
    Marketing: 'marketing',
    Finance: 'finance',
    Consultant: 'consultant',
    'Business Analyst': 'business_analyst',
    Academic: 'academic',
};

export function buildTemplateId(role: JobRole, layout: LayoutStyleId): string {
    return `${ROLE_SLUGS[role]}_${layout}`;
}

export function parseTemplateId(id: string): { role: JobRole; layout: LayoutStyleId } | null {
    for (const role of JOB_ROLES) {
        for (const { id: layout } of LAYOUT_STYLES) {
            if (buildTemplateId(role, layout) === id) {
                return { role, layout };
            }
        }
    }
    return null;
}

/** Generate all 50 template metadata entries */
export function generateTemplateRegistry(): TemplateMeta[] {
    const registry: TemplateMeta[] = [];
    for (const role of JOB_ROLES) {
        for (const { id: layout, name } of LAYOUT_STYLES) {
            const templateId = buildTemplateId(role, layout);
            registry.push({
                id: templateId,
                role,
                layout,
                name: `${role} — ${name}`,
                description: `${name} layout tailored for ${role} positions. ATS-friendly, professional formatting.`,
            });
        }
    }
    return registry;
}

export const TEMPLATE_REGISTRY = generateTemplateRegistry();
