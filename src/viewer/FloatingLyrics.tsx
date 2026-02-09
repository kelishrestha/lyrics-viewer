import { type RefObject, useEffect, useState } from "react";

import { RotateLyricsLine } from "../animations/RotateLyricsLine";
import type { LyricLineType } from "../lyrics/types";

export function FloatingLyrics({
  lyrics,
  audioRef,
}: {
  lyrics: LyricLineType[];
  audioRef: RefObject<HTMLAudioElement | null>;
}) {
  const [current, setCurrent] = useState<LyricLineType | null>(null);

  useEffect(() => {
    let raf: number;

    const loop = () => {
      const t = (audioRef.current?.currentTime ?? 0) * 1000;
      let line: LyricLineType | null = null;

      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (t >= lyrics[i].time) {
          line = lyrics[i];
          break;
        }
      }

      setCurrent(line);
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [lyrics, audioRef]);

  return (
    <div className="pointer-events-none relative inset-0 flex items-center justify-center px-4 w-full h-100vh">
      <div
        className="
          bg-gray-800/80 backdrop-blur-md
          rounded-2xl
          shadow-lg
          w-full
          justify-center items-center flex
          max-w-xs sm:max-w-md md:max-w-xl
          px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5
        "
      >
        {/* fixed default height container */}
        <div
          className="
            flex items-center justify-center
            text-center
            leading-snug
            wrap-break-word
            min-h-[5.2rem]
            sm:min-h-[6.8rem]
            md:min-h-38
            lg:min-h-46
            transition-[min-height] duration-300 ease-out
          "
        >
          <div
            className="
              text-white
              text-base
              sm:text-lg
              md:text-2xl
              lg:text-4xl
              text-shadow-2xs
            "
          >
            <RotateLyricsLine line={current?.text || '♪'} />
          </div>
        </div>
      </div>
    </div>
  );
}
