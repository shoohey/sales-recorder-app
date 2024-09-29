let mediaRecorder;
let audioChunks = [];

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };
  });

document.getElementById('recordButton').addEventListener('click', () => {
  mediaRecorder.start();
  document.getElementById('status').textContent = "録音中...";
});
document.getElementById('stopButton').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('status').textContent = "録音終了";
  
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      sendAudioToServer(audioBlob);
      audioChunks = [];  // 次回の録音のためにクリア
    };
  });
  async function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('サーバーエラー');
      }
  
      const result = await response.json();
      document.getElementById('transcriptionResult').textContent = `文字起こし結果: ${result.transcript}`;
    } catch (error) {
      console.error('エラー:', error);
    }
  }
  