import Loader from "../ui/Loader"
import type { SongResponseType } from "./types"

export default function IframeLoader({
  songResponse,
  fallbackUrl,
  isIframeLoading,
  handleIframeLoad
}: {
  songResponse: SongResponseType,
  fallbackUrl: string | null,
  isIframeLoading: boolean,
  handleIframeLoad: () => void
}){
  if(!fallbackUrl) return null

  return (
    <div className="relative w-full h-full">
      {isIframeLoading && <Loader status={songResponse.status} />}
      <iframe
        src={fallbackUrl}
        onLoad={handleIframeLoad}
        onError={handleIframeLoad}
        className="w-full h-full border-0"
      />
    </div>
  )
}
