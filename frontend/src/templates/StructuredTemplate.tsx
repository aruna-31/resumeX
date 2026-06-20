import React from 'react';
import { ResumeContainer } from './shared/ResumeContainer';
import {
    renderHeader,
    renderSummary,
    renderExperience,
    renderEducation,
    renderSkills,
    renderProjects,
} from './shared/TemplateBlock';
import type { StructuredResume } from '../lib/resumeSchema';

interface StructuredTemplateProps {
    data: StructuredResume;
    onUpdate: (data: StructuredResume) => void;
    margin?: string;
    fontSize?: number;
}

export const StructuredTemplate: React.FC<StructuredTemplateProps> = ({
    data,
    onUpdate,
    margin,
    fontSize,
}) => {
    const update = (field: keyof StructuredResume, value: unknown) => {
        onUpdate({ ...data, [field]: value });
    };

    const sectionClass = 'border-b border-black/20 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0';

    return (
        <ResumeContainer margin={margin} fontSize={fontSize}>
            {renderHeader(data.header, (_, v) => update('header', v))}
            <div className="space-y-0">
                {data.summary && <div className={sectionClass}>{renderSummary(data.summary, (_, v) => update('summary', v))}</div>}
                {data.experience.length > 0 && <div className={sectionClass}>{renderExperience(data.experience, (_, v) => update('experience', v))}</div>}
                {data.education.length > 0 && <div className={sectionClass}>{renderEducation(data.education, (_, v) => update('education', v))}</div>}
                {data.projects.length > 0 && <div className={sectionClass}>{renderProjects(data.projects, (_, v) => update('projects', v))}</div>}
                {data.skills.length > 0 && <div className={sectionClass}>{renderSkills(data.skills, (_, v) => update('skills', v))}</div>}
            </div>
        </ResumeContainer>
    );
};
