// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt
const systemPrompt = `
You are a world-class recipe assistant.
Always return valid JSON (no commentary outside JSON).
Recipes must include:
- Clear, descriptive title
- Realistic servings and cook times
- Detailed ingredient quantities
- Flavorful step-by-step instructions (6–10 steps)
- Optional notes with cultural or cooking insights
`;

app.post('/api/generate', async (req, res) => {
  try {
    const { ingredients, cuisine, language } = req.body;
    if (!ingredients) {
      return res.status(400).json({ error: 'Missing ingredients' });
    }

    const userPrompt = `
Create exactly 3 different ${cuisine} recipes using these ingredients: ${ingredients}.
Each recipe must be written in ${language || 'English'}.
Each recipe should have 6–10 cooking steps, proper spices, cooking methods, and tips for flavor.

Include an estimated nutritional breakdown per serving:
- calories (kcal)
- protein (g)
- carbs (g)
- fat (g)

ALWAYS return ONLY valid JSON in this exact format:

{
  "recipes": [
    {
      "title": string,
      "servings": number,
      "time_minutes": number,
      "ingredients": [{ "name": string, "quantity": string }],
      "steps": [string],
      "notes": string,
      "nutrition": {
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      }
    }
  ]
}
`;
    // Get the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 3000,
        responseMimeType: 'application/json' // force JSON output
      }
    });

    // Generate
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const textOutput = result?.response?.text();

    if (!textOutput) {
      return res.status(500).json({ error: 'No output from Gemini', raw: result });
    }

    // Parse JSON safely
    let output;
    try {
      output = JSON.parse(textOutput.trim());
      if (!Array.isArray(output.recipes)) {
        output.recipes = [output.recipes].filter(Boolean);
      }
    } catch (e) {
      console.error('❌ Failed to parse JSON from Gemini:', e, textOutput);
      return res.status(500).json({
        error: 'Invalid JSON from Gemini',
        raw_text: textOutput
      });
    }

    res.json({
      success: true,
      recipes: output.recipes
    });

  } catch (err) {
    console.error('❌ Error /api/generate', err?.message || err);
    res.status(500).json({
      error: 'Gemini request failed',
      details: err?.message || err
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server listening on http://localhost:${PORT}`)
);
