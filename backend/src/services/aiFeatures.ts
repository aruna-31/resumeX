/**
 * AI Features Service
 * 
 * All 10 production AI features, each using the centralized AI manager.
 * Prompts are compressed, structured, and optimized for token efficiency.
 */

import { callAI, compressResumeText, AIFeatureType } from './aiManager';

// ─── 1. ATS Score Analyzer ────────────────────────────────────────────────────

export interface ATSScoreResult {
    overallScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    keywordScore: number;
    formatScore: number;
    strengths: string[];
    gaps: string[];
    improvementTips: string[];
    summary: string;
}

export async function analyzeATSScore(resumeJson: any, jobDescription?: string): Promise<ATSScoreResult | null> {
    const resumeText = compressResumeText(resumeJson, 1200);
    const jobContext = jobDescription ? `\nJob Description:\n${jobDescription.slice(0, 500)}` : '';

    const prompt = `You are an enterprise ATS (Applicant Tracking System) scoring engine.
Analyze the resume and return a detailed ATS compatibility score.${jobContext}

Resume:
${resumeText}

Return ONLY valid JSON:
{
  "overallScore": 0,
  "skillScore": 0,
  "experienceScore": 0,
  "educationScore": 0,
  "keywordScore": 0,
  "formatScore": 0,
  "strengths": [],
  "gaps": [],
  "improvementTips": [],
  "summary": ""
}

Rules: All scores 0-100. Be specific and actionable in tips. No buzzwords.`;

    const result = await callAI<ATSScoreResult>({ prompt, feature: 'ATS_SCORE', useCache: true });
    return result.data;
}

// ─── 2. ATS Optimization Suggestions ─────────────────────────────────────────

export interface ATSOptimizeResult {
    optimizedSections: {
        summary?: string;
        skills?: string[];
        experience?: Array<{ original: string; optimized: string }>;
    };
    keywordsToAdd: string[];
    sectionsToRemove: string[];
    formattingFixes: string[];
    estimatedScoreIncrease: number;
}

export async function optimizeForATS(resumeJson: any, jobDescription: string): Promise<ATSOptimizeResult | null> {
    const resumeText = compressResumeText(resumeJson, 1000);

    const prompt = `You are an ATS optimization expert. Rewrite the resume sections to maximize ATS score for this job.

Job Description:
${jobDescription.slice(0, 600)}

Current Resume:
${resumeText}

Return ONLY valid JSON:
{
  "optimizedSections": {
    "summary": "",
    "skills": [],
    "experience": [{"original": "", "optimized": ""}]
  },
  "keywordsToAdd": [],
  "sectionsToRemove": [],
  "formattingFixes": [],
  "estimatedScoreIncrease": 0
}`;

    const result = await callAI<ATSOptimizeResult>({ prompt, feature: 'ATS_OPTIMIZE', useCache: false });
    return result.data;
}

// ─── 3. Resume Rewriter ───────────────────────────────────────────────────────

export interface ResumeRewriteResult {
    summary: string;
    technicalSkills: string[];
    workExperience: Array<{
        company?: string;
        role?: string;
        duration?: string;
        description?: string;
        achievements: string[];
    }>;
    projects: Array<{
        name?: string;
        description?: string;
        tech: string[];
        impact?: string;
    }>;
    education: Array<{
        degree?: string;
        field?: string;
        institution?: string;
        graduationYear?: string;
    }>;
}

export async function rewriteResume(rawText: string): Promise<ResumeRewriteResult | null> {
    const text = rawText.slice(0, 6000);

    const prompt = `You are a professional resume writer. Transform this raw resume text into a structured, ATS-optimized resume.

Rules:
- Use strong action verbs
- Quantify impact where the text supports it (do NOT invent numbers)
- Write in third-person past tense for experience
- Keep summary under 3 sentences
- Structure experience with clear achievements

Raw Resume:
${text}

Return ONLY valid JSON:
{
  "summary": "",
  "technicalSkills": [],
  "workExperience": [{"company":"","role":"","duration":"","description":"","achievements":[]}],
  "projects": [{"name":"","description":"","tech":[],"impact":""}],
  "education": [{"degree":"","field":"","institution":"","graduationYear":""}]
}`;

    const result = await callAI<ResumeRewriteResult>({ prompt, feature: 'RESUME_REWRITE', useCache: true });
    return result.data;
}

// ─── 4. Cover Letter Generator ────────────────────────────────────────────────

export interface CoverLetterResult {
    subject: string;
    body: string;
    callToAction: string;
    wordCount: number;
}

