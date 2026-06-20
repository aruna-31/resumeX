import type { StructuredResume, ExperienceEntry, EducationEntry, ProjectEntry } from './resumeSchema';
import type { JobRole } from './templateRegistry';

const baseHeader = (name: string, _title: string) => ({
    name,
    contact: 'professional@email.com | (555) 123-4567 | City, State | linkedin.com/in/professional',
});

const entries: Record<JobRole, () => StructuredResume> = {
    'Software Engineer': () => ({
        header: baseHeader('Alex Chen', 'Senior Software Engineer'),
        summary: 'Senior Software Engineer with 7+ years building scalable systems. Expert in distributed architecture, cloud infrastructure, and leading cross-functional teams. Delivered high-availability platforms serving millions of users.',
        experience: [
            { company: 'TechCorp Inc', role: 'Senior Software Engineer', duration: '2020 – Present', description: 'Led design and implementation of microservices platform. Reduced deployment time by 60%. Mentored 8 engineers.' },
            { company: 'Startup Labs', role: 'Software Engineer', duration: '2017 – 2020', description: 'Developed REST APIs and event-driven systems. Improved system reliability from 99.2% to 99.9% uptime.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'State University', degree: 'B.S. Computer Science', duration: '2013 – 2017' }] as EducationEntry[],
        projects: [
            { name: 'Internal CI/CD Platform', description: 'Built pipeline reducing build times by 40%. Technologies: Kubernetes, Jenkins, Docker.' },
        ] as ProjectEntry[],
        skills: ['Java', 'Python', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL', 'REST APIs', 'System Design'],
    }),
    'Data Scientist': () => ({
        header: baseHeader('Jordan Lee', 'Data Scientist'),
        summary: 'Data Scientist with 5+ years in ML model development and analytics. Proven track record in NLP, computer vision, and production ML systems. Strong statistical foundation and business acumen.',
        experience: [
            { company: 'Analytics Corp', role: 'Senior Data Scientist', duration: '2021 – Present', description: 'Developed recommendation engine increasing engagement by 25%. Built A/B testing framework for 50+ experiments.' },
            { company: 'Research Lab', role: 'Data Scientist', duration: '2019 – 2021', description: 'Created predictive models for churn and LTV. Delivered insights driving $2M annual savings.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Tech Institute', degree: 'M.S. Statistics', duration: '2017 – 2019' }, { institution: 'State College', degree: 'B.S. Mathematics', duration: '2013 – 2017' }] as EducationEntry[],
        projects: [
            { name: 'NLP Classification Pipeline', description: 'Built BERT-based classifier for document routing. Achieved 94% accuracy in production.' },
        ] as ProjectEntry[],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'A/B Testing', 'Statistical Modeling', 'Data Visualization'],
    }),
    'Product Manager': () => ({
        header: baseHeader('Sam Rivera', 'Product Manager'),
        summary: 'Product Manager with 6+ years shipping B2B and B2C products. Expertise in roadmap planning, user research, and cross-functional alignment. Data-driven decision maker with technical background.',
        experience: [
            { company: 'Product Co', role: 'Senior Product Manager', duration: '2021 – Present', description: 'Owned $10M product line. Drove 30% increase in conversion through discovery and experimentation.' },
            { company: 'Growth Inc', role: 'Product Manager', duration: '2018 – 2021', description: 'Launched 3 major features. Coordinated engineering, design, and marketing across 4 teams.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Business School', degree: 'MBA', duration: '2016 – 2018' }, { institution: 'University', degree: 'B.S. Economics', duration: '2012 – 2016' }] as EducationEntry[],
        projects: [
            { name: 'Platform Modernization', description: 'Led 12-month initiative to rebuild core product. Delivered on time with 15% performance improvement.' },
        ] as ProjectEntry[],
        skills: ['Roadmap Planning', 'User Research', 'Agile', 'SQL', 'A/B Testing', 'Stakeholder Management', 'Prioritization'],
    }),
    'UI/UX Designer': () => ({
        header: baseHeader('Morgan Blake', 'Senior UI/UX Designer'),
        summary: 'Senior UI/UX Designer with 8+ years creating user-centered digital products. Expert in design systems, usability testing, and collaborative workflows. Passionate about accessible, inclusive design.',
        experience: [
            { company: 'Design Studio', role: 'Senior UI/UX Designer', duration: '2020 – Present', description: 'Led design for enterprise SaaS. Established design system used across 5 product teams.' },
            { company: 'Agency Co', role: 'UX Designer', duration: '2016 – 2020', description: 'Designed flows for 20+ client projects. Conducted 100+ user interviews and usability sessions.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Design Academy', degree: 'B.F.A. Graphic Design', duration: '2012 – 2016' }] as EducationEntry[],
        projects: [
            { name: 'Design System v2', description: 'Created comprehensive component library. Reduced design-to-dev handoff time by 50%.' },
        ] as ProjectEntry[],
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility', 'Usability Testing', 'Information Architecture'],
    }),
    DevOps: () => ({
        header: baseHeader('Casey Kim', 'DevOps Engineer'),
        summary: 'DevOps Engineer with 6+ years in CI/CD, infrastructure as code, and cloud operations. Focus on reliability, security, and developer experience. Certified in AWS and Kubernetes.',
        experience: [
            { company: 'CloudTech', role: 'Senior DevOps Engineer', duration: '2021 – Present', description: 'Migrated 200+ services to Kubernetes. Implemented GitOps reducing deployment failures by 70%.' },
            { company: 'Infra Co', role: 'DevOps Engineer', duration: '2018 – 2021', description: 'Built Terraform modules for multi-region deployment. Managed 24/7 on-call for production systems.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Tech University', degree: 'B.S. Computer Science', duration: '2014 – 2018' }] as EducationEntry[],
        projects: [
            { name: 'Multi-Cloud Migration', description: 'Led migration from on-prem to AWS/GCP. Achieved zero downtime during 6-month transition.' },
        ] as ProjectEntry[],
        skills: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus', 'Linux', 'Python', 'Docker'],
    }),
    Marketing: () => ({
        header: baseHeader('Taylor Brooks', 'Marketing Manager'),
        summary: 'Marketing Manager with 5+ years in B2B and growth marketing. Expertise in demand generation, content strategy, and analytics. Results-oriented with strong creative and analytical skills.',
        experience: [
            { company: 'Growth Co', role: 'Marketing Manager', duration: '2021 – Present', description: 'Grew MQLs by 120% YoY. Managed $1.5M budget across paid, content, and events.' },
            { company: 'Brand Agency', role: 'Senior Marketing Specialist', duration: '2018 – 2021', description: 'Led campaigns for 10+ B2B clients. Achieved average 3.2x ROAS across channels.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'State University', degree: 'B.A. Communications', duration: '2014 – 2018' }] as EducationEntry[],
        projects: [
            { name: 'Brand Relaunch', description: 'Orchestrated rebrand and website overhaul. Drove 40% increase in organic traffic within 6 months.' },
        ] as ProjectEntry[],
        skills: ['SEO', 'Content Strategy', 'Google Analytics', 'HubSpot', 'Paid Social', 'Email Marketing', 'A/B Testing'],
    }),
    Finance: () => ({
        header: baseHeader('Jordan Smith', 'Financial Analyst'),
        summary: 'Financial Analyst with 6+ years in FP&A, forecasting, and financial modeling. Strong analytical skills and attention to detail. CPA candidate with MBA.',
        experience: [
            { company: 'Finance Corp', role: 'Senior Financial Analyst', duration: '2021 – Present', description: 'Led quarterly forecasting for $500M business unit. Built models adopted across 3 divisions.' },
            { company: 'Investment Firm', role: 'Financial Analyst', duration: '2018 – 2021', description: 'Prepared board materials and investor reports. Supported due diligence on 15+ M&A transactions.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Business School', degree: 'MBA, Finance', duration: '2016 – 2018' }, { institution: 'University', degree: 'B.S. Accounting', duration: '2012 – 2016' }] as EducationEntry[],
        projects: [
            { name: 'Forecasting Automation', description: 'Developed Python-based forecasting tool. Reduced monthly close time by 4 days.' },
        ] as ProjectEntry[],
        skills: ['Financial Modeling', 'Excel', 'SQL', 'Power BI', 'FP&A', 'Variance Analysis', 'Budgeting'],
    }),
    Consultant: () => ({
        header: baseHeader('Riley Davis', 'Management Consultant'),
        summary: 'Management Consultant with 5+ years advising Fortune 500 clients on strategy and operations. Expert in stakeholder management, change implementation, and data-driven recommendations.',
        experience: [
            { company: 'Strategy Consulting', role: 'Consultant', duration: '2021 – Present', description: 'Led 8 engagement teams. Delivered $20M+ in quantified client impact across retail and tech.' },
            { company: 'Advisory Group', role: 'Analyst', duration: '2018 – 2021', description: 'Supported C-suite on operational excellence. Developed frameworks used firm-wide.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Top Business School', degree: 'MBA', duration: '2016 – 2018' }, { institution: 'Liberal Arts College', degree: 'B.A. Economics', duration: '2012 – 2016' }] as EducationEntry[],
        projects: [
            { name: 'Operating Model Redesign', description: 'Designed and implemented new org structure for 5,000-person division. Achieved 15% cost reduction.' },
        ] as ProjectEntry[],
        skills: ['Strategy', 'Change Management', 'Stakeholder Management', 'Data Analysis', 'Executive Communication', 'Project Management'],
    }),
    'Business Analyst': () => ({
        header: baseHeader('Jordan Wright', 'Business Analyst'),
        summary: 'Business Analyst with 4+ years bridging business and technology. Skilled in requirements gathering, process improvement, and data analysis. Strong SQL and visualization expertise.',
        experience: [
            { company: 'Enterprise Co', role: 'Senior Business Analyst', duration: '2021 – Present', description: 'Elicited requirements for 12 product initiatives. Defined KPIs and dashboards for 3 business units.' },
            { company: 'Tech Solutions', role: 'Business Analyst', duration: '2019 – 2021', description: 'Documented processes and created user stories. Facilitated 50+ stakeholder workshops.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'State University', degree: 'B.S. Business Administration', duration: '2015 – 2019' }] as EducationEntry[],
        projects: [
            { name: 'CRM Implementation', description: 'Led requirements and UAT for enterprise CRM rollout. Trained 200+ users across 4 departments.' },
        ] as ProjectEntry[],
        skills: ['Requirements Analysis', 'SQL', 'Power BI', 'Process Mapping', 'Agile', 'Stakeholder Interviews', 'Documentation'],
    }),
    Academic: () => ({
        header: baseHeader('Dr. Morgan Hayes', 'Assistant Professor'),
        summary: 'Assistant Professor with 6+ years in research and teaching. Published 15+ peer-reviewed articles. Committed to mentoring and curriculum development. Active in departmental service.',
        experience: [
            { company: 'State University', role: 'Assistant Professor', duration: '2019 – Present', description: 'Teach 4 courses per year. Supervise 3 Ph.D. students. Serve on curriculum committee.' },
            { company: 'Research Institute', role: 'Postdoctoral Researcher', duration: '2017 – 2019', description: 'Conducted funded research. Published 5 first-author papers. Presented at 8 conferences.' },
        ] as ExperienceEntry[],
        education: [{ institution: 'Research University', degree: 'Ph.D. in Field', duration: '2012 – 2017' }, { institution: 'Liberal Arts College', degree: 'B.A. in Major', duration: '2008 – 2012' }] as EducationEntry[],
        projects: [
            { name: 'Grant-Funded Research', description: 'Principal Investigator on $500K NSF grant. Leading 3-year study with 2 graduate students.' },
        ] as ProjectEntry[],
        skills: ['Research Methodology', 'Statistical Analysis', 'Academic Writing', 'Teaching', 'Grant Writing', 'R/Python', 'Literature Review'],
    }),
};

export function getMockResumeForRole(role: JobRole): StructuredResume {
    return entries[role]();
}
