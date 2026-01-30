import { motion, type Variants } from "motion/react"
import '../App.css'

export default function ThreeDotsLoader() {
  const dotVariants: Variants = {
    jump: {
      transform: "translateY(-30px)",
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="loader-container"
    >
      <motion.div className="loader-dot" variants={dotVariants} />
      <motion.div className="loader-dot" variants={dotVariants} />
      <motion.div className="loader-dot" variants={dotVariants} />
    </motion.div>
  )
}

