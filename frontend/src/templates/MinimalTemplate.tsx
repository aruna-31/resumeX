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

interface MinimalTemplateProps {
    data: StructuredResume;
    onUpdate: (data: StructuredResume) => void;
    margin?: string;
    fontSize?: number;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
    data,
    onUpdate,
    margin,
    fontSize,
}) => {
    const update = (field: keyof StructuredResume, value: unknown) => {
        onUpdate({ ...data, [field]: value });
    };

    const sectionClass = 'mb-5';

    return (
        <ResumeContainer margin={margin} fontSize={fontSize}>
            {renderHeader(data.header, (_, v) => update('header', v))}
            <div className={sectionClass}>{data.summary && renderSummary(data.summary, (_, v) => update('summary', v))}</div>
            <div className={sectionClass}>{data.experience.length > 0 && renderExperience(data.experience, (_, v) => update('experience', v))}</div>
            <div className={sectionClass}>{data.education.length > 0 && renderEducation(data.education, (_, v) => update('education', v))}</div>
            <div className={sectionClass}>{data.projects.length > 0 && renderProjects(data.projects, (_, v) => update('projects', v))}</div>
            <div className={sectionClass}>{data.skills.length > 0 && renderSkills(data.skills, (_, v) => update('skills', v))}</div>
        </ResumeContainer>
    );
};
