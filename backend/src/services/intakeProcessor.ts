const PDFParse = require('pdf-parse');
import mammoth from 'mammoth';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { parseResumeWithGemini } from './geminiResumeParser';
import type { NormalizedCandidate } from '../types/intake';
import { emptyCandidate } from '../types/intake';

const ACCEPTED_EXT = ['.csv', '.zip', '.pdf', '.docx', '.doc'];

function getExt(filename: string): string {
    return filename.toLowerCase().slice(filename.lastIndexOf('.'));
}

function extractNameAndEmail(text: string): { name: string; email: string } {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const name = (lines[0] || '').substring(0, 255) || 'Unknown';
    const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
    const email = (emailMatch ? emailMatch[0].substring(0, 255) : `unknown-${Date.now()}@uploaded.local`);
    return { name, email };
}

async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
    const ext = getExt(filename);
    if (ext === '.pdf') {
        const result = await PDFParse(buffer);
        const text = (result?.text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        return text;
    }
    if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer });
        return (result.value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    }
    return '';
}

function rowToCandidate(row: Record<string, string>): NormalizedCandidate {
    const name = (row.name ?? row.full_name ?? row.Name ?? row['Full Name'] ?? 'Unknown').trim().slice(0, 255) || 'Unknown';
    const email = (row.email ?? row.Email ?? '').trim().slice(0, 255) || `candidate-${Date.now()}@import.local`;
    const skillsStr = row.skills ?? row.Skills ?? row.skill ?? '';
    const skills = skillsStr ? skillsStr.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : [];
    const experience_years = parseInt(row.experience_years ?? row.experience ?? row['Years of Experience'] ?? '0', 10) || 0;
    const education = (row.education ?? row.Education ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    let projects: NormalizedCandidate['projects'] = [];
    try {
        const p = row.projects ?? row.Projects;
        if (p) projects = JSON.parse(p);
    } catch {
        // ignore
    }
    return {
        name,
        email,
        skills,
        experience_years,
        education,
        projects,
        parsed_text: '',
    };
}

/**
 * Process CSV buffer: parse with PapaParse, normalize each row to NormalizedCandidate.
 */
export function processCsvBuffer(buffer: Buffer): NormalizedCandidate[] {
    const text = buffer.toString('utf-8');
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
    const rows = parsed.data || [];
    return rows.map((row: Record<string, string>) => rowToCandidate(row));
}

/**
 * Process PDF buffer: extract text, Gemini parse, normalize to schema.
 */
export async function processPdfBuffer(buffer: Buffer, _filename?: string): Promise<NormalizedCandidate[]> {
    const text = await extractTextFromBuffer(buffer, 'file.pdf');
    if (!text || text.length < 20) return [];
    const { name, email } = extractNameAndEmail(text);
    const parsed = await parseResumeWithGemini(text);
    const candidate = emptyCandidate(name, email);
    candidate.parsed_text = text;
    if (parsed) {
        candidate.skills = parsed.skills || [];
        candidate.experience_years = parsed.total_years ?? 0;
        candidate.projects = parsed.projects || [];
        candidate.education = [];
    }
    return [candidate];
}

/**
 * Process DOCX buffer: extract text, Gemini parse, normalize.
 */
export async function processDocxBuffer(buffer: Buffer, filename: string): Promise<NormalizedCandidate[]> {
    const text = await extractTextFromBuffer(buffer, filename);
    if (!text || text.length < 20) return [];
    const { name, email } = extractNameAndEmail(text);
    const parsed = await parseResumeWithGemini(text);
    const candidate = emptyCandidate(name, email);
    candidate.parsed_text = text;
    if (parsed) {
        candidate.skills = parsed.skills || [];
        candidate.experience_years = parsed.total_years ?? 0;
        candidate.projects = parsed.projects || [];
        candidate.education = [];
    }
    return [candidate];
}

/**
 * Process ZIP buffer: extract all entries, dispatch by extension (CSV/PDF/DOCX), aggregate candidates.
 */
export async function processZipBuffer(buffer: Buffer): Promise<NormalizedCandidate[]> {
    const zip = await JSZip.loadAsync(buffer);
    const candidates: NormalizedCandidate[] = [];
    const entries = Object.keys(zip.files).filter((p) => !p.endsWith('/'));

    for (const path of entries) {
        const ext = getExt(path);
        if (!['.csv', '.pdf', '.docx', '.doc'].includes(ext)) continue;
        const entry = zip.files[path];
        if (!entry) continue;
        const buf = await entry.async('nodebuffer');
        try {
            if (ext === '.csv') {
                candidates.push(...processCsvBuffer(buf));
            } else if (ext === '.pdf') {
                candidates.push(...(await processPdfBuffer(buf, path)));
            } else if (ext === '.docx' || ext === '.doc') {
                candidates.push(...(await processDocxBuffer(buf, path)));
            }
        } catch (err: any) {
            console.warn(`Intake skip ${path}:`, err.message);
        }
    }
    return candidates;
}

/**
 * Detect file type and process. Returns normalized candidates.
 */
export async function processFile(
    buffer: Buffer,
    originalname: string
): Promise<{ candidates: NormalizedCandidate[]; error?: string }> {
    const ext = getExt(originalname);
    if (!ACCEPTED_EXT.includes(ext)) {
        return { candidates: [], error: `Unsupported type: ${ext}` };
    }
    try {
        if (ext === '.csv') {
            const candidates = processCsvBuffer(buffer);
            return { candidates };
        }
        if (ext === '.zip') {
            const candidates = await processZipBuffer(buffer);
            return { candidates };
        }
        if (ext === '.pdf') {
            const candidates = await processPdfBuffer(buffer, originalname);
            return { candidates };
        }
        if (ext === '.docx' || ext === '.doc') {
            const candidates = await processDocxBuffer(buffer, originalname);
            return { candidates };
        }
        return { candidates: [], error: `Unsupported type: ${ext}` };
    } catch (err: any) {
        return { candidates: [], error: err.message || 'Processing failed' };
    }
}
