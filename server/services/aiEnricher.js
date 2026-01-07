const axios = require('axios');
require("dotenv").config();

// Configuration
// Strict Separation: Enrichment uses Ollama
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Enrich university data using Local LLM (Ollama) ONLY.
 * @param {string} universityName
 * @param {string} country
 * @returns {Object|null} JSON data or null on error
 */
const enrichUniversityData = async (universityName, country) => {
  const prompt = `
Provide accurate, real-world data for the university "${universityName}" in "${country}" as a valid JSON object.
Do NOT return markdown. Return ONLY the JSON string.
Estimate based on typical academic calendars if exact current-year dates are unavailable.

Required JSON Structure:
{
  "ranking": { "global": Number, "national": Number },
  "tuition": { "undergraduate": Number, "graduate": Number, "currency": "Code (e.g. USD)" },
  "acceptanceRate": Number,
  "description": "Short 2-sentence summary",
  "popularMajors": ["Major 1", "Major 2", "Major 3", "Major 4"],
  "applicationDeadlines": [
    { "term": "Fall 2025", "deadline": "YYYY-MM-DD" },
    { "term": "Spring 2026", "deadline": "YYYY-MM-DD" }
  ],
  "scholarships": [
    { "name": "Scholarship Name", "amount": Number, "criteria": "Brief criteria" }
  ]
}
    `;

  try {
    console.log(`Enriching via Ollama (${OLLAMA_MODEL})...`);
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt + " Respond with JSON only.",
      stream: false,
      format: "json" // Force JSON mode if model supports it
    });

    const text = response.data.response;

    // Clean and parse
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error(`AI Enrichment Failed (Ollama):`, error.message);
    return null;
  }
};

module.exports = { enrichUniversityData };
