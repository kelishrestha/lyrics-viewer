import { PauseCircle, PlayCircle } from "react-bootstrap-icons";

export function PlayButton({ isPlaying, toggleIsPlaying }: { isPlaying: boolean, toggleIsPlaying: () => void }){

  return (
    <button
      aria-label={isPlaying ? "Pause" : "Play"}
      onClick={toggleIsPlaying}
      className="cursor-pointer"
    >
      {!isPlaying && (
        <PlayCircle className="text-amber-300 disabled:text-gray-500" size={25}/>
      )}
      {isPlaying && (
        <PauseCircle className="text-amber-300 disabled:text-gray-500" size={25}/>
      )}
    </button>
  )
}
