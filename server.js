const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const PORT = process.env.PORT || 5500;

const GENIUS_API_TOKEN = process.env.GENIUS_API_TOKEN;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

app.post("/lyrics", async (req, res) => {
  try {
    const { trackName, artistName } = req.body;

    // Genius APIで曲ページのURL取得
    const searchRes = await axios.get("https://api.genius.com/search", {
      params: { q: `${trackName} ${artistName}` },
      headers: { Authorization: `Bearer ${GENIUS_API_TOKEN}` },
    });

    console.log("trackName:", trackName);
    console.log("artistName:", artistName);
    console.log("Genius API Token:", GENIUS_API_TOKEN ? "✓" : "✗（undefined）");
    console.log("Genius API response:", searchRes.data);

    const song = searchRes.data.response.hits.find(hit =>
      hit.result.title.toLowerCase().includes(trackName.toLowerCase())
    );

    if (!song) return res.status(404).json({ error: "曲が見つかりませんでした" });

    const songUrl = song.result.url;

    // Geniusページから歌詞スクレイピング
    const pageRes = await axios.get(songUrl);
    const $ = cheerio.load(pageRes.data);
    let lyrics = "";

    $('[class^="Lyrics__Container"]').each((i, elem) => {
      // LyricsHeader や Sidebar など明らかに不要な親要素を除外
      if (
        $(elem).parents('[class*="LyricsHeader"]').length > 0 ||
        $(elem).parents('[class*="Sidebar"]').length > 0
      ) {
        return;
      }

      const lines = [];

      $(elem).contents().each((j, el) => {
        if (el.type === "text") {
          const text = $(el).text().trim();
          if (text.length > 0 && !text.match(/^[\[\(].*[\]\)]$/)) {
            lines.push(text);
          }
        } else if (el.name === "br") {
          lines.push("\n");
        } else if (el.name === "a") {
          lines.push($(el).text());
        }
      });

      const block = lines.join("").trim();
      if (block.length > 0) {
        lyrics += block + "\n\n";
      }
    });

    if (!lyrics) return res.status(500).json({ error: "歌詞の抽出に失敗しました" });

    res.json({ lyrics, songUrl });
  } catch (err) {
    console.error("Geniusエラー:", err.message);
    res.status(500).json({ error: "歌詞の取得に失敗しました" });
  }
});

app.post("/translate", async (req, res) => {
  try {
    const { text } = req.body;

    const deeplRes = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text,
        target_lang: "JA",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const translated = deeplRes.data.translations[0].text;
    res.json({ translated });
  } catch (err) {
    console.error("DeepL翻訳エラー:", err.message);
    res.status(500).json({ error: "翻訳に失敗しました" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
