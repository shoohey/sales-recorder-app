document.addEventListener('DOMContentLoaded', () => {
  // ボタンと要素の取得
  const recordButton = document.getElementById('recordButton');
  const pauseButton = document.getElementById('pauseButton');
  const resumeButton = document.getElementById('resumeButton');
  const stopButton = document.getElementById('stopButton');
  const uploadButton = document.getElementById('uploadButton');
  const audioFileInput = document.getElementById('audioFileInput');
  const resultElement = document.getElementById('result');
  const statusElement = document.getElementById('status');

  let mediaRecorder;
  let audioChunks = [];

  // イベントリスナーの設定
  recordButton.addEventListener('click', startRecording);
  pauseButton.addEventListener('click', pauseRecording);
  resumeButton.addEventListener('click', resumeRecording);
  stopButton.addEventListener('click', stopRecording);
  uploadButton.addEventListener('click', uploadAudioFile);

  // 録音機能の関数は既存のものを使用
  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

        mediaRecorder.start();
        statusElement.innerText = '録音中...';

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        // ボタンの状態を更新
        recordButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;
      })
      .catch(error => {
        console.error('マイクのアクセスに失敗しました:', error);
        resultElement.innerText = 'マイクのアクセスに失敗しました。';
      });
  }

  function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      statusElement.innerText = '一時停止中';
      pauseButton.disabled = true;
      resumeButton.disabled = false;
    }
  }

  function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      statusElement.innerText = '録音再開';
      pauseButton.disabled = false;
      resumeButton.disabled = true;
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      statusElement.innerText = '録音停止';

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        audioChunks = [];

        // Deepgramに音声データを送信
        sendToDeepgram(audioBlob);

        // ボタンの状態をリセット
        recordButton.disabled = false;
        pauseButton.disabled = true;
        resumeButton.disabled = true;
        stopButton.disabled = true;
      });
    }
  }

  // 音声ファイルのアップロード処理
  function uploadAudioFile() {
    const file = audioFileInput.files[0];
    if (!file) {
      alert('音声ファイルを選択してください。');
      return;
    }

    // ファイルの形式をチェック（必要に応じて）
    if (!file.type.startsWith('audio/')) {
      alert('有効な音声ファイルを選択してください。');
      return;
    }

    // 状態を更新
    statusElement.innerText = '音声ファイルを処理しています...';

    // ファイルを読み込み、Deepgramに送信
    const reader = new FileReader();
    reader.onload = function(event) {
      const audioData = event.target.result;
      const audioBlob = new Blob([audioData], { type: file.type });
      sendToDeepgram(audioBlob);
    };
    reader.readAsArrayBuffer(file);
  }

  // Deepgramに音声データを送信
  async function sendToDeepgram(audioBlob) {
    try {
      const response = await fetch('/api/deepgram', {
        method: 'POST',
        headers: {
          'Content-Type': audioBlob.type, // 音声データの形式に合わせる
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

  // Difyに文字起こしデータを送信（既存の関数を使用または実装）
  async function sendToDify(transcript) {
    // Difyへの送信処理
    // 結果を resultElement に表示する
    try {
      const response = await fetch('/api/dify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (response.ok && data.output) {
        resultElement.innerText = data.output;
      } else {
        const errorMessage = data.error || 'フィードバックの生成に失敗しました。';
        console.error('Dify APIエラー:', errorMessage);
        resultElement.innerText = errorMessage;
      }
    } catch (error) {
      console.error('Difyへの送信エラー:', error);
      resultElement.innerText = 'フィードバック生成中にエラーが発生しました。';
    }
  }
});
