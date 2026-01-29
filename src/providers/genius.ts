import dotenv from 'dotenv'

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
  return userInput.replace(/[^\x20-\x7E\t\n\r]/g, "");
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

type GeniusSongResponse = { response: { song: { url: string, title: string, primary_artist: { id: number, name: string } } } }
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

export async function searchGenius(artist: string, title: string) {
  const q = `${cleanedString(title)} ${cleanedString(artist)}`.trim();

  console.log(`Searching in Genius: ${q}`)

  // Search with short timeout to avoid hanging UI
  const search = await fetchJSON<GeniusSearchResponse>(
    `${GENIUS_BASE}/search?q=${encodeURIComponent(q)}`,
    undefined,
    6000
  )

  const firstHit = search.response.hits?.[0]
  if (!firstHit) return null

  let matchedHit = firstHit;
  let matched = true;
  if (firstHit.result.title != (title) && firstHit.result.primary_artist.name != (artist)){
    console.log(search.response.hits, 63);
    // Check if the first hit is a hit or miss
    const allHits = search.response.hits
    if (allHits.length > 1) {
      allHits.forEach((hit: any) => {
        if (hit.result.title == cleanedString(title) && hit.result.primary_artist.name == cleanedString(artist)) {
          matchedHit = hit;
          return;
        } else {
          matched = false;
          return null;
        }
      })
    }
  }

  if(!matched) return null
  console.log(matched, 101);
  // Fetch song and artist in parallel for speed
  const song = await getSongInfo(matchedHit.result.id)
  if (!song) return null

  const [artistInfo] = await Promise.all([
    getArtistInfo(song.primary_artist.id),
  ])
  if (!artistInfo) return null

  return {
    url: song.url,
    title: song.title,
    artist: artistInfo.name,
  }
}
