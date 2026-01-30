import { useEffect, useState } from "react"
import { getTime } from "../sync/ManualSync"
import type { LyricLine } from "../lyrics/lrcParser"

export function FloatingLyrics({ lyrics }: { lyrics: LyricLine[] }) {
  const [current, setCurrent] = useState<LyricLine | null>(null)
  console.log(current, 7);

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
    current &&
    <div className="text-center relative justify-center items-center flex
                    text-4xl pointer-events-none text-shadow-2xs">
      <div className="h-1/3 bg-gray-800 justify-center items-center flex px-10 rounded-2xl w-auto">
        {current?.text || "♪"}
      </div>
    </div>
  )
}