export async function generateCoverLetter(
    resumeJson: any,
    jobTitle: string,
    companyName: string,
    jobDescription: string
): Promise<CoverLetterResult | null> {
    const resumeText = compressResumeText(resumeJson, 800);

    const prompt = `You are an expert career coach. Write a compelling, personalized cover letter.

Position: ${jobTitle} at ${companyName}
Job Description: ${jobDescription.slice(0, 400)}

Candidate Profile:
${resumeText}

Write a professional cover letter (250-350 words) that:
1. Opens with a strong hook specific to this company
2. Highlights 2-3 most relevant achievements with metrics
3. Shows genuine interest in the company/role
4. Closes with a confident call to action

Return ONLY valid JSON:
{
  "subject": "Application for [Position] — [Name]",
  "body": "",
  "callToAction": "",
  "wordCount": 0
}`;

    const result = await callAI<CoverLetterResult>({ prompt, feature: 'COVER_LETTER', useCache: false });
    return result.data;
}

// ─── 5. Interview Question Generator ─────────────────────────────────────────

export interface InterviewQuestionsResult {
    technical: Array<{ question: string; difficulty: 'Easy' | 'Medium' | 'Hard'; hint: string }>;
    behavioral: Array<{ question: string; starHint: string }>;
    roleSpecific: Array<{ question: string; whyAsked: string }>;
    systemDesign?: Array<{ question: string; approach: string }>;
}

export async function generateInterviewQuestions(
    roleTitle: string,
    resumeJson: any,
    difficulty: 'Junior' | 'Mid' | 'Senior' = 'Mid'
): Promise<InterviewQuestionsResult | null> {
    const resumeText = compressResumeText(resumeJson, 600);

    const prompt = `You are a senior technical interviewer at a top tech company.
Generate realistic, targeted interview questions for this candidate.

Role: ${roleTitle} (${difficulty} level)
Candidate Profile: ${resumeText}

Return ONLY valid JSON:
{
  "technical": [{"question":"","difficulty":"Medium","hint":""}],
  "behavioral": [{"question":"","starHint":""}],
  "roleSpecific": [{"question":"","whyAsked":""}],
  "systemDesign": [{"question":"","approach":""}]
}

Generate: 4 technical, 3 behavioral, 3 role-specific, 2 system design questions.`;

    const result = await callAI<InterviewQuestionsResult>({ prompt, feature: 'INTERVIEW_QUESTIONS', useCache: true });
    return result.data;
}

// ─── 6. Skill Gap Analyzer ───────────────────────────────────────────────────

export interface SkillGapResult {
    currentSkills: string[];
    requiredSkills: string[];
    gapSkills: Array<{
        skill: string;
        importance: 'Critical' | 'Important' | 'Nice-to-have';
        timeToLearn: string;
        resources: string[];
    }>;
    readinessScore: number;
    learningPath: string[];
}

export async function analyzeSkillGap(
    resumeJson: any,
    targetRole: string,
    jobDescription: string
): Promise<SkillGapResult | null> {
    const resumeText = compressResumeText(resumeJson, 800);

    const prompt = `You are a career development expert and skills assessor.
Identify skill gaps between the candidate's profile and the target role.

Target Role: ${targetRole}
Job Requirements: ${jobDescription.slice(0, 400)}
Candidate Profile: ${resumeText}

Return ONLY valid JSON:
{
  "currentSkills": [],
  "requiredSkills": [],
  "gapSkills": [{"skill":"","importance":"Important","timeToLearn":"2-4 weeks","resources":["link or resource name"]}],
  "readinessScore": 0,
  "learningPath": []
}

readinessScore: 0-100 (how ready the candidate is right now).
learningPath: ordered list of skills to learn for maximum impact.`;

    const result = await callAI<SkillGapResult>({ prompt, feature: 'SKILL_GAP', useCache: true });
    return result.data;
}

// ─── 7. Career Recommendation Engine ─────────────────────────────────────────

export interface CareerRecommendation {
    currentLevel: string;
    potentialRoles: Array<{
        title: string;
        matchPercentage: number;
        salaryRange: string;
        transitionDifficulty: 'Easy' | 'Moderate' | 'Hard';
        requiredSkills: string[];
    }>;
    careerTrajectory: string;
    actionableSteps: string[];
}

export async function generateCareerRecommendations(resumeJson: any): Promise<CareerRecommendation | null> {
    const resumeText = compressResumeText(resumeJson, 800);

    const prompt = `You are a career strategist with 20 years of experience in talent development.
Analyze this candidate's profile and provide strategic career recommendations.

Candidate Profile: ${resumeText}

Return ONLY valid JSON:
{
  "currentLevel": "Mid-Level Software Engineer",
  "potentialRoles": [
    {"title":"","matchPercentage":0,"salaryRange":"$X-$Y","transitionDifficulty":"Moderate","requiredSkills":[]}
  ],
  "careerTrajectory": "",
  "actionableSteps": []
}

Provide 4-5 potential roles. Be realistic about salary ranges and transition difficulty.`;

    const result = await callAI<CareerRecommendation>({ prompt, feature: 'CAREER_RECOMMENDATION', useCache: true });
    return result.data;
}

