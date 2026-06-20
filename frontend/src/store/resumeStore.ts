import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExtractedResumeData {
    name?: string;
    contact?: string;
    summary?: string;
    experience?: any[];
    education?: any[];
    projects?: any[];
    skills?: string[];
}

interface ResumeStore {
    resumeData: ExtractedResumeData | null;
    setResumeData: (data: ExtractedResumeData) => void;
    clearResumeData: () => void;
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set) => ({
            resumeData: null,
            setResumeData: (data) => set({ resumeData: data }),
            clearResumeData: () => set({ resumeData: null }),
        }),
        {
            name: 'resume-storage', // name of the item in the storage (must be unique)
        }
    )
);
