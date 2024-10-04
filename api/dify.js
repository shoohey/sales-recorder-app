// api/dify.js

export default async (req, res) => {
    try {
      // リクエストメソッドの確認
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }
  
      // リクエストボディから文字起こしテキストを取得
      const { transcript } = req.body;
      if (!transcript) {
        res.status(400).json({ error: '文字起こしテキストが提供されていません。' });
        return;
      }
  
      // Dify APIキーの取得
      const apiKey = process.env.DIFY_API_KEY;
      if (!apiKey) {
        console.error('Dify APIキーが設定されていません。');
        res.status(500).json({ error: 'Dify APIキーがサーバーで設定されていません。' });
        return;
      }
  
      // Dify APIエンドポイントの設定
      const endpoint = 'https://api.dify.ai/v1/apps/workflow/mLxX5DjCY2SrNEyC/run'; // 実際のエンドポイントに置き換え
  
      // リクエストペイロードの作成
      const payload = {
        inputs: {
          transcript: transcript, // LLMノードの入力フィールド名に合わせる
        }
      };
  
      // Dify APIにリクエストを送信
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
  
      // レスポンスのステータスコードをチェック
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dify APIエラー:', response.status, errorText);
        res.status(response.status).json({ error: `Dify APIエラー: ${errorText}` });
        return;
      }
  
      const data = await response.json();
  
      // フィードバック結果を取得
      const output = data.output || data.result || data; // Difyのレスポンス形式に合わせて調整
  
      // レスポンスとしてフィードバック結果を返す
      res.status(200).json({ output });
    } catch (error) {
      console.error('サーバーエラー:', error);
      res.status(500).json({ error: 'Dify APIの呼び出し中にエラーが発生しました。' });
    }
  };
  