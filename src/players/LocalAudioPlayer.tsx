import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { startSync, resetSync } from "../sync/ManualSync"
import { useRef } from 'react';

type Props = {
  onMetadata: (artist: string, title: string, lyrics?: string, songDetails?: any) => void
}

export function LocalAudioPlayer({ onMetadata }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  async function handleFile(file: File) {
    // Read metadata
    jsmediatags.read(file, {
      onSuccess: tag => {
        const artist = tag.tags.artist || ""
        const title = tag.tags.title || ""
        const songDetails = {
          album: {
            name: tag.tags.album,
            picture: { format: tag.tags.picture?.format, type: tag.tags.picture?.type, data: tag.tags.picture.data },
            year: tag.tags.year,
            genre: tag.tags.genre
          },
        }
        let lyrics: string | undefined;
        const lyricsTag = tag.tags.lyrics;
        if (lyricsTag) {
          if (typeof lyricsTag === 'string') {
            lyrics = lyricsTag;
          } else if (lyricsTag.lyrics && typeof lyricsTag.lyrics === 'string') {
            // For USLT/SYLT tag objects
            lyrics = lyricsTag.lyrics;
          }
        }

        if (artist && title) {
          onMetadata(artist, title, lyrics, songDetails)
        }
      },
      onError: err => {
        console.warn("Metadata read failed", err)
      },
    })

    // Play audio
    const audio = new Audio(URL.createObjectURL(file))
    audio.onplay = startSync
    audio.onabort = resetSync
    audio.onended = resetSync
    audioRef.current = audio
    audio.play()
  }

  return (
    <input
      type="file"
      accept="audio/*"
      onChange={e => {
        const file = e.target.files?.[0]
        audioRef.current?.pause()
        if (file) handleFile(file)
      }}
      className="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100"
    />
  )
}
