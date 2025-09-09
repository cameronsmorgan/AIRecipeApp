// server/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // allow  frontend  in production
app.use(express.json());

// Serve static frontend (public folder)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error('Missing OPENROUTER_API_KEY in .env');
  process.exit(1);
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

app.post('/api/generate', async (req, res) => {    //req = the incoming HTTP request from the browser || res = the response object that we send back
  try {
    const { ingredients, cuisine } = req.body;
    if (!ingredients) return res.status(400).json({ error: 'Missing ingredients' });

    // Build a clear prompt that asks for a JSON response
    const systemPrompt = `You are a concise, accurate recipe assistant. Answer with clear step-by-step instructions.`;   //tells ai how to behave
    const userPrompt = `Create a ${cuisine} recipe using the following ingredients: ${ingredients}.   
Return the recipe as strict JSON (no extra commentary) with keys:
{
  "title": string,
  "servings": number (if known),
  "time_minutes": number (approx),
  "ingredients": [{"name": string, "quantity": string (optional)}],
  "steps": [string...],
  "notes": string (optional)
}`;                                                                                                                       //userPrompt tells ai what to generate

    const body = {
      model: 'openai/gpt-oss-20b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }, // request structured JSON where supported
      max_tokens: 800,   //limit length of API's reply
      temperature: 0.7   //controls randomness/creativity. lower number = more predictable
    };

    const r = await axios.post(OPENROUTER_URL, body, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000  //fail if takes longer than 2mins
    });

    const data = r.data;

    // The response should include choices[0].message.content (either a parsed object or string).
    let output;
    if (data?.choices && data.choices.length > 0) {
      const msg = data.choices[0].message;
      // msg.content might be an object already (if response_format applied) or a stringified JSON
      if (typeof msg?.content === 'object') {
        output = msg.content;
      } else if (typeof msg?.content === 'string') {
        try {
          output = JSON.parse(msg.content);
        } catch (e) {
          // fallback: return raw text
          output = { raw: msg.content };
        }
      } else {
        output = { raw_choice: data.choices[0] };
      }
      return res.json({ success: true, output, raw: data });
    }

    res.status(500).json({ error: 'No completion returned', raw: data });
  } catch (err) {
    console.error('Error /api/generate', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: 'OpenRouter request failed', details: err?.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
