const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enrichUniversityData = async (universityName, country) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Provide accurate, real-world data for the university "${universityName}" in "${country}" as a valid JSON object. 
        Do NOT return markdown. Return ONLY the JSON string.
        Ensure the data is realistic estimates if exact current year numbers are unavailable.
        
        Required JSON Structure:
        {
            "ranking": { "global": Number (estimate), "national": Number (estimate) },
            "tuition": { "underic": Number (average annual USD), "graduate": Number (average annual USD) },
            "acceptanceRate": Number (0-100),
            "description": "Short 2-sentence summary of the university.",
            "popularMajors": ["Major 1", "Major 2", "Major 3", "Major 4"],
            "features": ["Feature 1", "Feature 2"],
            "location": { "city": "City Name", "state": "State/Region" }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Enrichment Failed:", error);
        return null;
    }
};

module.exports = { enrichUniversityData };
