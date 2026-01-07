const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.models) {
            console.log("No models found or error:", data);
            return;
        }

        const textModels = data.models.filter(m =>
            m.name.includes('gemini') &&
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
        );

        console.log("--- AVAILABLE GEMINI TEXT MODELS ---");
        textModels.forEach(m => console.log(m.name));

        if (textModels.length > 0) {
            console.log("\nRECOMMENDED MODEL:", textModels[0].name.replace('models/', ''));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
