import { EditableText } from '../../components/EditableText';
import type { HeaderContent, ExperienceEntry, EducationEntry, ProjectEntry } from '../../lib/resumeSchema';

export const renderHeader = (
    header: HeaderContent,
    onUpdate: (field: string, value: unknown) => void
) => (
    <header className="mb-8 pb-4 border-b border-black">
        <EditableText
            value={header.name}
            onChange={(v) => onUpdate('header', { ...header, name: v })}
            element="h1"
            className="text-2xl font-bold tracking-tight mb-1"
            placeholder="Full Name"
        />
        <EditableText
            value={header.contact}
            onChange={(v) => onUpdate('header', { ...header, contact: v })}
            className="text-sm"
            placeholder="Email | Phone | Location | LinkedIn"
        />
    </header>
);

export const renderSummary = (
    summary: string,
    onUpdate: (field: string, value: unknown) => void
) => (
    <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Professional Summary</h2>
        <EditableText
            value={summary}
            onChange={(v) => onUpdate('summary', v)}
            element="p"
            className="text-sm leading-relaxed"
            placeholder="Concise professional summary..."
            sectionType="summary"
        />
    </section>
);

export const renderExperience = (
    experience: ExperienceEntry[],
    onUpdate: (field: string, value: unknown) => void
) => (
    <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Experience</h2>
        <div className="space-y-5">
            {experience.map((exp, i) => (
                <div key={exp.id || i}>
                    <div className="flex justify-between items-baseline">
                        <EditableText
                            value={exp.role}
                            onChange={(v) => {
                                const next = [...experience];
                                next[i] = { ...exp, role: v };
                                onUpdate('experience', next);
                            }}
                            className="font-bold text-sm"
                            placeholder="Job Title"
                        />
                        <EditableText
                            value={exp.duration}
                            onChange={(v) => {
                                const next = [...experience];
                                next[i] = { ...exp, duration: v };
                                onUpdate('experience', next);
                            }}
                            className="text-xs"
                            placeholder="Dates"
                        />
                    </div>
                    <EditableText
                        value={exp.company}
                        onChange={(v) => {
                            const next = [...experience];
                            next[i] = { ...exp, company: v };
                            onUpdate('experience', next);
                        }}
                        className="text-sm italic mb-1"
                        placeholder="Company"
                    />
                    <EditableText
                        value={exp.description}
                        onChange={(v) => {
                            const next = [...experience];
                            next[i] = { ...exp, description: v };
                            onUpdate('experience', next);
                        }}
                        element="p"
                        className="text-sm leading-relaxed whitespace-pre-line"
                        placeholder="Responsibilities and achievements..."
                        sectionType="experience"
                    />
                </div>
            ))}
        </div>
    </section>
);

export const renderEducation = (
    education: EducationEntry[],
    onUpdate: (field: string, value: unknown) => void
) => (
    <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Education</h2>
        <div className="space-y-3">
            {education.map((edu, i) => (
                <div key={edu.id || i}>
                    <div className="flex justify-between items-baseline">
                        <EditableText
                            value={edu.degree}
                            onChange={(v) => {
                                const next = [...education];
                                next[i] = { ...edu, degree: v };
                                onUpdate('education', next);
                            }}
                            className="font-bold text-sm"
                            placeholder="Degree"
                            sectionType="education"
                        />
                        <EditableText
                            value={edu.duration}
                            onChange={(v) => {
                                const next = [...education];
                                next[i] = { ...edu, duration: v };
                                onUpdate('education', next);
                            }}
                            className="text-xs"
                            placeholder="Dates"
                        />
                    </div>
                    <EditableText
                        value={edu.institution}
                        onChange={(v) => {
                            const next = [...education];
                            next[i] = { ...edu, institution: v };
                            onUpdate('education', next);
                        }}
                        className="text-sm"
                        placeholder="Institution"
                    />
                </div>
            ))}
        </div>
    </section>
);

export const renderSkills = (
    skills: string[],
    onUpdate: (field: string, value: unknown) => void
) => (
    <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Skills</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
            {                    skills.map((s, i) => (
                <EditableText
                    key={i}
                    value={s}
                    onChange={(v) => {
                        const next = [...skills];
                        next[i] = v;
                        onUpdate('skills', next);
                    }}
                    className="text-sm"
                    placeholder="Skill"
                    sectionType="skills"
                />
            ))}
        </div>
    </section>
);

export const renderProjects = (
    projects: ProjectEntry[],
    onUpdate: (field: string, value: unknown) => void
) => (
    <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Projects</h2>
        <div className="space-y-3">
            {projects.map((proj, i) => (
                <div key={proj.id || i}>
                    <EditableText
                        value={proj.name}
                        onChange={(v) => {
                            const next = [...projects];
                            next[i] = { ...proj, name: v };
                            onUpdate('projects', next);
                        }}
                        className="font-bold text-sm"
                        placeholder="Project Name"
                    />
                    <EditableText
                        value={proj.description}
                        onChange={(v) => {
                            const next = [...projects];
                            next[i] = { ...proj, description: v };
                            onUpdate('projects', next);
                        }}
                        element="p"
                        className="text-sm leading-relaxed"
                        placeholder="Description"
                        sectionType="project"
                    />
                </div>
            ))}
        </div>
    </section>
);
