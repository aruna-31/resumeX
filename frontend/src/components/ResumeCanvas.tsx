import React from 'react';
import { EditableText } from './EditableText';
import type { EditableResume, EditableBlock } from '../types/editor';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseTemplateId, getTemplateComponent } from '../templates';
import { blocksToStructured, structuredToBlocks } from '../lib/resumeConverter';

interface ResumeCanvasProps {
    resume: EditableResume;
    onUpdate: (updatedResume: EditableResume) => void;
    isPreview?: boolean;
    margin?: string;
    fontSize?: number;
}

export const ResumeCanvas: React.FC<ResumeCanvasProps> = ({ resume, onUpdate, isPreview = false, margin, fontSize }) => {
    const design = resume.design;
    const parsed = parseTemplateId(resume.templateId);

    const updateBlock = (blockId: string, newContent: any) => {
        onUpdate({
            ...resume,
            blocks: resume.blocks.map(b => b.id === blockId ? { ...b, content: newContent } : b)
        });
    };

    const updateBlockTitle = (blockId: string, newTitle: string) => {
        onUpdate({
            ...resume,
            blocks: resume.blocks.map(b => b.id === blockId ? { ...b, title: newTitle } : b)
        });
    };

    const removeBlock = (id: string) => {
        onUpdate({
            ...resume,
            blocks: resume.blocks.filter(b => b.id !== id)
        });
    };

    const renderHeader = (block: EditableBlock) => (
        <header className="mb-12">
            <EditableText
                value={block.content.name || ''}
                onChange={(v) => updateBlock(block.id, { ...block.content, name: v })}
                className="text-5xl font-black tracking-tighter uppercase leading-none mb-4 italic"
                element="h1"
                style={{ color: design.colors.primary }}
                placeholder="FULL NAME"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                <EditableText
                    value={block.content.contact || ''}
                    onChange={(v) => updateBlock(block.id, { ...block.content, contact: v })}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                    placeholder="LOCATION • PHONE • EMAIL • LINKEDIN"
                />
            </div>
        </header>
    );

    const renderSummary = (block: EditableBlock) => (
        <section>
            <div className="flex items-center gap-4 mb-5">
                <EditableText
                    value={block.title || ''}
                    onChange={(v) => updateBlockTitle(block.id, v)}
                    className="text-[11px] font-black uppercase tracking-[0.3em]"
                    style={{ color: design.colors.primary }}
                />
                <div className="flex-1 h-px bg-slate-100" />
            </div>
            <EditableText
                value={block.content || ''}
                onChange={(v) => updateBlock(block.id, v)}
                className="text-[13px] leading-relaxed text-slate-700 font-medium text-justify"
                placeholder="Compose a compelling professional narrative here..."
                sectionType="summary"
            />
        </section>
    );

    const getAppendLabel = (block: EditableBlock) => {
        const t = (block.title || '').toUpperCase();
        if (t === 'EDUCATION') return 'Add Education Entry';
        if (t === 'PROJECTS') return 'Add Project';
        return 'Append Operational Experience';
    };

    const renderExperience = (block: EditableBlock) => (
        <section>
            <div className="flex items-center gap-4 mb-8">
                <EditableText
                    value={block.title || ''}
                    onChange={(v) => updateBlockTitle(block.id, v)}
                    className="text-[11px] font-black uppercase tracking-[0.3em]"
                    style={{ color: design.colors.primary }}
                />
                <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-10">
                {Array.isArray(block.content) && block.content.map((exp: any, i: number) => (
                    <div key={i} className="relative group/entry">
                        <div className="flex justify-between items-baseline mb-2">
                            <EditableText
                                value={exp.role || ''}
                                onChange={(v: string) => {
                                    const next = [...block.content as any[]];
                                    next[i] = { ...exp, role: v };
                                    updateBlock(block.id, next);
                                }}
                                className="text-lg font-black tracking-tight italic uppercase"
                                placeholder="STAFF ENGINEER"
                            />
                            <EditableText
                                value={exp.duration || ''}
                                onChange={(v: string) => {
                                    const next = [...block.content as any[]];
                                    next[i] = { ...exp, duration: v };
                                    updateBlock(block.id, next);
                                }}
                                className="text-[9px] font-black text-slate-400 uppercase tracking-widest"
                                placeholder="2024 — PRESENT"
                            />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <EditableText
                                value={exp.company || ''}
                                onChange={(v: string) => {
                                    const next = [...block.content as any[]];
                                    next[i] = { ...exp, company: v };
                                    updateBlock(block.id, next);
                                }}
                                className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600"
                                placeholder="TECHFLOW SYSTEMS"
                            />
                        </div>
                        <EditableText
                            value={exp.description || ''}
                            onChange={(v: string) => {
                                const next = [...block.content as any[]];
                                next[i] = { ...exp, description: v };
                                updateBlock(block.id, next);
                            }}
                            className="text-[13px] leading-[1.7] text-slate-700 whitespace-pre-line font-medium"
                            placeholder="• Architected distributed systems handling 1M+ req/sec\n• Led digital transformation initiatives resulting in 40% efficiency gain"
                            sectionType={block.type === 'EDUCATION' ? 'education' : 'experience'}
                        />
                        {!isPreview && (
                            <button
                                onClick={() => updateBlock(block.id, (block.content as any[]).filter((_, idx: number) => idx !== i))}
                                className="absolute -right-10 top-0 h-8 w-8 flex items-center justify-center bg-slate-900 border border-white/10 rounded-full text-red-500 opacity-0 group-hover/entry:opacity-100 transition-all font-black"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                ))}
                {!isPreview && (
                    <button
                        onClick={() => updateBlock(block.id, [...block.content, { company: '', role: '', duration: '', description: '' }])}
                        className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black font-sans uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"
                    >
                        <Plus size={14} /> {getAppendLabel(block)}
                    </button>
                )}
            </div>
        </section>
    );

    const renderSkills = (block: EditableBlock) => (
        <section>
            <div className="flex items-center gap-4 mb-6">
                <EditableText
                    value={block.title || ''}
                    onChange={(v) => updateBlockTitle(block.id, v)}
                    className="text-[11px] font-black uppercase tracking-[0.3em]"
                    style={{ color: design.colors.primary }}
                />
                <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-4">
                {Array.isArray(block.content) && block.content.map((skill: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 group/skill">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                        <EditableText
                            value={skill || ''}
                            onChange={(v) => {
                                const next = [...block.content];
                                next[i] = v;
                                updateBlock(block.id, next);
                            }}
                            className="text-[11px] font-black uppercase tracking-widest text-slate-700"
                            sectionType="skills"
                        />
                        {!isPreview && (
                            <button
                                onClick={() => updateBlock(block.id, block.content.filter((_: any, idx: number) => idx !== i))}
                                className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-red-500 opacity-0 group-hover/skill:opacity-100 transition-all"
                            >
                                <Trash2 size={10} />
                            </button>
                        )}
                    </div>
                ))}
                {!isPreview && (
                    <button
                        onClick={() => updateBlock(block.id, [...block.content, 'NEW STACK'])}
                        className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
                    >
                        + Add Capability
                    </button>
                )}
            </div>
        </section>
    );

    const renderBlock = (block: EditableBlock) => {
        const content = (() => {
            switch (block.type) {
                case 'HEADER': return renderHeader(block);
                case 'SUMMARY': return renderSummary(block);
                case 'EXPERIENCE': return renderExperience(block);
                case 'EDUCATION': return renderExperience(block);
                case 'SKILLS': return renderSkills(block);
                default: return renderSummary(block);
            }
        })();

        return (
            <motion.div
                layout
                key={block.id}
                className="relative group/block mb-10 last:mb-0"
            >
                {!isPreview && (
                    <div className="absolute -left-16 top-0 flex flex-col gap-2 opacity-0 group-hover/block:opacity-100 transition-all print:hidden">
                        <button onClick={() => removeBlock(block.id)} className="p-3 bg-slate-900 border border-white/10 shadow-2xl text-red-500 rounded-2xl hover:bg-red-950 transition-colors">
                            <Trash2 size={14} />
                        </button>
                        <div className="p-3 bg-slate-900 border border-white/10 shadow-2xl text-slate-500 rounded-2xl cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                            <GripVertical size={14} />
                        </div>
                    </div>
                )}
                <div className="relative z-0">{content}</div>
            </motion.div>
        );
    };

    if (parsed) {
        const TemplateComponent = getTemplateComponent(parsed.layout);
        const structured = blocksToStructured(resume.blocks);
        const marg = margin ?? (resume.design?.spacing?.margins || '40px');
        const fs = fontSize ?? 11;
        return (
            <motion.div
                layout
                className={`shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-visible transition-all duration-700 origin-top print:shadow-none ${isPreview ? 'pointer-events-none' : ''}`}
            >
                <TemplateComponent
                    data={structured}
                    onUpdate={(data) => {
                        onUpdate({
                            ...resume,
                            blocks: structuredToBlocks(data),
                        });
                    }}
                    margin={typeof marg === 'string' ? marg : '40px'}
                    fontSize={typeof fs === 'number' ? fs : 11}
                />
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            className={`bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-visible transition-all duration-700 p-[0.8in] w-[8.5in] min-h-[11in] origin-top ${isPreview ? 'pointer-events-none' : ''}`}
            style={{ color: design.colors.text }}
        >
            <AnimatePresence mode="popLayout">
                {resume.layoutType === 'PROFESSIONAL' && (
                    <motion.div key="prof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {resume.blocks.map(renderBlock)}
                    </motion.div>
                )}
                {resume.layoutType === 'MODERN' && (
                    <motion.div key="modern" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-12 gap-12">
                        <div className="col-span-12">{resume.blocks.filter(b => b.type === 'HEADER').map(renderBlock)}</div>
                        <div className="col-span-8 space-y-12 border-r border-slate-50 pr-12">
                            {resume.blocks.filter(b => b.type !== 'HEADER' && b.type !== 'SKILLS' && b.type !== 'EDUCATION').map(renderBlock)}
                        </div>
                        <div className="col-span-4 space-y-12">
                            {resume.blocks.filter(b => b.type === 'SKILLS' || b.type === 'EDUCATION').map(renderBlock)}
                        </div>
                    </motion.div>
                )}
                {resume.layoutType === 'CREATIVE' && (
                    <motion.div key="creative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full gap-16">
                        <div className="w-[32%] space-y-12 shrink-0 pr-12 border-r border-slate-100">
                            {resume.blocks.filter(b => b.type === 'HEADER' || b.type === 'SKILLS').map(renderBlock)}
                        </div>
                        <div className="flex-1 space-y-12">
                            {resume.blocks.filter(b => b.type !== 'HEADER' && b.type !== 'SKILLS').map(renderBlock)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
