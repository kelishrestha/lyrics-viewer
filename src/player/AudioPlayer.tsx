import { type RefObject, useEffect, useRef, useState, type ChangeEvent } from "react";
import { MusicNoteList, Soundwave, Translate } from "react-bootstrap-icons";

import LoadingCircleSpinner from "../animations/LoadingCircleSpinner";
import { formatTime, parseLRC, prepareFakeLyrics } from "../lyrics/lrcParser";
import { PlayButton } from "../playerComponents/PlayButton";
import ProgressBar from "../playerComponents/ProgressBar";
import Visualizer from "../playerComponents/Visualizer";
import Volume from "../playerComponents/Volume";
import type { SongDetailType, SongResponseType } from "../viewer/types";
import { LocalAudioLoader } from "./LocalAudioLoader";

export default function AudioPlayer({
  artist,
  setArtist,
  title,
  setTitle,
  setSongDetails,
  setSongResponse,
  setIsFetchingLyrics,
  setFallbackUrl,
  isFetchingLyrics,
  isFetchingTranslations,
  fetchSyncedLyrics,
  fetchTranslations,
  audioRef,
}: {
  artist: string,
  setArtist: (artist: string) => void,
  title: string,
  setTitle: (title: string) => void,
  songResponse: SongResponseType | null,
  setSongResponse: (songResponse: SongResponseType) => void,
  setSongDetails: (songDetails: any) => void,
  setIsFetchingLyrics: (isFetchingLyrics: boolean) => void,
  setFallbackUrl: (fallbackUrl: string | null) => void,
  isFetchingLyrics: boolean,
  isFetchingTranslations: boolean,
  fetchSyncedLyrics: (artist: string, title: string) => void,
  fetchTranslations: (artist: string, title: string) => void,
  audioRef: RefObject<HTMLAudioElement | null>,
}) {
  const sourceAudioRef = audioRef;
  const [sourceAudioUrl, setSourceAudioUrl] = useState<any | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [songLength, setSongLength] = useState(0);
  const [songFinished, setSongFinished] = useState(false);
  const [_dragging, setDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [visualizer, setVisualizer] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const audio = sourceAudioRef.current;
    if(audio) {
      audio.volume = volume;
    }
  }, [volume, sourceAudioRef])

  const setTimeUpdate = () => {
    const audio = sourceAudioRef.current
    if (audio) {
      const currentTime = audio.currentTime;
      const progress = currentTime ? Number(((currentTime*100)/audio.duration).toFixed(1)) : 0;
      setTimeElapsed(currentTime);
      setProgress(progress)
    }
  }

  const setLoadedData = async () => {
    const audio = sourceAudioRef.current;
    if(audio){
      setTimeElapsed(audio.currentTime);
      setSongLength(audio.duration);
      if (!audioContextRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        const analyserNode = context.createAnalyser();
        const sourceNode = context.createMediaElementSource(audio);
        sourceNode.connect(analyserNode);
        analyserNode.connect(context.destination);
        setAnalyser(analyserNode);
        sourceNodeRef.current = sourceNode;
      }
    }
  };

  const updateCurrentTime = (value: any) => {
		const audio = sourceAudioRef.current;
    if(audio){
      const currentTime = (audio.duration * value) / 100;
      audio.currentTime = currentTime;
    }
	};

  const progressSeekEnd = (e: ChangeEvent<HTMLInputElement>) => {
    updateCurrentTime(e.target.value);
		setDragging(false);
    if (songFinished) { setSongFinished(false); }
	};

  const handlePlayPause = () => {
    const audio = sourceAudioRef.current;
    if(audio){
      setIsPlaying(!isPlaying);
      if(isPlaying){
        audio.pause();
      } else {
        audio.play();
      }
    }
  }

  function handleLocalMetadata(
    artist: string,
    title: string,
    lyricsText?: string,
    songDetails?: SongDetailType
  ){
    setArtist(artist)
    setTitle(title)

    const audio = sourceAudioRef.current;
    if(audio){
      audio.play();
      audioContextRef.current?.resume();
    }

    setIsPlaying(true);
    if(songDetails) {
      setSongDetails(songDetails);
    }
    if (lyricsText) {
      setIsFetchingLyrics(false)
      setFallbackUrl(null)

      // Simple check for LRC format
      const isLRC = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lyricsText);
      let parsedLyrics;

      if (isLRC) {
        parsedLyrics = parseLRC(lyricsText);
      } else {
        const fakeLrc = prepareFakeLyrics(lyricsText)
        parsedLyrics = parseLRC(fakeLrc);
      }

      setSongResponse({
        source: 'file',
        lyrics: parsedLyrics,
        raw_lyrics: lyricsText,
        status: "Lyrics loaded from file",
        song_details: songDetails
      })
      setSongDetails(songDetails)
    } else {
      // auto-fetch lyrics if not found in file
      fetchSyncedLyrics(artist, title);
    }
  }

  const translationDisabled = !title || !artist || isFetchingLyrics || isFetchingTranslations;
  const iconDisabled = !title || !artist
  const iconClassNames = iconDisabled ? 'text-gray-600' : ( visualizer ? 'text-amber-600' : 'text-amber-300')

  return (
    <>
      {/* Playback Sources */}
      <div className="p-2 my-2">
        <LocalAudioLoader
          onMetadata={handleLocalMetadata}
          setSourceAudio={setSourceAudioUrl}
          audioRef={sourceAudioRef} />
      </div>
      {/* Audio Player */}
      <audio
        src={sourceAudioUrl}
        ref={sourceAudioRef}
        onTimeUpdate={setTimeUpdate}
        onLoadedData={setLoadedData}
        crossOrigin="anonymous"
        onEnded={() => {
          setSongFinished(true)
          setIsPlaying(false)
        }}
      ></audio>
      <div className="flex flex-row flex-wrap justify-between pb-2 gap-2">
        <PlayButton isPlaying={isPlaying} toggleIsPlaying={handlePlayPause} isDisabled={iconDisabled} />
        <button
          aria-label="Visualizer"
          onClick={() => setVisualizer((prev) => !prev)}
          disabled={iconDisabled}
          className="cursor-pointer disabled:text-gray-600"
          title='Visualizer'
        >
          <Soundwave className={iconClassNames} size={25} />
        </button>
        <button disabled={iconDisabled} onClick={() => fetchSyncedLyrics(artist, title)} title="Fetch Lyrics">
          { isFetchingLyrics && <LoadingCircleSpinner width='w-6' height='h-6'/> }
          { !isFetchingLyrics &&
            <MusicNoteList className={`${iconDisabled ? "text-gray-600" : "text-amber-300"}`} size={25} />
          }
        </button>
        <button
          disabled={translationDisabled}
          onClick={() => fetchTranslations(artist, title)}
          className="cursor-pointer disabled:text-gray-600"
          title='Fetch translations'
        >
          { isFetchingTranslations && <LoadingCircleSpinner width='w-6' height='h-6'/> }
          { !isFetchingTranslations && <Translate className={`${translationDisabled ? "text-gray-600" : "text-amber-300"}`} size={25} /> }
        </button>
        <Volume
          value={volume * 100}
          onChange={(e) =>
            setVolume(Number(e.target.value) / 100)
          }
          isDisabled={iconDisabled}
        />
      </div>
      { visualizer && (<Visualizer analyser={analyser} source={sourceAudioRef} />) }

      <ProgressBar
        value={progress}
        onChange={(e) => {
          setProgress(Number(e.target.value));
        }}
        progressSeekStart={() => setDragging(true)}
        progressSeekEnd={progressSeekEnd}
        timeElapsed={formatTime(timeElapsed)}
        songLength={formatTime(songLength)}
        isDisabled={iconDisabled}
      />
    </>
  )
}
