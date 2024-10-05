document.addEventListener('DOMContentLoaded', () => {
  // ボタンの要素を取得
  const recordButton = document.getElementById('recordButton');
  const resultElement = document.getElementById('result');

  let mediaRecorder;
  let audioChunks = [];

  // イベントリスナーの設定
  recordButton.addEventListener('click', startRecording);

  function startRecording() {
    // マイクへのアクセスを取得
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // MediaRecorderの初期化
        mediaRecorder = new MediaRecorder(stream);

        // 録音開始
        mediaRecorder.start();
        recordButton.innerText = '録音停止';
        recordButton.removeEventListener('click', startRecording);
        recordButton.addEventListener('click', stopRecording);

        // 音声データの収集
        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });
      })
      .catch(error => {
        console.error('マイクのアクセスに失敗しました:', error);
        resultElement.innerText = 'マイクのアクセスに失敗しました。';
      });
  }

  function stopRecording() {
    // 録音停止
    mediaRecorder.stop();
    recordButton.innerText = '録音開始';
    recordButton.removeEventListener('click', stopRecording);
    recordButton.addEventListener('click', startRecording);

    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];

      // Deepgramに音声データを送信
      sendToDeepgram(audioBlob);
    });
  }

  // Deepgramに音声データを送信
  async function sendToDeepgram(audioBlob) {
    try {
      const response = await fetch('/api/deepgram', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/webm', // 音声データの形式に合わせる
        },
        body: audioBlob,
      });

      const data = await response.json();

      if (response.ok && data.transcript) {
        // Difyへの送信
        sendToDify(data.transcript);
      } else {
        const errorMessage = data.error || '文字起こしに失敗しました。';
        console.error('Deepgram APIエラー:', errorMessage);
        resultElement.innerText = errorMessage;
      }
    } catch (error) {
      console.error('Deepgramへの送信エラー:', error);
      resultElement.innerText = '文字起こし処理中にエラーが発生しました。';
    }
  }

  // Difyに文字起こしデータを送信（必要に応じて実装）
  async function sendToDify(transcript) {
    // ここにDify APIへの送信コードを記述
  }
});
