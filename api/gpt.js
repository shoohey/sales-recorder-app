// /api/gpt.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { transcript } = req.body;  // Deepgramからの文字起こし結果を受け取る

    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4",
          prompt: `次の会話内容を要約し、営業マンにフィードバックしてください:\n\n${transcript}`,
          max_tokens: 150
        })
      });

      const gptResult = await response.json();
      const feedback = gptResult.choices[0].text;

      res.status(200).json({ feedback });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
