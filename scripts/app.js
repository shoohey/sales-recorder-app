function startRecording() {
  // 録音開始の処理
}

// ボタンの要素を取得
const recordButton = document.getElementById('recordButton');

// イベントリスナーの設定
recordButton.addEventListener('click', startRecording);



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

