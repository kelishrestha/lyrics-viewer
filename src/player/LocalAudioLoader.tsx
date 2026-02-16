import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  onMetadata: (
    artist: string,
    title: string,
    lyrics?: string,
    songDetails?: any
  ) => void,
  setSourceAudio: (audio: any) => void,
  audioRef: any
}

export function LocalAudioLoader({ onMetadata, setSourceAudio, audioRef }: Props) {
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    // Read metadata
    jsmediatags.read(file, {
      onSuccess: (tag: any) => {
        const artist = tag.tags.artist || ""
        const title = tag.tags.title || ""
        const songDetails = {
          album: {
            name: tag.tags.album || "",
            picture: { format: tag.tags.picture?.format, type: tag.tags.picture?.type, data: tag.tags.picture?.data },
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
        } else {
          console.warn("Metadata not available")
          toast.error("Cannot fetch lyrics for this file. Please choose another file.")
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setFileName("No file chosen");
        }
      },
      onError: (err: any) => {
        console.warn("Metadata read failed", err)
      },
    })

    // set source audio
    setSourceAudio(URL.createObjectURL(file))
  }

  return (
    <div className="flex items-center w-full text-sm text-slate-500">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) {
            audioRef.current?.pause()
            handleFile(file)
          }
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mr-4 py-2 px-4 w-32 rounded-full border-0 text-sm font-semibold bg-secondary/10 text-secondary hover:bg-secondary/20 cursor-pointer"
      >
        Choose File
      </button>
      <span className="truncate w-60">{fileName}</span>
    </div>
  )
}
