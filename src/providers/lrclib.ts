import { buildQuery, fetchJSON } from "./utils.js";

const LRCLIB_BASE_URL = 'https://lrclib.net/api'

type LrcLibSongResponse = {
  id: number,
  name: string,
  trackName: string,
  artistName: string
  albumName: string,
  duration: number,
  instrumental: boolean,
  plainLyrics: string,
  syncedLyrics: string
}[];

export async function searchLrcLib(artist: string, title: string) {
  try {
    const query = buildQuery(artist, title)
    const lyricsUrl = `${LRCLIB_BASE_URL}/search?q=${encodeURIComponent(query)}`;
    console.log(`🔎 Searching in lrclib.net: ${query}`)
    const data = await fetchJSON<LrcLibSongResponse>(
      lyricsUrl, 'lrclib.net'
    )
    if(data.length == 0) return null
    console.log(`✅ Song found in lrclib.net: ${data[0].name} by ${data[0].artistName}`);

    return {
      id: data[0].id,
      name: data[0].name,
      trackName: data[0].trackName,
      artistName: data[0].artistName,
      albumName: data[0].albumName,
      duration: data[0].duration,
      instrumental: data[0].instrumental,
      plainLyrics: data[0].plainLyrics,
      syncedLyrics: data[0].syncedLyrics,
    }
  } catch {
    return null
  }
}
