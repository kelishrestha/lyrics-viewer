import { PauseCircle, PlayCircle } from "react-bootstrap-icons";

export function PlayButton({ isPlaying, toggleIsPlaying, isDisabled }: { isPlaying: boolean, toggleIsPlaying: () => void, isDisabled: boolean }){

  return (
    <button
      aria-label={isPlaying ? "Pause" : "Play"}
      onClick={toggleIsPlaying}
      disabled={isDisabled}
      className="cursor-pointer"
      title={isPlaying ? "Pause" : "Play"}
    >
      {!isPlaying && (
        <PlayCircle className={ isDisabled ? 'text-primary-inactive' : 'text-primary'} size={25}/>
      )}
      {isPlaying && (
        <PauseCircle className={ isDisabled ? 'text-primary-inactive' : 'text-primary'} size={25}/>
      )}
    </button>
  )
}
