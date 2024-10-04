// api/deepgram.js

import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false, // デフォルトのボディパーサーを無効化
  },
};

export default async (req, res) => {
  try {
    // リクエストから音声データを取得
    const buf = await buffer(req);
    const audioData = buf;

    // Deepgram APIキーを環境変数から取得
    const apiKey = process.env.DEEPGRAM_API_KEY;

    // Deepgram APIに音声データを送信
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/wav', // 音声データの形式に応じて変更
      },
      body: audioData,
    });

    const data = await response.json();

    // 文字起こしの結果を取得
    const transcript = data.results.channels[0].alternatives[0].transcript;

    // レスポンスとして文字起こし結果を返す
    res.status(200).json({ transcript });
  } catch (error) {
    console.error('Deepgram APIエラー:', error);
    res.status(500).json({ error: 'Deepgram APIの呼び出しに失敗しました。' });
  }
};
