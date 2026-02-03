// export interface Word {
//   time: number
//   text: string
// }

// export function parseLRC(lrc: string): Word[] {
//   const regex = /<(\d+:\d+\.\d+)>([^<]+)/g
//   const words: Word[] = []

//   const toMs = (t: string) => {
//     const [m, s] = t.split(":")
//     return Number(m) * 60000 + Number(s) * 1000
//   }

//   let match
//   while ((match = regex.exec(lrc))) {
//     words.push({ time: toMs(match[1]), text: match[2].trim() })
//   }

//   return words
// }

export type LyricLine = {
  time: number
  text: string
}

export function parseLRC(lrc: string): LyricLine[] {
  return lrc
    .split("\n")
    .map(line => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/)
      if (!match) return null
      const min = parseInt(match[1])
      const sec = parseFloat(match[2])
      return {
        time: (min * 60 + sec) * 1000,
        text: match[3].trim(),
      }
    })
    .filter(Boolean) as LyricLine[]
}

export function splitLyrics(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, "\n")
  return normalized
    .split(/\n{4,}/)          // paragraph breaks
    .map(p =>
      p
        .split("\n")             // lines
        .map(l => l.trim())
        .filter(Boolean)
    )
    .filter(p => p.length > 0)
}

export function prepareFakeLyrics(lyricsText: string): string {
  return lyricsText.split("\n")
    .filter(l => l.trim().length > 0)
    .map((line, i) => {
      const totalSec = i * 2
      const m = Math.floor(totalSec / 60)
      const s = totalSec % 60
      return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}\.00]${line}`
    })
    .join("\n")
}
