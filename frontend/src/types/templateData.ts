import type { EditableResume } from './editor';
import { TEMPLATE_REGISTRY, buildTemplateId } from '../lib/templateRegistry';
import { getMockResumeForRole } from '../lib/mockDataByRole';
import { structuredToBlocks } from '../lib/resumeConverter';
import type { JobRole, LayoutStyleId } from '../lib/templateRegistry';

const CORPORATE_DESIGN = {
    colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#000000',
        background: '#FFFFFF',
        text: '#000000',
    },
    typography: {
        name: {
            family: '"Times New Roman", Times, serif',
            size: '14pt',
            weight: '700',
            lineHeight: '1.2',
        },
        heading: {
            family: '"Times New Roman", Times, serif',
            size: '11pt',
            weight: '700',
            lineHeight: '1.3',
        },
        subheading: {
            family: '"Times New Roman", Times, serif',
            size: '10pt',
            weight: '600',
            lineHeight: '1.4',
        },
        body: {
            family: '"Times New Roman", Times, serif',
            size: '11pt',
            weight: '400',
            lineHeight: '1.5',
        },
    },
    spacing: {
        margins: '40px',
        sectionGap: '1rem',
        itemGap: '0.5rem',
    },
};

function createTemplate(role: JobRole, layout: LayoutStyleId): EditableResume {
    const templateId = buildTemplateId(role, layout);
    const mockData = getMockResumeForRole(role);
    const blocks = structuredToBlocks(mockData);
    return {
        id: `tpl_${templateId}`,
        templateId,
        layoutType: 'PROFESSIONAL',
        design: CORPORATE_DESIGN,
        blocks,
        metadata: { isATSFriendly: true, lastModified: Date.now() },
    };
}

/** 50 professional templates: 10 roles × 5 layouts */
export const INITIAL_TEMPLATES: EditableResume[] = (() => {
    const templates: EditableResume[] = [];
    const roles: JobRole[] = [
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
    ];
    const layouts: LayoutStyleId[] = ['classic', 'sidebar', 'executive', 'structured', 'minimal'];
    for (const role of roles) {
        for (const layout of layouts) {
            templates.push(createTemplate(role, layout));
        }
    }
    return templates;
})();

export { TEMPLATE_REGISTRY };
