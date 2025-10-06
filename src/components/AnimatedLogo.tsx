import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function AnimatedLogo({ size = 80, className = '', showText = true }: AnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  // Restart animation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false)
      setTimeout(() => setIsAnimating(true), 100)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Define the journey path points (representing travel destinations)
  const points = [
    { x: 20, y: 50, delay: 0 },
    { x: 35, y: 25, delay: 0.3 },
    { x: 55, y: 40, delay: 0.6 },
    { x: 75, y: 15, delay: 0.9 },
    { x: 90, y: 35, delay: 1.2 },
  ]

  // Generate the connecting path
  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    return `${acc} Q ${points[index - 1].x + 10} ${points[index - 1].y - 10} ${point.x} ${point.y}`
  }, '')

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 100 70"
        className="overflow-visible"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Animated connecting path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset={isAnimating ? 0 : 200}
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            delay: 0.2 
          }}
        />

        {/* Destination points */}
        {points.map((point, index) => (
          <motion.g key={index}>
            {/* Pulsing ring effect */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              opacity="0.3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                delay: point.delay + 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
            
            {/* Main dot */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="url(#logoGradient)"
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: point.delay,
                type: "spring",
                stiffness: 200
              }}
            />
            
            {/* Smaller inner highlight */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#ffffff"
              opacity="0.8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.4,
                delay: point.delay + 0.2
              }}
            />
          </motion.g>
        ))}

        {/* Flying element (represents travel/movement) */}
        <motion.circle
          r="2"
          fill="#ffffff"
          opacity="0.9"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 2.5,
            delay: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1.5
          }}
          style={{
            offsetPath: `path('${pathData}')`,
            offsetRotate: 'auto'
          }}
        />
      </motion.svg>

      {/* App name with staggered animation */}
      {showText && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-gray-900 leading-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Trips
          </motion.h1>
          <motion.p 
            className="text-sm text-orange-500 font-medium -mt-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Plan Together
          </motion.p>
        </motion.div>
      )}
    </div>
  )
}

// Simplified version for favicon generation
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ background: '#f97316' }}
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Simplified path for favicon */}
      <path
        d="M 20 60 Q 30 40 45 50 Q 60 30 80 45"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Key destination points */}
      <circle cx="20" cy="60" r="6" fill="#ffffff" />
      <circle cx="45" cy="50" r="6" fill="#ffffff" />
      <circle cx="80" cy="45" r="6" fill="#ffffff" />
      
      {/* Inner highlights */}
      <circle cx="20" cy="60" r="2" fill="#f97316" />
      <circle cx="45" cy="50" r="2" fill="#f97316" />
      <circle cx="80" cy="45" r="2" fill="#f97316" />
    </svg>
  )
}