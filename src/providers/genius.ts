import dotenv from 'dotenv'

import {
  buildQuery,
  fetchJSON,
  hasSpecialCharacters,
  normalizeText,
  normalizeWithoutNormalChars,
  normalizeWithoutSpecialChars,
  titleSubStringCheck
} from './utils.js'

dotenv.config()
// Also try src/.env for projects that keep env alongside sources
dotenv.config({ path: './.env' })

const GENIUS_TOKEN = process.env.GENIUS_TOKEN

if (!GENIUS_TOKEN) {
  throw new Error("GENIUS_TOKEN is not set. Add it to './.env' or './src/.env' (GENIUS_TOKEN=...)")
}

const GENIUS_BASE = 'https://api.genius.com'

type GeniusSongResponse = {
  response: {
    song: {
      url: string,
      title: string,
      primary_artist: { id: number, name: string },
      id: number | string,
      album: any,
      media: any,
      translation_songs: any
    }
  }
}
type GeniusArtistResponse = {
  response: {
    artist: { name: string }
  }
}
type GeniusSearchResponse = {
  response: {
    hits: Array<{
      result: {
        id: number,
        title: string,
        primary_artist_names: string,
        primary_artist: { name: string }
      }
    }>
  }
}

const headers = {
  Authorization: `Bearer ${GENIUS_TOKEN}`,
}

async function getSongInfo(songID: number) {
  const data = await fetchJSON<GeniusSongResponse>(`${GENIUS_BASE}/songs/${songID}`, 'Genius API', headers)
  return data.response.song
}

async function getArtistInfo(artistID: number) {
  const data = await fetchJSON<GeniusArtistResponse>(`${GENIUS_BASE}/artists/${artistID}`, 'Genius API', headers)
  return data.response.artist
}

function compileDetailsAndTranslations(song: GeniusSongResponse['response']['song']) {
  return {
    id: song.id,
    album: song.album,
    media: song.media,
    translation_songs: song.translation_songs
  }
}

export async function searchGenius(artist: string, title: string) {
  if(!title) return

  let query;
  if(hasSpecialCharacters(title)){
    query = buildQuery(artist, title)
  } else {
    query = `${normalizeWithoutSpecialChars(title)} ${normalizeWithoutSpecialChars(artist)}`.trim();
  }

  console.log(`🔎 Searching in Genius: ${query}`)

  // Search with short timeout to avoid hanging UI
  const search = await fetchJSON<GeniusSearchResponse>(
    `${GENIUS_BASE}/search?q=${encodeURIComponent(query)}`,
    'Genius API',
    headers,
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
      console.log(`----- Title: ${title}, Cleaned title: ${normalizeWithoutSpecialChars(title)}, Artist: ${artist} ------`, 87)
      for(const hit of allHits){
        console.log(`======= Response title: ${hit.result.title} by ${hit.result.primary_artist.name} =======`, 88);
        if (hit.result.title == normalizeWithoutSpecialChars(title) && hit.result.primary_artist.name == normalizeWithoutSpecialChars(artist)) {
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
        } else if (normalizeText(hit.result.title) == normalizeText(normalizeWithoutSpecialChars(title))){
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
          const normalizedTitle = normalizeWithoutNormalChars(title)
          if (normalizedTitle && titleSubStringCheck(normalizedTitle, hit.result.title)){
            // Title substring without normal characters in response title
            matchedHit = hit;
            matched = true;
            console.log(`>>>>>>> ❤️ Match found for ${hit.result.title} <<<<<<<`)
          } else {
            // No match
            console.log(`❌ No match found: ${hit.result.title}`)
            matched = false;
          }
        }
      }
    }
  }

  if(!matched) return null
  // Fetch song and artist in parallel for speed
  const song = await getSongInfo(matchedHit.result.id)
  if (!song) return null

  console.log(`✅ Song found: ${song.title} by ${song.primary_artist.name}`);
  console.log('✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚')

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
