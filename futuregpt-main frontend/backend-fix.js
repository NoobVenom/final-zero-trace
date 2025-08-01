const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/prompt', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt provided' });
  }

  try {
    console.log('Received prompt:', prompt);
    
    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': 'Bearer sk-ThJ2bucGs6Vw0Sq9NSVuDoMR2xthhIQGamBbzorxalbspvN6',
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI response:', response.data);
    
    const aiResponse = response.data.choices[0].message.content;
    
    // Ensure we're not just echoing the user's message
    if (aiResponse === prompt) {
      console.log('Warning: AI response matches user prompt, providing fallback');
      return res.json({ 
        response: `I understand you said: "${prompt}". Let me provide a helpful response based on your query. This is a demo response since the AI might not be properly configured.` 
      });
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling OpenAI:', error.response?.data || error.message);
    
    if (error.response && error.response.data && error.response.data.error.code === 'insufficient_quota') {
      res.status(402).json({ error: 'Quota exceeded. Please check your OpenAI plan and billing details or wait for the next reset.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.options('/prompt', cors());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Ready to process AI requests...');
}); 