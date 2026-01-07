const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

router.post('/brainstorm', async (req, res) => {
    try {
        const { messages } = req.body;

        // Validation
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.json({ role: 'assistant', content: "Hi! I'm Pathfinder AI (Powered by Gemini). Ask me anything about your application journey!" });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Check for API Key
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.json({
                role: 'assistant',
                content: "⚠️ **System Info**: The Gemini API Key is missing or invalid in the server configuration (`.env`). Please add your `GEMINI_API_KEY` to unlock real generative capabilities. \n\n*Using fallback mode...*"
            });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        // Limit history to last 10 messages to save tokens
        const recentMessages = messages.slice(-10);
        let history = recentMessages.map(m => `${m.role === 'user' ? 'Student' : 'Counselor'}: ${m.content}`).join('\n');

        const prompt = `
        You are 'Pathfinder AI', an expert college admissions counselor. 
        Your goal is to help students with:
        - University Shortlisting (finding "Best Fit")
        - Essay Brainstorming (Hooks, Structure, Review)
        - Visa Processes (F1, H1B, etc.)
        - Emotional Support during the stressful application process.
        
        Tone: Encouraging, Professional, Knowledgeable, yet Conversational.
        Constraint: Keep responses concise (under 300 words) unless asked for a long draft.
        
        Conversation History:
        ${history}
        
        Student's Last Message: ${messages[messages.length - 1].content}
        
        Counselor:
        `;

        // Model Fallback Strategy
        // Based on available models: gemini-2.0-flash, gemini-2.5-flash
        // Based on available models: gemini-2.0-flash, gemini-2.5-flash
        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro", "gemini-pro-latest"];
        let text = "";
        let errorToThrow = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                if (text) break;
            } catch (err) {
                console.warn(`Failed with model ${modelName}:`, err.message);
                errorToThrow = err;
                continue;
            }
        }

        // Final Fallback: If AI is completely unavailable (Rate Limit/Quota), give a helpful mock response
        if (!text) {
            console.error("All AI models failed. Using mock fallback.");
            text = "I'm currently experiencing high traffic (Rate Limit). While I wait for my connection to clear, here is a quick tip: Make sure your essays focus on your unique 'hook'! Try asking me again in a minute.";
        }

        res.json({
            role: 'assistant',
            content: text
        });

    } catch (error) {
        console.error('Gemini API Error:', error);

        let statusCode = 500;
        let errorMessage = "I'm having trouble connecting to my brain (Google Gemini). Please check your internet connection or API Key.";

        if (error.message && error.message.includes('API key not valid')) {
            errorMessage = "⚠️ **Invalid API Key**: The provided Google Gemini API Key is invalid. Please check your `.env` file.";
            statusCode = 401;
        } else if (error.message && error.message.includes('leaked')) {
            errorMessage = "⚠️ **Leaked API Key**: This API key was disabled because it was leaked. Please generate a new one at [Google AI Studio](https://aistudio.google.com/).";
            statusCode = 403;
        } else if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
            errorMessage = "⏳ **Rate Limit Exceeded**: You are chatting too fast for the free tier. I've provided a temporary fallback response above, but please wait a minute for full AI capabilities.";
            statusCode = 429;
        }

        res.status(statusCode).json({
            role: 'assistant',
            content: errorMessage
        });
    }
});

module.exports = router;
