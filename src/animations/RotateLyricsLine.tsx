import { AnimatePresence, motion } from "framer-motion"

export function RotateLyricsLine({
  line = "♪"
}: {
  line: string
}) {
  return (
    <div className="text-xl text-center sm:text-4xl font-bold tracking-tighter md:text-6xl md:leading-16 w-fit flex items-center jusitfy-center mx-auto gap-1.5">
      <AnimatePresence mode="wait">
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
