import { fetchJSON, removeAccents, removeSpecialCharacters } from "./utils.js";

const LYRICS_OVH_BASE_URL = 'https://api.lyrics.ovh/v1'

type LyricsOvhSongResponse = { lyrics?: string, error?: string }

// fix query
const cleanedString = (userInput: string): string => {
  userInput = removeAccents(userInput);
  return removeSpecialCharacters(userInput)
}

export async function searchLyricsOVH(artist: string, title: string) {
  try {
    const lyricsUrl = `${LYRICS_OVH_BASE_URL}/${encodeURIComponent(cleanedString(artist))}/${encodeURIComponent(cleanedString(title))}`
    console.log(`🔎 Searching in lyrics.ovh: ${lyricsUrl}`)
    const data = await fetchJSON<LyricsOvhSongResponse>(
      lyricsUrl, 'lyrics.ovh'
    )
    if (!data || typeof data !== 'object' || !('lyrics' in data)) return null
    return data.lyrics ?? null
  } catch {
    return null
  }
}
