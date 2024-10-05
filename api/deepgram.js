// api/deepgram.js

import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('Deepgram APIキーが設定されていません。');
      res.status(500).json({ error: 'Deepgram APIキーがサーバーで設定されていません。' });
      return;
    }

    // リクエストから音声データを取得
    const audioBuffer = await buffer(req);
    if (!audioBuffer || audioBuffer.length === 0) {
      console.error('音声データが提供されていません。');
      res.status(400).json({ error: '音声データが提供されていません。' });
      return;
    }

    // クライアントから送信された Content-Type を取得
    const contentType = req.headers['content-type'] || 'audio/webm;codecs=opus';

    // Deepgram APIに音声データを送信
    const response = await fetch('https://api.deepgram.com/v1/listen?language=ja&punctuate=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType, // クライアントからの Content-Type を使用
      },
      body: audioBuffer,
    });

    const data = await response.json();

    if (response.ok && data.results) {
      const transcript = data.results.channels[0].alternatives[0].transcript;
      res.status(200).json({ transcript });
    } else {
      const errorMessage = data.error || '文字起こしに失敗しました。';
      console.error('Deepgram APIエラー:', response.status, response.statusText, data);
      res.status(response.status).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('サーバーエラー:', error);
    res.status(500).json({ error: 'Deepgram APIの呼び出し中にエラーが発生しました。' });
  }
};
