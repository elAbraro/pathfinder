// server/services/aiEnricher.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Enrich university data using Gemini 2.0 Flash
 * @param {string} universityName
 * @param {string} country
 * @returns {Object|null} JSON data or null on error
 */
const enrichUniversityData = async (universityName, country) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
Provide accurate, real-world data for the university "${universityName}" in "${country}" as a valid JSON object. 
Do NOT return markdown. Return ONLY the JSON string.
Ensure realistic estimates if exact numbers are unavailable.

Required JSON Structure:
{
  "ranking": { "global": Number, "national": Number },
  "tuition": { "underic": Number, "graduate": Number },
  "acceptanceRate": Number,
  "description": "Short 2-sentence summary",
  "popularMajors": ["Major 1", "Major 2", "Major 3", "Major 4"],
  "features": ["Feature 1", "Feature 2"],
  "location": { "city": "City Name", "state": "State/Region" }
}
    `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();

        // Remove any accidental markdown
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Enrichment Failed:", error);
        return null;
    }
};

module.exports = { enrichUniversityData };
