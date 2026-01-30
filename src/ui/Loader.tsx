import ThreeDotsLoader from "./ThreeDotsLoader"

export default function Loader({status}: { status: string }): JSX.Element {
  return (
    <div className="relative w-full h-full overflow-hidden inset-0 flex items-center justify-center bg-black/40 z-10">
      <div className="text-center">
        <ThreeDotsLoader />
        <p className="mt-4 text-gray-300 italic font-light text-xs">Checking status...</p>
        <p className="mt-4 text-gray-300">{status}</p>
      </div>
    </div>
  )
}
