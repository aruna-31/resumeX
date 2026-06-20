import { connectDB } from '../config/database';
import User from '../models/User';
import Job from '../models/Job';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('Clearing database...');
        // Order matters for foreign keys
        await Job.destroy({ where: {} });
        await User.destroy({ where: {} });

        console.log('Seeding Users...');
        // Hash password manually or rely on hook (Using hook since it's create)
        const hrUser = await User.create({
            email: 'hr@example.com',
            password_hash: 'password123',
            full_name: 'Anita HR',
            role: 'HR'
        });

        const candidateUser = await User.create({
            email: 'candidate@example.com',
            password_hash: 'password123',
            full_name: 'John Doe',
            role: 'CANDIDATE'
        });

        console.log('Seeding Jobs...');
        await Job.create({
            hr_id: hrUser.id,
            ats_job_id: 'JOB-2024-001',
            title: 'Senior Frontend Engineer',
            description: 'We are looking for a React expert with 5+ years of experience.',
            requirements: { skills: ['React', 'TypeScript', 'Tailwind'], minExp: 5 },
            location: 'Remote',
            status: 'OPEN'
        });

        await Job.create({
            hr_id: hrUser.id,
            ats_job_id: 'JOB-2024-002',
            title: 'Backend Developer',
            description: 'Looking for Node.js and PostgreSQL expert.',
            requirements: { skills: ['Node.js', 'PostgreSQL', 'Express'], minExp: 3 },
            location: 'New York',
            status: 'OPEN'
        });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
