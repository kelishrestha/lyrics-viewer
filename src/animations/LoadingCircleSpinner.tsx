import { motion } from "motion/react"

function LoadingCircleSpinner({ width = 'w-12.5', height='h-12.5' }: { width?: string, height?: string }) {
  return (
    <div className="flex justify-center align-center rounded-lg">
      <motion.div
        className={`${width} ${height} border-gray-600 will-change-transform rounded-[50%] border-t-[#ff0088] border-4 border-solid`}
        animate={{ transform: "rotate(360deg)" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

export default LoadingCircleSpinner
