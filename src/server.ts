import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
// import dotenv from 'dotenv'
import { searchGenius } from './providers/genius.js'
import { searchLyricsOVH } from './providers/lyricsOvh.js'

// dotenv.config()

const app = new Hono()

// CORS: allow local dev frontends; adjust list for your environments
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
app.use('*', cors({
  origin: (origin) => (origin && allowedOrigins.includes(origin)) ? origin : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  credentials: false,
}))

app.get('/lyrics', async c => {
  const artist = c.req.query('artist')
  const title = c.req.query('title')

  console.log(`🔎 Searching for lyrics: ${title} by ${artist}`)

  if (!artist || !title) {
    return c.json({ error: 'Missing artist or title' }, 400)
  }

  try {
    const lyrics = await searchLyricsOVH(artist, title)
    if(lyrics){
      console.log('✅ Lyrics found in lyrics.ovh')
      return c.json({ source: 'lyrics.ovh', lyrics })
    } else {
      // Genius
      console.log('⚠️ No lyrics found in lyrics.ovh; Searching in Genius....')
      const genius = await searchGenius(artist, title)
      if (genius) {
        console.log('✅ Lyrics found in Genius')
        return c.json({ source: 'genius', lyrics: null, url: genius.url, song_details: genius.songDetails })
      } else {
        console.log('⚠️ No lyrics found in Genius')
        return c.json({ source: null, lyrics: null, url: null })
      }
    }
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal server error' }, 500)
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

// Start server (Node runtime)
const port = Number(process.env.PORT) || 4000
serve({ fetch: app.fetch, port })
console.log(`🔥 Lyrics wrapper API running at http://localhost:${port}`)
