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
        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];
        let text = "";
        let errorToThrow = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                break; // Success
            } catch (err) {
                console.warn(`Failed with model ${modelName}:`, err.message);
                errorToThrow = err;

                // If 429 (Rate Limit), we arguably SHOULD try another model if it's on a different quota, 
                // but usually it's per-project. However, 429 can also be model-specific load. 
                // We will continue to try fallbacks.

                // If 404 (Not Found), definitely try next.
                continue;
            }
        }

        if (!text) throw errorToThrow || new Error("All models failed");

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
        } else if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
            errorMessage = "⚠️ **Model Error**: The AI models are temporarily unavailable. Please try again later.";
            statusCode = 404;
        } else if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
            errorMessage = "⏳ **Rate Limit Exceeded**: You are chatting too fast for the free tier. Please wait a minute and try again.";
            statusCode = 429;
        }

        res.status(statusCode).json({
            role: 'assistant',
            content: errorMessage
        });
    }
});

module.exports = router;
