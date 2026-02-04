import { type RefObject, useEffect, useState } from "react"

import { RotateLyricsLine } from "../animations/RotateLyricsLine";
import type { LyricLineType } from "../lyrics/types";

export function FloatingLyrics({ lyrics, audioRef }: { lyrics: LyricLineType[], audioRef: RefObject<HTMLAudioElement | null> }) {
  const [current, setCurrent] = useState<LyricLineType | null>(null)

  useEffect(() => {
    let raf: number

    const loop = () => {
      const t = audioRef.current?.currentTime && (audioRef.current?.currentTime * 1000) || 0
      let line: LyricLineType | null = null

      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (t >= lyrics[i].time) {
          line = lyrics[i]
          break
        }
      }

      setCurrent(line)
      raf = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(raf)
  }, [lyrics, audioRef])

  return (
    <div className="text-center relative justify-center items-center flex
                    text-4xl pointer-events-none text-shadow-2xs">
      <div className="h-1/3 bg-gray-800 justify-center items-center flex px-10 rounded-2xl w-xl">
        <RotateLyricsLine line={current?.text || "♪"} />
      </div>
    </div>
  )
}
