import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { searchGenius } from './providers/genius.js'
import { searchLrcLib } from './providers/lrclib.js'
import { searchLyricsOVH } from './providers/lyricsOvh.js'

const app = new Hono()

// CORS: allow local dev frontends; adjust list for your environments
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://lyrics-viewer-yaqu.onrender.com'
]
app.use('*', cors({
  origin: (origin) => (origin && allowedOrigins.includes(origin)) ? origin : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  credentials: false,
}))

app.get('/synced_lyrics', async c => {
  const artist = c.req.query('artist')
  const title = c.req.query('title');

  console.log("❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯ START ❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯")
  console.log(`Searching for synced lyrics: ${title} by ${artist}`)

  if(!title) {
    return c.json({ error: 'Missing title' }, 400)
  }
  if(!artist) {
    return c.json({ error: 'Missing artist' }, 400)
  }

  try {
    const lyricsNet = await searchLrcLib(artist, title)
    if(lyricsNet){
      // Lyrics.net
      return c.json({ source: 'lrclib',
                      lyrics: lyricsNet.syncedLyrics,
                      raw_lyrics: lyricsNet.plainLyrics,
                      url: null })
    } else {
      return c.json({
        error: 'Lyrics not found'
      }, 404)
    }
  } catch(e) {
    return c.json({ error: `Internal server error: ${e}` }, 500)
  }
})

app.get('/lyrics', async c => {
  const artist = c.req.query('artist')
  const title = c.req.query('title')

  console.log(`🔎 Searching for lyrics: ${title} by ${artist}`)

  if (!artist || !title) {
    return c.json({ error: 'Missing artist or title' }, 400)
  }

  try {
    const lyricsOvh = await searchLyricsOVH(artist, title)
    if(lyricsOvh){
      console.log('✅ Lyrics found in lyrics.ovh')
      console.log('✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ END ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚')
      return c.json({ source: 'lyrics.ovh', raw_lyrics: lyricsOvh, lyrics: null, url: null })
    } else {
      // Genius
      console.log("( •_ •) ▬▬ι═══════ﺤ")
      console.log('⚠️ No lyrics found in lyrics.ovh and lrclib.net; Searching in Genius....')
      console.log('────────────────────────────────────────────────────────────────────────────────')
      const genius = await searchGenius(artist, title)
      if (genius) {
        console.log('✅ Lyrics found in Genius')
        return c.json({ source: 'genius', lyrics: null, raw_lyrics: null, url: genius.url, song_details: genius.songDetails })
      } else {
        console.log("( •_ •) ▬▬ι═══════ﺤ")
        console.log('⚠️ No lyrics found in Genius')
        console.log('────────────────────────────────────────────────────────────────────────────────')
        return c.json({ source: null, lyrics: null, raw_lyrics: null, url: null })
      }
    }
  } catch (e) {
    console.error(e)
    return c.json({ error: `Internal server error: ${e}` }, 500)
  }
})

app.get('/translations', async c => {
  const artist = c.req.query('artist')
  const title = c.req.query('title')

  console.log("❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯ START ❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯❯")
  console.log(`🔎 Searching for translations: ${title} by ${artist}`)

  if(!artist || !title) {
    return c.json({ error: 'Missing artist or title' }, 400)
  }

  try {
    const song = await searchGenius(artist, title)
    if (song && song.songDetails.translation_songs.length > 0) {
      console.log('✅ Translations found')
      console.log('✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ END ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚.🎧⋆☾⋆⁺₊✧✩♬ ₊˚')
      return c.json({ translations: song.songDetails.translation_songs })
    } else {
      return c.json({ error: 'No translations found' }, 404)
    }
  } catch (err) {
    return c.json({ error: `Internal server error: ${err}` }, 500)
  }
})

// Proxy endpoint to allow embedding Genius pages in an iframe via our domain
app.get('/proxy', async c => {
  const target = c.req.query('url')
  if (!target) return c.text('Missing url', 400)

  let u: URL
  try { u = new URL(target) } catch { return c.text('Invalid url', 400) }
  // Only allow genius.com
  if (!(u.hostname === 'genius.com' || u.hostname.endsWith('.genius.com'))) {
    return c.text('Forbidden host', 403)
  }

  const res = await fetch(u.toString(), { redirect: 'follow' as any })
  if (!res.ok) return c.text(`Upstream error: ${res.status}`, 502)
  const html = await res.text()

  // Serve HTML without X-Frame-Options and allow framing by our app
  return c.html(html, 200, {
    'Content-Type': 'text/html; charset=utf-8',
    // Remove frame-blocking headers by overriding
    'X-Frame-Options': 'ALLOWALL',
    'Content-Security-Policy': "frame-ancestors 'self' *",
  })
})

// Status API
app.get('/status', c => {
  return c.json({ status: 'ok', message: 'Lyrics wrapper API is running'})
})

// Start server (Node runtime)
const port = Number(process.env.PORT) || 4000
serve({ fetch: app.fetch, port })
console.log(`🔥 Lyrics wrapper API running at http://localhost:${port}`)
console.log("⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹ ࣪ ˖")
console.log("‧₊˚♪ 𝄞₊˚⊹")
