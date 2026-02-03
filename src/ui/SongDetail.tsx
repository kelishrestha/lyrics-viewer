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


export function SongDetail({ song, artist, title }: { song: SongDetailType, artist: string, title: string}): JSX.Element {
  if(!song) return null

  const releaseDate = song.album?.release_date_for_display || song.album?.year;

  const coverUrl = imageFromBytes(song.album?.picture?.data, song.album?.picture?.format)
  const albumCoverImage = song.album?.cover_art_url || coverUrl

  return (
    <section className="m-1 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-500 p-6">
      <img
        src={albumCoverImage} alt={song.album?.name}
        className="w-full h-full rounded-md"/>
      <p className="flex flex-col my-2 gap-1 text-center">
        <span className="font-bold text-2xl">{title}</span>
        <span className="font-bold text-gray-300">{artist}</span>
        <span className="text-xs text-gray-300 mt-2">Album</span>
        <span className="font-bold text-gray-300">{song.album?.name}</span>
      </p>
      <p className="flex flex-col text-gray-300 gap-1 text-center">
        <span className="italic text-xs">Release date: {releaseDate}</span>
        { song.album?.genre && <span className="italic text-xs">Genre: {song.album?.genre}</span> }
      </p>
    </section>
  )
}
