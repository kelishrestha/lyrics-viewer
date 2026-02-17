import type { SongDetailType } from "../viewer/types"

export type LyricLineType = {
  time: number
  text: string
}

export type LyricsResponseType = {
  source: string | null
  lyrics: string | null
  raw_lyrics: string | null
  url?: string
  song_details?: SongDetailType
}
