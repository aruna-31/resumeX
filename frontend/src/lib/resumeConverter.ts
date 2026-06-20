import type { EditableBlock } from '../types/editor';
import type { StructuredResume, ExperienceEntry, EducationEntry, ProjectEntry } from './resumeSchema';

export function blocksToStructured(blocks: EditableBlock[]): StructuredResume {
    const header = blocks.find((b) => b.type === 'HEADER')?.content;
    const summary = blocks.find((b) => b.type === 'SUMMARY')?.content;
    const expBlock = blocks.find((b) => b.type === 'EXPERIENCE' && (b.title || '').toUpperCase().includes('EXPERIENCE'));
    const eduBlock = blocks.find((b) => b.type === 'EDUCATION');
    const projBlock = blocks.find((b) => b.type === 'EXPERIENCE' && (b.title || '').toUpperCase().includes('PROJECT'));
    const skillsBlock = blocks.find((b) => b.type === 'SKILLS');

    const h = header && typeof header === 'object' && 'name' in header ? header : { name: '', contact: '' };
    return {
        header: { name: h.name || '', contact: h.contact || '' },
        summary: typeof summary === 'string' ? summary : '',
        experience: Array.isArray(expBlock?.content) ? (expBlock.content as ExperienceEntry[]) : [],
        education: Array.isArray(eduBlock?.content) ? (eduBlock.content as EducationEntry[]) : [],
        projects: Array.isArray(projBlock?.content) ? (projBlock.content as ProjectEntry[]) : [],
        skills: Array.isArray(skillsBlock?.content) ? (skillsBlock.content as string[]) : [],
    };
}

export function structuredToBlocks(data: StructuredResume): EditableBlock[] {
    const makeId = () => Math.random().toString(36).slice(2, 9);
    const blocks: EditableBlock[] = [
        { id: makeId(), type: 'HEADER', title: 'Header', isVisible: true, order: 0, content: data.header },
        { id: makeId(), type: 'SUMMARY', title: 'Professional Summary', isVisible: true, order: 1, content: data.summary },
        { id: makeId(), type: 'EXPERIENCE', title: 'Experience', isVisible: true, order: 2, content: data.experience },
        { id: makeId(), type: 'EXPERIENCE', title: 'Projects', isVisible: true, order: 3, content: data.projects },
        { id: makeId(), type: 'EDUCATION', title: 'Education', isVisible: true, order: 4, content: data.education },
        { id: makeId(), type: 'SKILLS', title: 'Skills', isVisible: true, order: 5, content: data.skills },
    ];
    return blocks;
}
