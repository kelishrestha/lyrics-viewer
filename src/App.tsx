import { useState } from "react"
import { FloatingLyrics } from "./ui/FloatingLyrics"
import { LocalAudioPlayer } from "./players/LocalAudioPlayer"
import { parseLRC, type LyricLine } from "./lyrics/lrcParser"
import { adjust, resetSync } from "./sync/ManualSync"
import Loader from "./ui/loader"
import ScrollingContent from "./ui/ScrollingContent"

type LyricsResponse = {
  source: string | null
  lyrics: string | null
  url?: string
  song_details?: any
}

export default function App() {
  const [artist, setArtist] = useState("")
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [rawLyrics, setRawLyrics] = useState<string | null>(null)
  const [status, setStatus] = useState("Idle")
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false)

  async function fetchLyricsWith(artistName: string, titleName: string) {
    if (!artistName || !titleName) return

    resetSync()
    setStatus("Fetching lyrics…")
    setIsFetchingLyrics(true)
    setFallbackUrl(null)
    setLyrics([])
    setRawLyrics(null)

    const res = await fetch(
      `http://localhost:4000/lyrics?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(titleName)}`
    )

    const data: LyricsResponse = await res.json()

    if (data.lyrics) {
      // convert plain text → fake LRC (2s per line)
      const fakeLrc = data.lyrics
        .split("\n")
        .filter(l => l.trim().length > 0)
        .map((line, i) => {
          const totalSec = i * 2
          const m = Math.floor(totalSec / 60)
          const s = totalSec % 60
          return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}\.00]${line}`
        })
        .join("\n")

      setLyrics(parseLRC(fakeLrc))
      setRawLyrics(data.lyrics)
      console.log(lyrics, 50);
      setStatus(`Lyrics loaded (${data.source})`)
      setIsFetchingLyrics(false)
    } else if (data.url) {
      // fallback: show Genius page via backend proxy to bypass X-Frame-Options
      setLyrics([])
      setStatus('Lyrics available on Genius')
      setIsIframeLoading(true)
      setFallbackUrl(`http://localhost:4000/proxy?url=${encodeURIComponent(data.url)}`)
      setIsFetchingLyrics(false)
    }
    else {
      setStatus("Lyrics not available")
      setIsFetchingLyrics(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchLyricsWith(artist, title);
  }

  function handleLocalMetadata(artist: string, title: string) {
    setArtist(artist)
    setTitle(title)
    // auto-fetch lyrics
    fetchLyricsWith(artist, title);
  }

  const handleIframeLoad = () => {
    setIsIframeLoading(false)
  }

  return (
      <main className="grid grid-cols-5 h-lvh w-lvw">
        {/* Search form starts */}
        <section key="lyrics-search" className="bg-zinc-800 p-3">
          {/* Playback Sources */}
          <div className="p-2 my-2">
            <LocalAudioPlayer onMetadata={handleLocalMetadata} />
          </div>
          {/* Lyrics Search Form */}
          <form
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-white">
                Song Title
              </span>
              <input
                placeholder="Song title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 px-3 py-2 border shadow-sm border-slate-300 placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-sky-500
                block w-full rounded-md sm:text-sm focus:ring-1 mb-4"
              />
            </label>

            <label className="block">
              <span className="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-white">
                Artist
              </span>
              <input
                placeholder="Artist"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="mt-1 px-3 py-2 border shadow-sm border-slate-300 placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-sky-500
                block w-full rounded-md sm:text-sm focus:ring-1 mb-4"
              />
            </label>

            <button type="submit" className="w-full rounded-full">
              Fetch Lyrics
            </button>

            <div style={{ marginTop: 8, display: 'none' }}>
              <button type="button" className="rounded-full mx-2" onClick={() => adjust(-250)}>
                -250ms
              </button>
              <button type="button" className="rounded-full mx-2" onClick={() => adjust(250)}>
                +250ms
              </button>
            </div>
          </form>
        </section>
        {/* Search form ends */}

        {/* Lyrics section starts */}
        <section key="lyrics-viewer" className="col-span-4">
          { isFetchingLyrics && <Loader status={status} /> }
          { !isFetchingLyrics && (
            <>

              {/* Inline Lyrics View (Optional, MVP Debug View) */}
              {rawLyrics && (
                <div className="grid grid-cols-2 w-full">
                  {/* Floating Karaoke Overlay */}
                  <FloatingLyrics lyrics={lyrics} />
                  <ScrollingContent lyrics={rawLyrics} />
                </div>
              )}

              {fallbackUrl && (
                <div className="relative w-full h-full">
                  {isIframeLoading && <Loader status={status} />}
                  <iframe
                    src={fallbackUrl}
                    onLoad={handleIframeLoad}
                    onError={handleIframeLoad}
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {/* Lyrics fetching failed */}
              {
                !rawLyrics && !fallbackUrl && (
                  <div className="relative w-full h-full overflow-hidden inset-0 flex items-center justify-center bg-black/40 z-10">
                    <div className="text-center">
                      <p className="mt-4 text-gray-300">{status}</p>
                    </div>
                  </div>
                )
              }
            </>
          )}
        </section>
        {/* Lyrics section ends */}
    </main>
  )
}
