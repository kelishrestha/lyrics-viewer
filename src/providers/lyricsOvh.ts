const LYRICS_OVH_BASE_URL = 'https://api.lyrics.ovh/v1'

type LyricsOvhSongResponse = { lyrics?: string, error?: string }

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
    })
    if (!res.ok) throw new Error(`lyrics.ovh ${res.status} ${res.statusText}`)
    return (await res.json()) as unknown as T
  } finally {
    cancel()
  }
}

export async function searchLyricsOVH(artist: string, title: string) {
  try {
    const lyricsUrl = `${LYRICS_OVH_BASE_URL}/${encodeURIComponent(cleanedString(artist))}/${encodeURIComponent(cleanedString(title))}`
    console.log(`🔎 Searching in lyrics.ovh: ${lyricsUrl}`)
    const data = await fetchJSON<LyricsOvhSongResponse>(
      lyricsUrl
    )
    if (!data || typeof data !== 'object' || !('lyrics' in data)) return null
    return data.lyrics ?? null
  } catch {
    return null
  }
}
