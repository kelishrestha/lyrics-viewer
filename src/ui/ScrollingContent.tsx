import { motion, useScroll } from "motion/react"
import { useRef } from "react"

import { splitLyrics } from "../lyrics/lrcParser"

export default function ScrollingContent({ lyrics, showContent = false } : { lyrics: string, showContent: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  if(!showContent) return null

  return (
    <>
      <div ref={containerRef} className="h-full overflow-y-auto relative">
        <motion.div
          id="scroll-indicator"
          style={{
            scaleX: scrollYProgress,
            position: "sticky",
            top: 0,
            height: 8,
            originX: 0,
            width: "100%",
            backgroundColor: "#ff0088",
            zIndex: 10,
          }}
        />
        <LyricsView lyrics={splitLyrics(lyrics)} />
      </div>
    </>
  )
}

function LyricsView({ lyrics }: { lyrics: string[][] }) {
  return (
    <div className="space-y-6 text-center text-lg leading-relaxed text-primary-lyrics m-9">
      {lyrics.map((paragraph, i) => (
        <p key={i} className="opacity-90">
          {paragraph.map((line, j) => (
            <span key={j}>
              {line}
              <br />
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}
