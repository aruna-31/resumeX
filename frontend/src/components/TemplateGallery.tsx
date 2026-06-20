import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeCanvas } from './ResumeCanvas';
import type { EditableResume } from '../types/editor';
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TemplateGalleryProps {
    templates: EditableResume[];
}

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
    'All',
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

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredTemplates = templates.filter((t) => {
        if (selectedCategory === 'All') return true;
        const id = (t.templateId || '').toLowerCase();
        const roleSlug = selectedCategory.toLowerCase().replace(/\s+/g, '_');
        return id.startsWith(roleSlug);
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTemplates = filteredTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="w-full">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <AnimatePresence mode="popLayout">
                    {currentTemplates.map((template, i) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                            onClick={() => navigate(`/builder?template=${template.templateId}`)}
                        >
                            {/* Zoom Container */}
                            <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                                {/* Match Score Badge */}
                                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-full shadow-lg">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-[10px] font-bold tracking-wider">98% MATCH</span>
                                </div>

                                {/* Preview Canvas - Scaled & Zoom Effect */}
                                <div className="absolute inset-0 origin-top transform scale-[0.4] group-hover:scale-[0.45] transition-transform duration-700 ease-out p-4">
                                    <div className="pointer-events-none select-none">
                                        <ResumeCanvas resume={template} onUpdate={() => { }} isPreview={true} />
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-center">
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        Select Template
                                    </button>
                                </div>
                            </div>

                            {/* Card Footer */}
                                <div className="p-5 border-t border-slate-100 bg-white relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-slate-900 font-bold text-sm uppercase tracking-tight">
                                        {template.templateId
                                            .split('_')
                                            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                                            .join(' ')}
                                    </h3>
                                    {template.metadata.isATSFriendly && (
                                        <div className="group/tooltip relative">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">ATS Friendly</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                                    {template.templateId.includes('classic') && 'Classic single-column layout. ATS-friendly, professional.'}
                                    {template.templateId.includes('sidebar') && 'Two-column sidebar. Skills and education on the side.'}
                                    {template.templateId.includes('executive') && 'Executive compact layout. Dense, high-impact.'}
                                    {template.templateId.includes('structured') && 'Structured corporate style. Clear section dividers.'}
                                    {template.templateId.includes('minimal') && 'Minimal ATS-clean layout. Maximum readability.'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ArrowRight className="rotate-180" size={14} />
                </button>

                <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentPage === i + 1 ? 'w-8 bg-blue-500' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ArrowRight size={14} />
                </button>
            </div>

            <p className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest mt-6">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, templates.length)} of {templates.length} Engines
            </p>
        </div>
    );
};
