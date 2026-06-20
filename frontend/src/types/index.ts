export interface User {
    id: string;
    email: string;
    role: 'HR' | 'CANDIDATE' | 'ADMIN';
    full_name?: string; // snake_case from DB
}

export interface Job {
    id: string;
    hr_id: string; // snake_case
    ats_job_id: string; // snake_case
    title: string;
    description: string;
    requirements: {
        skills: string[];
        minExp: number;
        education?: string;
    };
    location: string;
    status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
    createdAt: string;
    applicant_count?: number; // snake_case
}

export interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
    match_score: number; // snake_case
    missing_skills?: string[]; // snake_case
    ai_explanation?: string; // snake_case
    resume_url: string;
    parsed_data?: any;
    createdAt: string; // Sequelize default
    candidate?: User; // Joined
    job?: Job; // Joined
}
