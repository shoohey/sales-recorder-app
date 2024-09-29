// /api/transcribe.js
const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const formData = new FormData();
    formData.append('audio', req.body.audio);

    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/wav',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Deepgram API error');
      }

      const result = await response.json();
      res.status(200).json({ transcript: result.results.channels[0].alternatives[0].transcript });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
