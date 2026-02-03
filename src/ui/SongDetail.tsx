import { useEffect } from "react"

type TranslationSongs = {
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
  album: {
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

function imageFromBytes(
  data: number[],
  mimeType: string = "image/jpeg"
): string {
  const uint8Array = new Uint8Array(data)
  const blob = new Blob([uint8Array], { type: mimeType })
  return URL.createObjectURL(blob)
}


export function SongDetail({ song }: { song: SongDetailType }): JSX.Element {
  if(!song) return null

  const releaseDate = song.album?.release_date_for_display || song.album?.year;

  const coverUrl = imageFromBytes(song.album?.picture?.data, song.album?.picture?.format)
  const albumCoverImage = song.album?.cover_art_url || coverUrl

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(coverUrl)
    }
  }, [coverUrl])

  return (
    <section className="m-1 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-500 p-3">
      <img
        src={albumCoverImage} alt={song.album?.name}
        className="w-full h-full rounded-md"/>
      <p className="flex flex-col my-2">
        <span className="font-bold mt-2">{song.album?.name}</span>
        <span className="italic text-xs">Release date: {releaseDate}</span>
        { song.album?.genre && <span className="italic text-xs">Genre: {song.album?.genre}</span> }

      </p>
    </section>
  )
}
