import React from 'react';
import { ClassicTemplate } from './ClassicTemplate';
import { SidebarTemplate } from './SidebarTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { StructuredTemplate } from './StructuredTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import type { StructuredResume } from '../lib/resumeSchema';
import type { LayoutStyleId } from '../lib/templateRegistry';

export { parseTemplateId } from '../lib/templateRegistry';

export interface TemplateProps {
    data: StructuredResume;
    onUpdate: (data: StructuredResume) => void;
    margin?: string;
    fontSize?: number;
}

const TEMPLATE_MAP: Record<LayoutStyleId, React.FC<TemplateProps>> = {
    classic: ClassicTemplate,
    sidebar: SidebarTemplate,
    executive: ExecutiveTemplate,
    structured: StructuredTemplate,
    minimal: MinimalTemplate,
};

export function getTemplateComponent(layout: LayoutStyleId): React.FC<TemplateProps> {
    return TEMPLATE_MAP[layout] || ClassicTemplate;
}

export { ClassicTemplate, SidebarTemplate, ExecutiveTemplate, StructuredTemplate, MinimalTemplate };
