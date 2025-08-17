const spotifyClientId = "e71647fa50744af7bc6e37893583fe58";
const redirectUri = "https://lyrics-viewer.onrender.com";
const spotifyScopes = "user-read-currently-playing";

const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(spotifyScopes)}`;

const hash = window.location.hash;

if (hash) {
const token = new URLSearchParams(hash.substring(1)).get("access_token");

fetch("https://api.spotify.com/v1/me/player/currently-playing", {
	headers: { Authorization: "Bearer " + token }
})
	.then(res => res.json())
	.then(data => {
	if (!data || !data.item) {
		document.getElementById("trackInfo").innerText = "再生中の曲がありません";
		return;
	}

	const trackName = data.item.name;
	const artistName = data.item.artists[0].name;
	const albumImage = data.item.album.images[0].url;

	document.getElementById("trackInfo").innerHTML = `
		<div class="img"><img src="${albumImage}" width="640" /></div>
		<h2 class="track_title">${trackName}</h2>
		<div class="artist_name">${artistName}</div>
	`;

	// 🎤 GeniusのURL + 歌詞を取得
	fetch("/lyrics", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ trackName, artistName }),
	})
		.then(res => res.json())
		.then(data => {
		const { lyrics, songUrl } = data;

		const linksDiv = document.getElementById("links");
		linksDiv.innerHTML = `
			<div class="button">[<a href="${songUrl}" target="_blank">Geniusで歌詞を見る</a>]</div>
			<p class="lyric">${lyrics}</p>
		`;

		// 和訳ボタン
		const btn = document.createElement("button");
		btn.innerText = "Show Translation";
		btn.onclick = async () => {
			const res = await fetch("/translate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: lyrics }),
			});

			const translation = await res.json();
			document.getElementById("translation").innerHTML = `
			<h3 class="lyric_ja_ttl">和訳（DeepL）</h3>
			<p class="lyric ja">${translation.translated}</p>
			`;

			btn.style.display = "none"; // ボタンを非表示にする
		};

		linksDiv.appendChild(btn);
		});
	});
} else {
	window.location.href = authUrl;
}
