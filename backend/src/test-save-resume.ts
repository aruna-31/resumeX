
import axios from 'axios';

async function testSaveResume() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'candidate@example.com',
            password: 'password123',
            role: 'candidate'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token:', token);

        console.log('Saving resume...');
        try {
            const saveRes = await axios.post('http://localhost:5000/api/resumes/save', {
                name: 'Test Resume',
                templateId: 'professional',
                content: {
                    personalInfo: { firstName: 'John', lastName: 'Doe' }
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Save successful:', saveRes.data);
        } catch (saveError: any) {
            console.error('Save failed:', saveError.response ? saveError.response.data : saveError.message);
            if (saveError.response && saveError.response.status === 500) {
                console.log('Got 500 error as expected. Check server logs.');
            }
        }

    } catch (error: any) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testSaveResume();
