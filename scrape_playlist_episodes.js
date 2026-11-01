const https = require('https');
const fs = require('fs');

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function parsePlaylistVideos(html) {
  const results = [];
  // Match ytInitialData
  const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.*?});/s);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const contents = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
      if (contents) {
        for (const item of contents) {
          const v = item.playlistVideoRenderer;
          if (v && v.videoId) {
            results.push({
              videoId: v.videoId,
              title: v.title?.runs?.[0]?.text || '',
              duration: v.lengthText?.simpleText || '30:00',
              thumb: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
            });
          }
        }
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  }

  // Fallback regex if json parse failed or returned 0
  if (results.length === 0) {
    const videoMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_\-]{11})"/g)].map(m => m[1]);
    const unique = [...new Set(videoMatches)];
    for (const vid of unique) {
      results.push({
        videoId: vid,
        title: '',
        duration: '30:00',
        thumb: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      });
    }
  }
  return results;
}

async function scrape(name, pid) {
  console.log(`Scraping ${name} (${pid})...`);
  const html = await fetch(`https://www.youtube.com/playlist?list=${pid}`);
  const videos = parsePlaylistVideos(html);
  console.log(`${name}: found ${videos.length} videos`);
  return { name, pid, videos: videos.slice(0, 30) };
}

async function run() {
  const playlists = {
    sayedSaeed: 'PLry_Q_JBGiwlpthyqneT8ybdQ-QtQAo0n',
    yaqeen: 'PL56IcDjrf3YJr__TEOJ2UOv3jCzht1_yc',
    waadHaqq: 'PLA36CD40AF4FC4A7A',
    lamasat: 'PLbBj8LNBJwR8uUfyg9UbkL_oUOvwkgHXk',
    othman: 'PL6C71skKjoGsHYPmniKWbQV7jKMFjYVdz',
    yousefSeerah: 'PL6mMw2piuhMxbpKYpsQmHAprcqBchpd-F',
    yousefAsharah: 'PL6mMw2piuhMy7ReRLjSnQq4HvhKFzMeub',
    yousefQasas: 'PL6mMw2piuhMzvk--derzlpgPu8Cv5hJm3',
    islamSobhi: 'PLyK6PbDjBQEe4SpcBvPJEqxTlObZDV8HW',
  };

  const output = {};
  for (const [key, pid] of Object.entries(playlists)) {
    output[key] = await scrape(key, pid);
  }

  fs.writeFileSync('D:/ATHAR/athar/playlist_episodes.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('Finished writing D:/ATHAR/athar/playlist_episodes.json!');
}

run();
