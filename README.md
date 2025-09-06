# 🎧 Lyrics Viewer

Spotify で再生中の楽曲の歌詞を Genius から取得し、DeepL を使って自動翻訳する Web アプリです。Node.js + Express を使ったバックエンドと、HTML/CSS/JavaScript を使ったシンプルなフロントエンドで構成されています。


---

## 🛠 主な機能

- 🎵 Spotify の「現在再生中の楽曲」を取得
- 🔍 Genius API を使って楽曲の歌詞を取得（スクレイピング）
- 🌍 DeepL API で日本語に翻訳
- 📱 モバイルにも対応したシンプルなUI（ローカル & ngrokで外部共有可）

---

## 📦 使用技術

| 項目       | 技術・サービス |
|------------|----------------|
| フロントエンド | HTML / CSS / JavaScript |
| バックエンド   | Node.js / Express |
| 外部API     | Spotify Web API, Genius API, DeepL API |
| その他     | Axios, Cheerio, dotenv, body-parser, CORS |

---

## 🚀 デモ

（※Renderのデプロイは現在一時停止中）

ローカルでの実行 or `ngrok` を使った一時公開が可能です。

---

## 🔧 セットアップ手順

```bash
git clone https://github.com/tatsurugit/lyrics-viewer.git
cd lyrics-viewer
npm install
```

.env ファイルをルートに作成し、以下の値を設定してください。
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
GENIUS_API_TOKEN=your_genius_token
DEEPL_API_KEY=your_deepl_key
```

起動
```bash
node server.js
```
