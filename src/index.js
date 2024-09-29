async function sendAudioToDeepgram(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: formData
    });
  
    if (!response.ok) {
      throw new Error('Deepgram API call failed');
    }
  
    const result = await response.json();
    const transcript = result.results.channels[0].alternatives[0].transcript;
    document.getElementById('transcriptionResult').textContent = transcript;
  
    sendTextToGPT(transcript);
  }
  