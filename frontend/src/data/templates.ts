export type LayoutType = 'SINGLE_COLUMN' | 'TWO_COLUMN' | 'MODERN_SIDEBAR' | 'EXECUTIVE' | 'MINIMALIST' | 'CREATIVE_GRID';

export interface ResumeTemplate {
    id: string;
    name: string;
    description: string;
    category: 'Modern' | 'Minimalist' | 'Professional' | 'Student' | 'Creative' | 'ATS-Optimized';
    layoutType: LayoutType;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
    };
    typography: {
        heading: string;
        body: string;
    };
}

export const templates: ResumeTemplate[] = [
    {
        id: 'tmplt_executive',
        name: 'The Executive',
        description: 'Single-column professional layout with a bold header. Best for senior roles.',
        category: 'Professional',
        layoutType: 'SINGLE_COLUMN',
        colors: {
            primary: '#0F172A',
            secondary: '#475569',
            accent: '#2563EB',
            text: '#1E293B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-serif',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_modern_sidebar',
        name: 'The Modernist',
        description: 'Clean two-column design with a high-contrast sidebar for skills.',
        category: 'Modern',
        layoutType: 'MODERN_SIDEBAR',
        colors: {
            primary: '#1E293B',
            secondary: '#F8FAFC',
            accent: '#3B82F6',
            text: '#334155',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-black',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_creative',
        name: 'The Creative',
        description: 'Bold aesthetics with unique grid positioning. Ideal for designers.',
        category: 'Creative',
        layoutType: 'CREATIVE_GRID',
        colors: {
            primary: '#DB2777',
            secondary: '#FDF2F8',
            accent: '#BE185D',
            text: '#1E293B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-black italic',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_minimalist',
        name: 'The Minimalist',
        description: 'Maximize impact with white space. Pure ATS-friendly structure.',
        category: 'Minimalist',
        layoutType: 'MINIMALIST',
        colors: {
            primary: '#000000',
            secondary: '#FFFFFF',
            accent: '#64748B',
            text: '#18181B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-light tracking-tighter',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_student_clean',
        name: 'The Intern',
        description: 'Focus on education and small projects. Perfect for first-time jobs.',
        category: 'Student',
        layoutType: 'SINGLE_COLUMN',
        colors: {
            primary: '#4F46E5',
            secondary: '#F5F3FF',
            accent: '#6366F1',
            text: '#1E1B4B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-bold',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_tech_lead',
        name: 'The Tech Lead',
        description: 'Compact layout optimized for technical skills and high-impact bullets.',
        category: 'ATS-Optimized',
        layoutType: 'TWO_COLUMN',
        colors: {
            primary: '#020617',
            secondary: '#F1F5F9',
            accent: '#10B981',
            text: '#334155',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-mono uppercase',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_startup',
        name: 'Startup Hustle',
        description: 'Dynamic and approachable style for high-growth environments.',
        category: 'Modern',
        layoutType: 'MODERN_SIDEBAR',
        colors: {
            primary: '#7C3AED',
            secondary: '#F5F3FF',
            accent: '#8B5CF6',
            text: '#1E293B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-bold',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_legal',
        name: 'The Counsel',
        description: 'Sophisticated serif layout with strict hierarchies for legal professionals.',
        category: 'Professional',
        layoutType: 'SINGLE_COLUMN',
        colors: {
            primary: '#1A1A1A',
            secondary: '#F5F5F5',
            accent: '#722F37',
            text: '#333333',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-serif font-bold',
            body: 'font-serif'
        }
    },
    {
        id: 'tmplt_graduate',
        name: 'First Class',
        description: 'Highlights honors and academic achievements for new grads.',
        category: 'Student',
        layoutType: 'TWO_COLUMN',
        colors: {
            primary: '#1E3A8A',
            secondary: '#EFF6FF',
            accent: '#3B82F6',
            text: '#1E293B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-sans font-black',
            body: 'font-sans'
        }
    },
    {
        id: 'tmplt_academic',
        name: 'The Scholar',
        description: 'Classic single-column style for teaching and research positions.',
        category: 'Professional',
        layoutType: 'SINGLE_COLUMN',
        colors: {
            primary: '#312E81',
            secondary: '#EEF2FF',
            accent: '#4338CA',
            text: '#1E1B4B',
            background: '#FFFFFF'
        },
        typography: {
            heading: 'font-serif font-medium italic',
            body: 'font-serif'
        }
    }
];
