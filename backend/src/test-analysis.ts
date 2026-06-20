
import axios from 'axios';

async function testAnalysis() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'candidate@example.com',
            password: 'password123',
            role: 'candidate'
        });

        const token = loginRes.data.token;
        console.log('Login successful.');

        // 1. Save a resume
        console.log('Saving resume for analysis...');
        const saveRes = await axios.post('http://localhost:5000/api/resumes/save', {
            name: 'Analysis Test Resume',
            templateId: 'professional',
            content: {
                personalInfo: { firstName: 'John', lastName: 'Doe' },
                experience: [
                    { title: "Software Engineer", company: "Tech Corp", description: "Built React apps." }
                ],
                skills: ["React", "TypeScript", "Node.js"]
            }
        }, { headers: { Authorization: `Bearer ${token}` } });

        const resumeId = saveRes.data.resume.id;
        console.log('Resume saved. ID:', resumeId);

        // 2. Run analysis
        console.log('Running analysis...');
        const analysisRes = await axios.post('http://localhost:5000/api/analysis/run', {
            resumeId,
            role: 'Senior Frontend Engineer'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Analysis SUCCESS:', analysisRes.data);

    } catch (error: any) {
        if (error.response) {
            console.error('Analysis FAILED status:', error.response.status);
            console.error('Analysis FAILED data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Analysis FAILED:', error.message);
        }
    }
}

testAnalysis();
