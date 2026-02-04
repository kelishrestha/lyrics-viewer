import { useEffect, useState } from "react"
import { getTime } from "../lyrics/ManualSync"
import type { LyricLineType } from "../lyrics/lrcParser"
import { RotateLyricsLine } from "../animations/RotateLyricsLine";

export function FloatingLyrics({ lyrics }: { lyrics: LyricLineType[] }) {
  const [current, setCurrent] = useState<LyricLineType | null>(null)

  useEffect(() => {
    let raf: number

    const loop = () => {
      const t = getTime()
      const line =
        lyrics
          .slice()
          .reverse()
          .find(l => t >= l.time) || null

      setCurrent(line)
      raf = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(raf)
  }, [lyrics])

  return (
    <div className="text-center relative justify-center items-center flex
                    text-4xl pointer-events-none text-shadow-2xs">
      <div className="h-1/3 bg-gray-800 justify-center items-center flex px-10 rounded-2xl w-xl">
        <RotateLyricsLine line={current?.text || "♪"} />
      </div>
    </div>
  )
}
