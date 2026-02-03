import { useState } from "react"
import { FloatingLyrics } from "./ui/FloatingLyrics"
import { LocalAudioPlayer } from "./players/LocalAudioPlayer"
import { parseLRC, prepareFakeLyrics, type LyricLine } from "./lyrics/lrcParser"
import { adjust, resetSync } from "./sync/ManualSync"
import Loader from "./ui/Loader"
import ScrollingContent from "./ui/ScrollingContent"
import { SongDetail, type SongDetailType } from "./ui/SongDetail"
import { SongTranslations } from "./ui/SongTranslations"

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
  const [status, setStatus] = useState("Please choose song to fetch lyrics from...")
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false)
  const [songDetails, setSongDetails] = useState<SongDetailType | null>(null);
  const [source, setSource] = useState<string | null>(null);

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

    setSource(data.source)
    setRawLyrics(data.lyrics)

    if (data.lyrics) {
      // convert plain text → fake LRC (2s per line)
      const fakeLrc = prepareFakeLyrics(data.lyrics)

      setLyrics(parseLRC(fakeLrc))
      setStatus(`Lyrics loaded (${data.source})`)
      setIsFetchingLyrics(false)
    } else if (data.url) {
      // fallback: show Genius page via backend proxy to bypass X-Frame-Options
      setLyrics([])
      setStatus('Lyrics available on Genius')
      setSongDetails(data.song_details);
      setIsIframeLoading(true)
      setFallbackUrl(`http://localhost:4000/proxy?url=${encodeURIComponent(data.url)}`)
      setIsFetchingLyrics(false)
    }
    else {
      setStatus("Lyrics not available")
      setIsFetchingLyrics(false)
    }
  }

  function handleLocalMetadata(artist: string, title: string, lyricsText?: string, songDetails?: SongDetailType) {
    setArtist(artist)
    setTitle(title)

    if(songDetails) { setSongDetails(songDetails) }

    if (lyricsText) {
      setStatus("Lyrics loaded from file")
      setIsFetchingLyrics(false)
      setFallbackUrl(null)
      setRawLyrics(lyricsText)

      // Simple check for LRC format
      const isLRC = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lyricsText);

      if (isLRC) {
        setLyrics(parseLRC(lyricsText))
      } else {
        // Not LRC, so create fake timestamps (2s per line)
        const fakeLrc = prepareFakeLyrics(lyricsText)
        setLyrics(parseLRC(fakeLrc))
      }
    } else {
      // auto-fetch lyrics if not found in file
      fetchLyricsWith(artist, title);
    }
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

          <section className="my-9 border-b-2 border-amber-400" />

          {/* Song Details */}
          { !isFetchingLyrics && songDetails && (
            <section className="flex flex-col gap-4">
              <SongTranslations song={songDetails} />
              <SongDetail song={songDetails} artist={artist} title={title} />
            </section>
          )}

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
