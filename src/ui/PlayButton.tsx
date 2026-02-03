import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";

export function PlayButton({ isPlaying, toggleIsPlaying }: { isPlaying: boolean, toggleIsPlaying: () => void }){

  return (
    <button
      aria-label={isPlaying ? "Pause" : "Play"}
      onClick={toggleIsPlaying}
      className="cursor-pointer"
    >
      {!isPlaying && (
        <PlayCircleIcon className="w-8 text-amber-300 disabled:text-gray-500" />
      )}
      {isPlaying && (
        <PauseCircleIcon className="w-8 text-amber-300 disabled:text-gray-500" />
      )}
    </button>
  )
}