// ─── 8. Job Match Predictor ───────────────────────────────────────────────────

export interface JobMatchResult {
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    cultureMatch: number;
    pros: string[];
    cons: string[];
    recommendation: 'Strong Apply' | 'Apply' | 'Consider' | 'Skip';
    negotiationPoints: string[];
}

export async function predictJobMatch(resumeJson: any, jobDoc: { title: string; description: string; requirements: any }): Promise<JobMatchResult | null> {
    const resumeText = compressResumeText(resumeJson, 800);

    const prompt = `You are a recruitment AI. Predict how well this candidate matches the job.

Job: ${jobDoc.title}
Requirements: ${JSON.stringify(jobDoc.requirements).slice(0, 300)}
Description: ${jobDoc.description.slice(0, 400)}

Candidate: ${resumeText}

Return ONLY valid JSON:
{
  "overallMatch": 0,
  "skillsMatch": 0,
  "experienceMatch": 0,
  "educationMatch": 0,
  "cultureMatch": 0,
  "pros": [],
  "cons": [],
  "recommendation": "Apply",
  "negotiationPoints": []
}`;

    const result = await callAI<JobMatchResult>({ prompt, feature: 'JOB_MATCH', useCache: true });
    return result.data;
}

// ─── 9. Candidate Ranking Engine (HR feature) ─────────────────────────────────

export interface CandidateRankResult {
    rankedCandidates: Array<{
        candidateName: string;
        candidateId: string;
        overallScore: number;
        skillsScore: number;
        experienceScore: number;
        educationScore: number;
        strengthSummary: string;
        riskFlags: string[];
        recommendation: string;
    }>;
    averageScore: number;
    topCandidate: string;
    hiringInsights: string;
}

export async function rankCandidates(
    jobTitle: string,
    jobDescription: string,
    candidates: Array<{ name: string; id: string; resume: any }>
): Promise<CandidateRankResult | null> {
    // Compress each resume
    const compressedCandidates = candidates.slice(0, 50).map(c => ({
        candidateName: c.name,
        candidateId: c.id,
        resume: compressResumeText(c.resume, 400),
    }));

    const prompt = `You are an AI recruitment intelligence engine. Rank these candidates for the given role.

Job: ${jobTitle}
Description: ${jobDescription.slice(0, 400)}

Candidates:
${JSON.stringify(compressedCandidates)}

Return ONLY valid JSON:
{
  "rankedCandidates": [
    {"candidateName":"","candidateId":"","overallScore":0,"skillsScore":0,"experienceScore":0,"educationScore":0,"strengthSummary":"","riskFlags":[],"recommendation":""}
  ],
  "averageScore": 0,
  "topCandidate": "",
  "hiringInsights": ""
}

Sort by overallScore descending. All scores 0-100.`;

    const result = await callAI<CandidateRankResult>({ prompt, feature: 'CANDIDATE_RANK', useCache: false });
    return result.data;
}

// ─── 10. AI Hiring Insights Dashboard ────────────────────────────────────────

export interface HiringInsightsResult {
    talentPoolHealth: 'Strong' | 'Moderate' | 'Weak';
    commonSkillGaps: Array<{ skill: string; gapCount: number }>;
    salaryBenchmark: { low: string; median: string; high: string };
    hiringRecommendations: string[];
    timeToFillEstimate: string;
    diversityScore: number;
    marketInsights: string;
}

export async function generateHiringInsights(
    jobTitle: string,
    applications: Array<{ matchScore: number; parsedData: any }>
): Promise<HiringInsightsResult | null> {
    const summary = {
        jobTitle,
        totalApplications: applications.length,
        avgScore: applications.reduce((s, a) => s + a.matchScore, 0) / (applications.length || 1),
        scoreDistribution: {
            high: applications.filter(a => a.matchScore >= 80).length,
            mid: applications.filter(a => a.matchScore >= 60 && a.matchScore < 80).length,
            low: applications.filter(a => a.matchScore < 60).length,
        },
    };

    const prompt = `You are a talent analytics expert. Generate actionable hiring insights for this job.

Job Analytics Summary:
${JSON.stringify(summary)}

Return ONLY valid JSON:
{
  "talentPoolHealth": "Moderate",
  "commonSkillGaps": [{"skill":"","gapCount":0}],
  "salaryBenchmark": {"low":"","median":"","high":""},
  "hiringRecommendations": [],
  "timeToFillEstimate": "2-4 weeks",
  "diversityScore": 0,
  "marketInsights": ""
}`;

    const result = await callAI<HiringInsightsResult>({ prompt, feature: 'HIRING_INSIGHTS', useCache: false });
    return result.data;
}
