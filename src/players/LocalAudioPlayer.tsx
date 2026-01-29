import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { startSync, resetSync } from "../sync/ManualSync"
import { useRef } from 'react';

type Props = {
  onMetadata: (artist: string, title: string) => void
}

export function LocalAudioPlayer({ onMetadata }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  async function handleFile(file: File) {
    // Read metadata
    jsmediatags.read(file, {
      onSuccess: tag => {
        const artist = tag.tags.artist || ""
        const title = tag.tags.title || ""

        if (artist && title) {
          onMetadata(artist, title)
        }
      },
      onError: err => {
        console.warn("Metadata read failed", err)
      },
    })

    // Play audio
    const audio = new Audio(URL.createObjectURL(file))
    audio.onplay = startSync
    audio.onpause = resetSync
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
    />
  )
}
