import type { LyricLineType } from "../lyrics/types"

export type TranslationSongs = {
  language: string,
  title: string,
  url: string
  api_path: string
}

type SongMedia = {
  provider: string,
  url: string,
  type: string,
  attribution: string
}

export type SongDetailType = {
  album?: {
    cover_art_url?: string
    name: string
    release_date_for_display?: string
    url?: string,
    picture?: { format: string, type: string, data: Array<number> | any }
    year?: string,
    genre?: string
  },
  translation_songs?: TranslationSongs[],
  media?: SongMedia[],
}

export type TranslationsResponseType = {
  translations: any[]
}

export type SongResponseType = {
  source: string | null
  lyrics: LyricLineType[] | null
  raw_lyrics: string | null
  status: string
  url?: string
  song_details?: SongDetailType
}
