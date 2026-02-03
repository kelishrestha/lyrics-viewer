import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

type Props = {
  onMetadata: (artist: string, title: string, lyrics?: string, songDetails?: any) => void,
  setSourceAudio: (audio: any) => void,
  audioRef: any
}

export function LocalAudioPlayer({ onMetadata, setSourceAudio, audioRef }: Props) {
  async function handleFile(file: File) {
    // Read metadata
    jsmediatags.read(file, {
      onSuccess: tag => {
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
        }
      },
      onError: err => {
        console.warn("Metadata read failed", err)
      },
    })

    // set source audio
    setSourceAudio(URL.createObjectURL(file))
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
