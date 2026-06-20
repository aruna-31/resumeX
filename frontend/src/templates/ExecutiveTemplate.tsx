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

interface ExecutiveTemplateProps {
    data: StructuredResume;
    onUpdate: (data: StructuredResume) => void;
    margin?: string;
    fontSize?: number;
}

export const ExecutiveTemplate: React.FC<ExecutiveTemplateProps> = ({
    data,
    onUpdate,
    margin,
    fontSize,
}) => {
    const update = (field: keyof StructuredResume, value: unknown) => {
        onUpdate({ ...data, [field]: value });
    };

    return (
        <ResumeContainer margin={margin} fontSize={fontSize}>
            {renderHeader(data.header, (_, v) => update('header', v))}
            <div className="space-y-4">
                {data.summary && renderSummary(data.summary, (_, v) => update('summary', v))}
                {data.experience.length > 0 && renderExperience(data.experience, (_, v) => update('experience', v))}
                {data.projects.length > 0 && renderProjects(data.projects, (_, v) => update('projects', v))}
                <div className="grid grid-cols-2 gap-6">
                    {data.education.length > 0 && renderEducation(data.education, (_, v) => update('education', v))}
                    {data.skills.length > 0 && renderSkills(data.skills, (_, v) => update('skills', v))}
                </div>
            </div>
        </ResumeContainer>
    );
};
