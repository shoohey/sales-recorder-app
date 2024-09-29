async function sendTextToGPT(transcript) {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        prompt: `営業の会話内容を要約して、改善点をフィードバックしてください。\n\n会話内容: ${transcript}`,
        max_tokens: 150
      })
    });
  
    const gptResult = await response.json();
    const feedback = gptResult.choices[0].text;
    document.getElementById('transcriptionResult').textContent += `\n\nフィードバック: ${feedback}`;
  }
  