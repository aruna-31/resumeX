import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export type SectionType = 'summary' | 'experience' | 'project' | 'education' | 'skills';

interface EditableTextProps {
    value: string;
    onChange: (newValue: string) => void;
    className?: string;
    element?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    placeholder?: string;
    style?: React.CSSProperties;
    enableAI?: boolean;
    sectionType?: SectionType;
    targetRole?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
    value,
    onChange,
    className = "",
    element: Element = "div",
    placeholder = "Type here...",
    style,
    enableAI = true,
    sectionType = 'summary',
    targetRole = '',
}) => {
    const contentRef = useRef<HTMLElement>(null);
    const [showAITrigger, setShowAITrigger] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [popupRect, setPopupRect] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerText !== value && !isEnhancing && !suggestion) {
            contentRef.current.innerText = value;
        }
    }, [value, isEnhancing, suggestion]);

    const updatePopupPosition = () => {
        const el = contentRef.current;
        if (!el || !suggestion) return;
        const rect = el.getBoundingClientRect();
        const popupW = 340;
        const popupH = 220;
        const padding = 12;
        const spaceRight = window.innerWidth - rect.right;
        const spaceBelow = window.innerHeight - rect.bottom;
        let left: number;
        let top: number;
        if (spaceRight >= popupW + padding) {
            left = rect.right + padding;
            top = rect.top;
        } else if (rect.left >= popupW + padding) {
            left = rect.left - popupW - padding;
            top = rect.top;
        } else {
            left = Math.max(20, Math.min(rect.left, window.innerWidth - popupW - 20));
            top = spaceBelow >= popupH + padding ? rect.bottom + padding : rect.top - popupH - padding;
        }
        top = Math.max(20, Math.min(top, window.innerHeight - popupH - 20));
        setPopupRect({ top, left });
    };

    useLayoutEffect(() => {
        if (!suggestion) {
            setPopupRect(null);
            return;
        }
        updatePopupPosition();
        const ro = new ResizeObserver(updatePopupPosition);
        const el = contentRef.current;
        if (el) ro.observe(el);
        const onScroll = () => updatePopupPosition();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [suggestion]);

    const handleBlur = (e: React.FocusEvent) => {
        if (contentRef.current && !suggestion) {
            onChange(contentRef.current.innerText);
        }
        // Check if related target is within the AI suggestion box
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (relatedTarget?.closest('.ai-suggestion-box')) return;

        setTimeout(() => setShowAITrigger(false), 200);
    };

    const handleFocus = () => {
        if (enableAI) setShowAITrigger(true);
    };

    const handleEnhance = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const currentText = (contentRef.current?.innerText || value || '').trim();
        if (currentText.length < 5) return;
        setIsEnhancing(true);
        setSuggestion(null);
        try {
            const res = await api.post<{ success: boolean; improvedText: string }>('/analysis/rewrite-section', {
                role: targetRole || 'Software Engineer',
                sectionName: sectionType,
                sectionText: currentText,
            });
            const improved = res.data?.improvedText;
            if (improved && typeof improved === 'string') {
                setSuggestion(improved.trim());
            }
        } catch {
            setSuggestion(null);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="relative group/editable w-full">
            {React.createElement(Element, {
                ref: contentRef as any,
                contentEditable: true,
                suppressContentEditableWarning: true,
                onBlur: handleBlur,
                onFocus: handleFocus,
                className: `outline-none hover:bg-blue-50/50 focus:bg-blue-50/80 rounded-sm px-1 -mx-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 relative z-10 ${className}`,
                'data-placeholder': placeholder,
                style
            })}

            {suggestion && (() => {
                const rect = contentRef.current?.getBoundingClientRect();
                const pos = popupRect ?? (rect
                    ? (rect.right + 340 + 12 <= window.innerWidth
                        ? { top: rect.top, left: rect.right + 12 }
                        : { top: rect.bottom + 12, left: Math.max(20, Math.min(rect.left, window.innerWidth - 360)) })
                    : { top: 80, left: 20 });
                const top = Math.min(Math.max(pos.top, 20), window.innerHeight - 220);
                const left = Math.max(20, Math.min(pos.left, window.innerWidth - 360));
                const popupEl = (
                    <AnimatePresence>
                        <motion.div
                            key="tactical-refinement"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="ai-suggestion-box fixed w-[340px] max-w-[calc(100vw-40px)] bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-2xl overflow-visible"
                            style={{
                                top,
                                left,
                                zIndex: 2147483647,
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={12} className="text-blue-400 shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Refinement</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSuggestion(null)}
                                    className="p-1.5 -mr-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-[11px] font-bold leading-relaxed mb-5 text-slate-200 max-h-24 overflow-y-auto">{suggestion}</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { onChange(suggestion); setSuggestion(null); }}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Check size={12} /> Apply Changes
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl pointer-events-none" />
                        </motion.div>
                    </AnimatePresence>
                );
                return typeof document !== 'undefined' ? createPortal(popupEl, document.body) : popupEl;
            })()}

            <AnimatePresence>
                {showAITrigger && !suggestion && !isEnhancing && (
                    <motion.button
                        key="ai-trigger"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={handleEnhance}
                        className="absolute -right-12 top-0 p-2 bg-slate-900 border border-white/10 shadow-xl rounded-full text-blue-400 hover:scale-110 active:scale-95 transition-all z-20 print:hidden"
                        title="AI Analysis"
                    >
                        <Sparkles size={14} className="animate-pulse" />
                    </motion.button>
                )}

                {isEnhancing && (
                    <motion.div
                        key="ai-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -right-12 top-0 p-2 bg-slate-900 border border-blue-500/30 rounded-full text-blue-400 z-20"
                    >
                        <Loader2 size={14} className="animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
