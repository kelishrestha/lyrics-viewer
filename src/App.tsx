import { Button } from "@headlessui/react"
import { useRef, useState } from "react"
import { FileEarmarkMusicFill } from "react-bootstrap-icons"

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
import Footer from "./layouts/Footer"

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
  const [showFullLyrics, setShowFullLyrics] = useState(false)

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

    if (!artistName || !titleName) {
      setIsFetchingTranslations(false);
      return
    }

    const res = await fetch(
      `${API_URL}/translations?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(titleName)}`
    )

    const songTranslations: TranslationsResponseType = await res.json();
    if(res.status == 200){
      const newTranslations = songTranslations.translations;
      setSongDetails((prev) => ({ ...prev, translation_songs: newTranslations }));
      setSongResponse((prev) => ({
        ...prev!,
        song_details: {
          album: prev.song_details?.album || songDetails?.album,
          media: prev.song_details?.media || songDetails?.media,
          translation_songs: newTranslations
        } as SongDetailType
      }));
    }

    setIsFetchingTranslations(false)
  }

  const handleIframeLoad = () => {
    setIsIframeLoading(false)
  }

  const rawLyrics = songResponse?.raw_lyrics

  return (
    <main className="flex flex-col md:grid md:grid-cols-5 h-lvh w-lvw overflow-hidden">
      {/* Search form starts */}
      <section
        key="lyrics-search"
        className="
        md:bg-zinc-100 dark:md:bg-zinc-700 p-3 w-full h-auto max-h-[50vh] md:max-h-none md:h-full md:col-span-2 lg:col-span-1 overflow-y-auto shrink-0 z-10 shadow-md md:shadow-none flex flex-col
        bg-white dark:bg-black
        "
      >
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

        {/* Song Details */}
        { !isFetchingLyrics && songDetails && (
          <section className="my-4 flex flex-col gap-2 justify-center items-center">
            <div className="flex sm:flex-col 2xl:flex-row gap-2">
              { songResponse.raw_lyrics && (
                <Button
                  onClick={() => setShowFullLyrics((prev) => !prev)}
                  className="
                   inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm/6
                   font-semibold text-gray-900 shadow-inner shadow-white/10
                   focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white
                   data-hover:bg-primary/80 data-open:bg-primary/90
                  "
                  title="View full lyrics"
                >
                  <FileEarmarkMusicFill size={20} />
                  {showFullLyrics ? 'Hide' : 'Show'} lyrics
                </Button>
              )}
              <SongTranslations translations={songResponse?.song_details?.translation_songs || []} />
            </div>
            <SongDetail song={songResponse?.song_details || songDetails} artist={artist} title={title} />
            <p className="text-sm italic justify-center items-center flex">Lyrics Source: {songResponse?.source}</p>
          </section>
        )}

        <div className="mt-auto self-center max-w-50">
          <Footer />
        </div>
      </section>
      {/* Search form ends */}

      {/* Lyrics section starts */}
      <section key="lyrics-viewer" className="flex-1 md:col-span-3 lg:col-span-4 overflow-hidden relative">
        { isFetchingLyrics && <Loader status={songResponse.status} /> }
        { !isFetchingLyrics && (
          <>
            {/* Inline Lyrics View (Optional, MVP Debug View) */}
            { rawLyrics && (
              <div className="flex flex-col lg:flex-row w-full h-full relative">
                {/* Floating Karaoke Overlay */}
                <div className={`flex items-center justify-center transition-all duration-300 ease-in-out ${showFullLyrics ? 'h-1/2 w-full lg:h-full lg:w-1/2' : 'h-full w-full'}`}>
                  <FloatingLyrics lyrics={songResponse?.lyrics || []} audioRef={audioRef} />
                </div>
                { showFullLyrics && (
                  <div className="w-full h-1/2 lg:w-1/2 lg:h-full border-t lg:border-t-0 lg:border-l border-zinc-300/50 dark:border-white/10">
                    <ScrollingContent lyrics={rawLyrics || ""} showContent={showFullLyrics} />
                  </div>
                )}
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
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{songResponse.status}</p>
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
