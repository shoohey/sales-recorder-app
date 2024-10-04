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
  