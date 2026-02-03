import dotenv from 'dotenv'
import { source } from 'motion/react-client'

dotenv.config()
// Also try src/.env for projects that keep env alongside sources
dotenv.config({ path: './src/.env' })

const GENIUS_TOKEN = process.env.GENIUS_TOKEN

if (!GENIUS_TOKEN) {
  throw new Error("GENIUS_TOKEN is not set. Add it to './.env' or './src/.env' (GENIUS_TOKEN=...)")
}

const GENIUS_BASE = 'https://api.genius.com'

// fix query
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD') // Decompose accented characters into base letter + accent mark
    .replace(/[\u0300-\u036f]/g, ''); // Remove the accent marks (Unicode range)
};

const cleanedString = (userInput: string): string => {
  userInput = removeAccents(userInput);
  return userInput.replace(/[^\x20-\x7E\t\n\r]/g, "").replace(/\(\(\)\)/g, '').trim();
}

function normalizeText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

// Check if title is a substring in response title
const titleSubStringCheck = (sourceText: string, targetText: string) => {
  return sourceText.replace('(','').replace(')', '').split(' ').every(item => targetText.split(' ').includes(item))
}

function withTimeout(ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return { signal: ctrl.signal, cancel: () => clearTimeout(t) }
}

async function fetchJSON<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const { signal, cancel } = withTimeout(timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      signal,
      headers: {
        Authorization: `Bearer ${GENIUS_TOKEN}`,
      },
    })
    if (!res.ok) throw new Error(`Genius API ${res.status} ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    cancel()
  }
}

type GeniusSongResponse = { response: { song: { url: string, title: string, primary_artist: { id: number, name: string }, album: any, media: any, translation_songs: any} } }
type GeniusArtistResponse = { response: { artist: { name: string } } }
type GeniusSearchResponse = { response: { hits: Array<{ result: { id: number, title: string, primary_artist_names: string, primary_artist: { name: string } } }> } }

async function getSongInfo(songID: number) {
  const data = await fetchJSON<GeniusSongResponse>(`${GENIUS_BASE}/songs/${songID}`)
  return data.response.song
}

async function getArtistInfo(artistID: number) {
  const data = await fetchJSON<GeniusArtistResponse>(`${GENIUS_BASE}/artists/${artistID}`)
  return data.response.artist
}

function compileDetailsAndTranslations(song: GeniusSongResponse['response']['song']) {
  return {
    album: song.album,
    media: song.media,
    translation_songs: song.translation_songs
  }
}

export async function searchGenius(artist: string, title: string) {
  const q = `${cleanedString(title)} ${cleanedString(artist)}`.trim();

  console.log(`🔎 Searching in Genius: ${q}`)

  // Search with short timeout to avoid hanging UI
  const search = await fetchJSON<GeniusSearchResponse>(
    `${GENIUS_BASE}/search?q=${encodeURIComponent(q)}`,
    undefined,
    6000
  )

  const firstHit = search.response.hits?.[0]
  if (!firstHit) return null

  // Find matching hits from genius
  let matchedHit = firstHit;
  let matched = true;
  if (firstHit.result.title != (title) && firstHit.result.primary_artist.name != (artist)){
    // Check if the first hit is a hit or miss
    const allHits = search.response.hits
    if (allHits.length > 1) {
      console.log(`----- Title: ${title}, Cleaned title: ${cleanedString(title)}, Artist: ${artist} ------`, 87)
      for(const hit of allHits){
        console.log(`======= Response title: ${hit.result.title} by ${hit.result.primary_artist.name} =======`, 88);
        if (hit.result.title == cleanedString(title) && hit.result.primary_artist.name == cleanedString(artist)) {
          // Exact match
          matchedHit = hit;
          matched = true;
          break;
        } else if (normalizeText(hit.result.title) == normalizeText(title)){
          // Title match without special characters removal
          matchedHit = hit;
          matched = true;
          console.log(`>>>>>>> ❤️ Match found for ${hit.result.title} <<<<<<<`)
          break;
        } else if (normalizeText(hit.result.title) == normalizeText(cleanedString(title))){
          // Title match with cleaned title(w/o special characters)
          matchedHit = hit;
          matched = true;
          console.log(`>>>>>>> ❤️ Match found for ${hit.result.title} <<<<<<<`)
          break;
        } else if (titleSubStringCheck(title, hit.result.title)){
          // Title substring in response title
          matchedHit = hit;
          matched = true;
          console.log(`>>>>>>> ❤️ Match found for ${hit.result.title} <<<<<<<`)
          break;
        } else {
          matched = false;
        }
      }
    }
  }

  if(!matched) return null
  // Fetch song and artist in parallel for speed
  const song = await getSongInfo(matchedHit.result.id)
  if (!song) return null

  console.log(`✅ Song found: ${song.title} by ${song.primary_artist.name}`);
  console.log(song);
  const [artistInfo] = await Promise.all([
    getArtistInfo(song.primary_artist.id),
  ])
  if (!artistInfo) return null

  return {
    url: song.url,
    title: song.title,
    artist: artistInfo.name,
    songDetails: compileDetailsAndTranslations(song)
  }
}
