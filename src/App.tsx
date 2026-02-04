import { useRef, useState } from "react"

import { parseLRC, prepareFakeLyrics } from "./lyrics/lrcParser"
import type { LyricsResponseType } from "./lyrics/types"
import AudioPlayer from "./player/AudioPlayer"
import Loader from "./ui/Loader"
import ScrollingContent from "./ui/ScrollingContent"
import { FloatingLyrics } from "./viewer/FloatingLyrics"
import IframeLoader from "./viewer/IframeLoader"
import { SongDetail } from "./viewer/SongDetail"
import { SongTranslations } from "./viewer/SongTranslations"
import type { SongDetailType, SongResponseType, TranslationsResponseType } from "./viewer/types"

const SongResponseInitial: SongResponseType = {
  source: 'none',
  lyrics: [],
  raw_lyrics: '',
  status: 'Please choose song to fetch lyrics from...',
  url: '',
  song_details: undefined
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL

export default function App() {
  const [artist, setArtist] = useState("")
  const [title, setTitle] = useState("")
  const [songResponse, setSongResponse] = useState<SongResponseType>(SongResponseInitial)
  const [songDetails, setSongDetails] = useState<SongDetailType | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false)
  const [isFetchingTranslations, setIsFetchingTranslations] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resetAll = () => {
    setIsFetchingLyrics(true)
    setFallbackUrl(null)
    setSongResponse({ ...SongResponseInitial, status: "Fetching lyrics..." })
  }

  async function fetchSyncedLyrics(artistName: string, titleName: string) {
    if (!artistName || !titleName) return

    resetAll()

    const res = await fetch(
      `${API_URL}/synced_lyrics?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(titleName)}`
    )

    const data: LyricsResponseType = await res.json()

    if(res.status !== 200){
      fetchLyricsWith(artistName, titleName)
      return
    }
    // Set plain lyrics
    setSongResponse((prev) => {
      return {
        ...prev,
        raw_lyrics: data.raw_lyrics,
      }
    })

    if(data.lyrics){
      setSongResponse((prev) => {
        return {
          ...prev,
          source: data.source,
          lyrics: parseLRC(data.lyrics!),
          raw_lyrics: data.raw_lyrics,
          url: data.url,
          song_details: data.song_details,
          status: `Lyrics loading from (${data.source})`,
        }
      })
      setIsFetchingLyrics(false)
    } else {
      fetchLyricsWith(artistName, titleName)
    }
  }

  async function fetchLyricsWith(artistName: string, titleName: string) {
    if (!artistName || !titleName) return

    setSongResponse((prev) => {
      return {
        ...prev,
        status: "Fetching lyrics..."
      }
    })
    resetAll()

    const res = await fetch(
      `${API_URL}/lyrics?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(titleName)}`
    )

    const data: LyricsResponseType = await res.json()

    setSongResponse((prev) => {
      return {
        ...prev,
        raw_lyrics: data.raw_lyrics
      }
    })

    if (data.raw_lyrics) {
      // convert plain text → fake LRC (2s per line)
      const fakeLrc = prepareFakeLyrics(data.raw_lyrics)
      setSongResponse((prev) => {
        return {
          ...prev,
          source: data.source,
          lyrics: parseLRC(fakeLrc),
          raw_lyrics: data.raw_lyrics,
          status: `Lyrics loading from ${data.source}`
        }
      })
      setIsFetchingLyrics(false)
    } else if (data.url) {
      // fallback: show Genius page via backend proxy to bypass X-Frame-Options
      setSongResponse((prev) => {
        return {
          ...prev,
          source: data.source,
          lyrics: [],
          raw_lyrics: data.raw_lyrics,
          song_details: data.song_details,
          status: `Lyrics loading from ${data.source}`
        }
      })
      setIsIframeLoading(true)
      setFallbackUrl(`${API_URL}/proxy?url=${encodeURIComponent(data.url)}`)
      setIsFetchingLyrics(false)
    }
    else {
      setSongResponse((prev) => {
        return {
          ...prev,
          status: "Lyrics not available"
        }
      })
      setIsFetchingLyrics(false)
    }
  }

  async function fetchTranslations(artistName: string, titleName: string) {
    setIsFetchingTranslations(true)

    if (!artistName || !titleName) return

    const res = await fetch(
      `${API_URL}/translations?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(titleName)}`
    )

    const translations: TranslationsResponseType = await res.json();

    if(res.status == 200){
      setSongDetails((prev) => {
        return {
          ...prev,
          translation_songs: translations.translations
        }
      })
    }
    setIsFetchingTranslations(false)
  }

  const handleIframeLoad = () => {
    setIsIframeLoading(false)
  }

  const rawLyrics = songResponse?.raw_lyrics

  return (
    <main className="grid grid-cols-5 h-lvh w-lvw">
      {/* Search form starts */}
      <section key="lyrics-search" className="bg-zinc-800 p-3">
        <AudioPlayer
          audioRef={audioRef}
          artist={artist}
          setArtist={setArtist}
          title={title}
          setTitle={setTitle}
          songResponse={songResponse}
          setSongResponse={setSongResponse}
          setSongDetails={setSongDetails}
          setIsFetchingLyrics={setIsFetchingLyrics}
          setFallbackUrl={setFallbackUrl}
          isFetchingLyrics={isFetchingLyrics}
          isFetchingTranslations={isFetchingTranslations}
          fetchSyncedLyrics={fetchSyncedLyrics}
          fetchTranslations={fetchTranslations}
        />

        <section className="my-9 border-b-2 border-amber-400" />

        {/* Song Details */}
        { !isFetchingLyrics && songDetails && (
          <section className="flex flex-col gap-4">
            <SongTranslations song={songResponse?.song_details || songDetails} />
            <SongDetail song={songResponse?.song_details || songDetails} artist={artist} title={title} />
            <p className="text-sm italic justify-center items-center flex">Lyrics Source: {songResponse?.source}</p>
          </section>
        )}
      </section>
      {/* Search form ends */}

      {/* Lyrics section starts */}
      <section key="lyrics-viewer" className="col-span-4">
        { isFetchingLyrics && <Loader status={songResponse.status} /> }
        { !isFetchingLyrics && (
          <>
            {/* Inline Lyrics View (Optional, MVP Debug View) */}
            { rawLyrics && (
              <div className="grid grid-cols-2 w-full">
                {/* Floating Karaoke Overlay */}
                <FloatingLyrics lyrics={songResponse?.lyrics || []} audioRef={audioRef} />
                <ScrollingContent lyrics={rawLyrics || ""} />
              </div>
            )}

            <IframeLoader
              songResponse={songResponse}
              fallbackUrl={fallbackUrl}
              isIframeLoading={isIframeLoading}
              handleIframeLoad={handleIframeLoad}
            />

            {/* Lyrics fetching failed */}
            {
              !rawLyrics && !fallbackUrl && (
                <div className="relative w-full h-full overflow-hidden inset-0 flex items-center justify-center bg-black/40 z-10">
                  <div className="text-center">
                    <p className="mt-4 text-gray-300">{songResponse.status}</p>
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
