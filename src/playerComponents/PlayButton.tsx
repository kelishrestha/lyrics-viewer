import { PauseCircle, PlayCircle } from "react-bootstrap-icons";

export function PlayButton({ isPlaying, toggleIsPlaying, isDisabled }: { isPlaying: boolean, toggleIsPlaying: () => void, isDisabled: boolean }){

  return (
    <button
      aria-label={isPlaying ? "Pause" : "Play"}
      onClick={toggleIsPlaying}
      disabled={isDisabled}
      className="cursor-pointer"
    >
      {!isPlaying && (
        <PlayCircle className={ isDisabled ? 'text-gray-600' : 'text-amber-300'} size={25}/>
      )}
      {isPlaying && (
        <PauseCircle className={ isDisabled ? 'text-gray-600' : 'text-amber-300'} size={25}/>
      )}
    </button>
  )
}
