// scripts/app.js

let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resumeButton = document.getElementById('resume');
const stopButton = document.getElementById('stop');
const statusElement = document.getElementById('status');
const resultElement = document.getElementById('result');

startButton.addEventListener('click', startRecording);
pauseButton.addEventListener('click', pauseRecording);
resumeButton.addEventListener('click', resumeRecording);
stopButton.addEventListener('click', stopRecording);

// ボタンの初期状態を設定
setButtonState('initial');

// ユーザーのマイクへのアクセスを取得
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('start', () => {
      statusElement.innerText = '録音中...';
      setButtonState('recording');
    });

    mediaRecorder.addEventListener('pause', () => {
      statusElement.innerText = '一時停止中...';
      setButtonState('paused');
    });

    mediaRecorder.addEventListener('resume', () => {
      statusElement.innerText = '録音再開...';
      setButtonState('recording');
    });

    mediaRecorder.addEventListener('stop', () => {
      statusElement.innerText = '録音終了';
      setButtonState('stopped');

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = []; // 次の録音に備えてクリア

      // Deepgramへの送信
      sendToDeepgram(audioBlob);
    });
  })
  .catch(error => {
    console.error('マイクへのアクセスが拒否されました:', error);
    statusElement.innerText = 'マイクへのアクセスが必要です。';
  });

// 録音開始
function startRecording() {
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    mediaRecorder.start();
  }
}

// 録音一時停止
function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
  }
}

// 録音再開
function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
  }
}

// 録音停止
function stopRecording() {
  if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
    mediaRecorder.stop();
  }
}
// Deepgramに音声データを送信
async function sendToDeepgram(audioBlob) {
    try {
      const response = await fetch('/api/deepgram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
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
  

// Difyに文字起こしデータを送信
async function sendToDify(transcript) {
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
      displayResult(data.output);
    } else {
      const errorMessage = data.error || 'フィードバックの生成に失敗しました。';
      resultElement.innerText = errorMessage;
    }
  } catch (error) {
    console.error('Difyへの送信エラー:', error);
    resultElement.innerText = 'フィードバック生成中にエラーが発生しました。';
  }
}

// 結果を表示
function displayResult(output) {
  resultElement.innerText = output;
}

// ボタンの状態を設定
function setButtonState(state) {
  switch (state) {
    case 'initial':
      startButton.disabled = false;
      pauseButton.disabled = true;
      resumeButton.disabled = true;
      stopButton.disabled = true;
      break;
    case 'recording':
      startButton.disabled = true;
      pauseButton.disabled = false;
      resumeButton.disabled = true;
      stopButton.disabled = false;
      break;
    case 'paused':
      startButton.disabled = true;
      pauseButton.disabled = true;
      resumeButton.disabled = false;
      stopButton.disabled = false;
      break;
    case 'stopped':
      startButton.disabled = false;
      pauseButton.disabled = true;
      resumeButton.disabled = true;
      stopButton.disabled = true;
      break;
  }
}
