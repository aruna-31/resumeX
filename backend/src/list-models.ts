
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`Checking models for API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);

    if (!apiKey) {
        console.error('No API Key found within .env file');
        return;
    }

    try {
        // Direct REST call to list models is not exposed cleanly in node SDK?
        // Wait, SDK does not have listModels?
        // It does not seem to export listModels directly on GoogleGenerativeAI instance.
        // Let's try raw fetch to verify.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch models. Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const data = await response.json();
        console.log('Available Models:');
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.log('No models returned.');
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
