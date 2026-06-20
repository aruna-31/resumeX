/**
 * resumeX Canvas Editor Data Model
 * 
 * This file defines the core types and interfaces for the resume editor.
 * Using 'type' for all definitions to ensure consistent behavior with Vite/ESBuild.
 */

export type LayoutLayout =
    | 'PROFESSIONAL'  // Single Column
    | 'MODERN'        // Two Column
    | 'CREATIVE';      // Sidebar Layout

export type FontStyle = {
    family: string;
    size: string;
    weight: string;
    lineHeight: string;
    color?: string;
    letterSpacing?: string;
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
};

export type SectionType =
    | 'HEADER'
    | 'SUMMARY'
    | 'EXPERIENCE'
    | 'EDUCATION'
    | 'SKILLS'
    | 'CERTIFICATIONS'
    | 'CUSTOM';

export type EditableBlock = {
    id: string;
    type: SectionType;
    title: string;
    content: any; // HTML string or structured data
    isVisible: boolean;
    order: number;
    column?: 1 | 2; // For multi-column layouts
};

export type DesignSystem = {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    typography: {
        name: FontStyle;
        heading: FontStyle;
        subheading: FontStyle;
        body: FontStyle;
    };
    spacing: {
        margins: string;
        sectionGap: string;
        itemGap: string;
    };
};

export type EditableResume = {
    id: string;
    templateId: string;
    layoutType: LayoutLayout;
    design: DesignSystem;
    blocks: EditableBlock[];
    metadata: {
        isATSFriendly: boolean;
        lastModified: number;
    };
};
