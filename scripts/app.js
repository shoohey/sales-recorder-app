<script src="app.js"></script>
let mediaRecorder;
let audioChunks = [];

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    document.getElementById('start').addEventListener('click', () => {
      mediaRecorder.start();
    });

    document.getElementById('pause').addEventListener('click', () => {
      mediaRecorder.pause();
    });

    document.getElementById('resume').addEventListener('click', () => {
      mediaRecorder.resume();
    });

    document.getElementById('stop').addEventListener('click', () => {
      mediaRecorder.stop();
    });

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      // Deepgramへの送信処理をここで呼び出す
    };
  });


  async function sendToDeepgram(audioBlob) {
    const apiKey = 'YOUR_DEEPGRAM_API_KEY'; // 実際には環境変数から取得
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`
      },
      body: formData
    });
  
    const data = await response.json();
    const transcript = data.results.channels[0].alternatives[0].transcript;
    // Difyへの送信処理をここで呼び出す
  }

  

async function sendToDeepgram(audioBlob) {
    try {
      // サーバーサイドのエンドポイント '/api/deepgram' に音声データを送信
      const response = await fetch('/api/deepgram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream', // バイナリデータの送信
        },
        body: audioBlob, // 音声データのBlobオブジェクト
      });
  
      const data = await response.json();
  
      if (data.transcript) {
        // 文字起こし結果を取得し、次の処理へ
        sendToDify(data.transcript);
      } else {
        resultElement.innerText = '文字起こしに失敗しました。';
      }
    } catch (error) {
      console.error('Deepgramへの送信エラー:', error);
      resultElement.innerText = '文字起こし処理中にエラーが発生しました。';
    }
  }
  

  // api/dify.js

export default async (req, res) => {
    try {
      // リクエストから文字起こしテキストを取得
      const { transcript } = req.body;
  
      // Dify APIキーを環境変数から取得
      const apiKey = process.env.DIFY_API_KEY;
  
      // プロンプトを作成
      const prompt = `以下の会話内容を要約し、営業マンへのフィードバックを提供してください。\n\n${transcript}`;
  
      // Dify APIにリクエストを送信
      const response = await fetch('https://api.dify.ai/v1/your_endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          // 必要に応じて他のパラメータも追加
        }),
      });
  
      const data = await response.json();
  
      if (data.output) {
        // フィードバック結果を返す
        res.status(200).json({ output: data.output });
      } else {
        res.status(500).json({ error: 'Difyからの応答が無効です。' });
      }
    } catch (error) {
      console.error('Dify APIエラー:', error);
      res.status(500).json({ error: 'Dify APIの呼び出しに失敗しました。' });
    }
  };
  
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
  
      if (data.output) {
        displayResult(data.output);
      } else {
        resultElement.innerText = 'フィードバックの生成に失敗しました。';
      }
    } catch (error) {
      console.error('Difyへの送信エラー:', error);
      resultElement.innerText = 'フィードバック生成中にエラーが発生しました。';
    }
  }
  

  function displayResult(output) {
    resultElement.innerText = output;
  }
  