"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Volume2, Zap, Globe } from "lucide-react"

type StatItem = {
  value: string
  description: string
  delay: number
}

type DataPoint = {
  id: number
  left: number
  top: number
  height: number
  direction: "up" | "down"
  delay: number
}

const stats: StatItem[] = [
  {
    value: "10K+",
    description: "Audio assets\ncreated",
    delay: 0,
  },
  {
    value: "Zero",
    description: "Setup required\nfor deployment",
    delay: 0.2,
  },
  {
    value: "50+",
    description: "Game engines\nsupported",
    delay: 0.4,
  },
  {
    value: "1000+",
    description: "Games using\nour platform",
    delay: 0.6,
  },
]

// Static data points to prevent hydration issues - completely deterministic
const dataPoints: DataPoint[] = [
  { id: 0, left: 1, top: 250.5, height: 120, direction: "down", delay: 0 },
  { id: 1, left: 33, top: -45.2, height: 95, direction: "up", delay: 0.035 },
  { id: 2, left: 65, top: 275.8, height: 110, direction: "down", delay: 0.07 },
  { id: 3, left: 97, top: -32.1, height: 88, direction: "up", delay: 0.105 },
  { id: 4, left: 129, top: 290.3, height: 135, direction: "down", delay: 0.14 },
  { id: 5, left: 161, top: -71.9, height: 102, direction: "up", delay: 0.175 },
  { id: 6, left: 193, top: 265.7, height: 125, direction: "down", delay: 0.21 },
  { id: 7, left: 225, top: -28.4, height: 98, direction: "up", delay: 0.245 },
  { id: 8, left: 257, top: 285.1, height: 115, direction: "down", delay: 0.28 },
  { id: 9, left: 289, top: -55.8, height: 92, direction: "up", delay: 0.315 },
  { id: 10, left: 321, top: 270.2, height: 130, direction: "down", delay: 0.35 },
  { id: 11, left: 353, top: -41.6, height: 105, direction: "up", delay: 0.385 },
  { id: 12, left: 385, top: 295.9, height: 108, direction: "down", delay: 0.42 },
  { id: 13, left: 417, top: -38.3, height: 118, direction: "up", delay: 0.455 },
  { id: 14, left: 449, top: 260.4, height: 122, direction: "down", delay: 0.49 },
  { id: 15, left: 481, top: -62.7, height: 95, direction: "up", delay: 0.525 },
  { id: 16, left: 513, top: 280.1, height: 112, direction: "down", delay: 0.56 },
  { id: 17, left: 545, top: -49.5, height: 100, direction: "up", delay: 0.595 },
  { id: 18, left: 577, top: 275.8, height: 128, direction: "down", delay: 0.63 },
  { id: 19, left: 609, top: -35.2, height: 90, direction: "up", delay: 0.665 },
  { id: 20, left: 641, top: 290.6, height: 115, direction: "down", delay: 0.7 },
  { id: 21, left: 673, top: -58.9, height: 103, direction: "up", delay: 0.735 },
  { id: 22, left: 705, top: 265.3, height: 120, direction: "down", delay: 0.77 },
  { id: 23, left: 737, top: -42.1, height: 96, direction: "up", delay: 0.805 },
  { id: 24, left: 769, top: 285.7, height: 125, direction: "down", delay: 0.84 },
  { id: 25, left: 801, top: -51.4, height: 108, direction: "up", delay: 0.875 },
  { id: 26, left: 833, top: 270.9, height: 118, direction: "down", delay: 0.91 },
  { id: 27, left: 865, top: -36.8, height: 92, direction: "up", delay: 0.945 },
  { id: 28, left: 897, top: 295.2, height: 132, direction: "down", delay: 0.98 },
  { id: 29, left: 929, top: -65.5, height: 105, direction: "up", delay: 1.015 },
  { id: 30, left: 961, top: 260.1, height: 110, direction: "down", delay: 1.05 },
  { id: 31, left: 993, top: -48.7, height: 98, direction: "up", delay: 1.085 },
  { id: 32, left: 1025, top: 280.4, height: 122, direction: "down", delay: 1.12 },
  { id: 33, left: 1057, top: -33.9, height: 115, direction: "up", delay: 1.155 },
  { id: 34, left: 1089, top: 275.6, height: 108, direction: "down", delay: 1.19 },
  { id: 35, left: 1121, top: -56.2, height: 95, direction: "up", delay: 1.225 },
  { id: 36, left: 1153, top: 290.8, height: 128, direction: "down", delay: 1.26 },
  { id: 37, left: 1185, top: -44.3, height: 102, direction: "up", delay: 1.295 },
  { id: 38, left: 1217, top: 265.5, height: 118, direction: "down", delay: 1.33 },
  { id: 39, left: 1249, top: -39.6, height: 88, direction: "up", delay: 1.365 },
  { id: 40, left: 1281, top: 285.9, height: 125, direction: "down", delay: 1.4 },
  { id: 41, left: 1313, top: -52.8, height: 110, direction: "up", delay: 1.435 },
  { id: 42, left: 1345, top: 270.2, height: 115, direction: "down", delay: 1.47 },
  { id: 43, left: 1377, top: -41.5, height: 92, direction: "up", delay: 1.505 },
  { id: 44, left: 1409, top: 295.7, height: 130, direction: "down", delay: 1.54 },
  { id: 45, left: 1441, top: -67.1, height: 105, direction: "up", delay: 1.575 },
  { id: 46, left: 1473, top: 260.8, height: 112, direction: "down", delay: 1.61 },
  { id: 47, left: 1505, top: -46.9, height: 98, direction: "up", delay: 1.645 },
  { id: 48, left: 1537, top: 280.3, height: 120, direction: "down", delay: 1.68 },
  { id: 49, left: 1569, top: -35.7, height: 108, direction: "up", delay: 1.715 },
]

// @component: BankingScaleHero
export const BankingScaleHero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [typingComplete, setTypingComplete] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setTypingComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // @return
  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-8 py-24 pt-16">
        <div className="grid grid-cols-12 gap-5 gap-y-16">
          <div className="col-span-12 md:col-span-6 relative z-10">
            <div
              className="relative h-6 inline-flex items-center font-mono uppercase text-xs text-[#167E6C] mb-12 px-2"
              style={{
                fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
              }}
            >
              <div className="flex items-center gap-0.5 overflow-hidden">
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "auto",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="block whitespace-nowrap overflow-hidden text-[#167E6C] relative z-10"
                  style={{
                    color: "#146e96",
                  }}
                >
                  Audio-first game development
                </motion.span>
                <motion.span
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: typingComplete ? [1, 0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="block w-1.5 h-3 bg-[#167E6C] ml-0.5 relative z-10 rounded-sm"
                  style={{
                    color: "#146e96",
                  }}
                />
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[40px] font-normal leading-tight tracking-tight text-[#111A4A] mb-6"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                fontSize: "40px",
                fontWeight: "400",
              }}
            >
              Powering immersive audio experiences for game developers{" "}
              <span
                className="opacity-40"
                style={{
                  fontWeight: "400",
                  fontSize: "40px",
                }}
              >
                with intelligent audio cursor technology. Build locally, sell globally.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg leading-6 text-[#111A4A] opacity-60 mt-0 mb-6"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
              }}
            >
              The first platform that revolutionizes game audio development with AI-powered cursor technology, enabling you to create dynamic soundscapes and immersive audio experiences with intuitive gestures and deploy them globally with a single click.
            </motion.p>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 4px 20px rgba(20, 110, 150, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex justify-center items-center leading-4 text-center cursor-pointer whitespace-nowrap outline-none font-medium h-9 text-[#232730] bg-white/50 backdrop-blur-sm shadow-[0_1px_1px_0_rgba(255,255,255,0),0_0_0_1px_rgba(87,90,100,0.12)] transition-all duration-200 ease-in-out rounded-lg px-4 mt-5 text-sm group hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(87,90,100,0.18)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#146e96]" />
                Learn about our audio platform
                <ArrowRight className="w-4 h-4 -mr-1 transition-transform duration-150 group-hover:translate-x-1" />
              </span>
            </motion.button>

            {/* Floating micro-interaction elements */}
            <div className="absolute -top-10 -right-10 opacity-20">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-16 h-16 border border-[#146e96] rounded-full flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-[#146e96]" />
              </motion.div>
            </div>

            <div className="absolute -bottom-5 -left-5 opacity-15">
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-12 h-12 bg-gradient-to-br from-[#146e96] to-[#1e7ba8] rounded-lg flex items-center justify-center"
              >
                <Globe className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="relative w-full h-[416px] -ml-[200px]">
              <div className="absolute top-0 left-[302px] w-[680px] h-[416px] pointer-events-none">
                <div className="relative w-full h-full">
                  {dataPoints.map((point) => (
                    <motion.div
                      key={point.id}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={
                        isVisible
                          ? {
                              opacity: [0, 1, 1],
                              height: [0, point.height, point.height],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        delay: point.delay,
                        ease: [0.5, 0, 0.01, 1],
                      }}
                      className="absolute w-1.5 rounded-[3px]"
                      style={{
                        left: `${point.left}px`,
                        top: `${point.top}px`,
                        background:
                          point.direction === "down"
                            ? "linear-gradient(rgb(176, 200, 196) 0%, rgb(176, 200, 196) 10%, rgba(156, 217, 93, 0.1) 40%, rgba(113, 210, 240, 0) 75%)"
                            : "linear-gradient(to top, rgb(176, 200, 196) 0%, rgb(176, 200, 196) 10%, rgba(156, 217, 93, 0.1) 40%, rgba(113, 210, 240, 0) 75%)",
                        backgroundColor: "rgba(22, 126, 108, 0.01)",
                      }}
                    >
                      <motion.div
                        initial={{
                          opacity: 0,
                        }}
                        animate={
                          isVisible
                            ? {
                                opacity: [0, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.3,
                          delay: point.delay + 1.7,
                        }}
                        className="absolute -left-[1px] w-2 h-2 bg-[#167E6C] rounded-full"
                        style={{
                          top: point.direction === "down" ? "0px" : `${point.height - 8}px`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="overflow-visible pb-5">
              <div className="grid grid-cols-12 gap-5 relative z-10">
                {stats.map((stat, index) => (
                  <div key={index} className="col-span-6 md:col-span-3">
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                        filter: "blur(4px)",
                      }}
                      animate={
                        isVisible
                          ? {
                              opacity: [0, 1, 1],
                              y: [20, 0, 0],
                              filter: ["blur(4px)", "blur(0px)", "blur(0px)"],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        delay: stat.delay,
                        ease: [0.1, 0, 0.1, 1],
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                      }}
                      onHoverStart={() => setHoveredStat(index)}
                      onHoverEnd={() => setHoveredStat(null)}
                      className="flex flex-col gap-2 cursor-pointer p-4 rounded-xl transition-all duration-300 hover:bg-white/50 hover:shadow-lg"
                    >
                      <motion.span
                        animate={{
                          color: hoveredStat === index ? "#146e96" : "#146e96",
                          scale: hoveredStat === index ? 1.1 : 1,
                        }}
                        className="text-2xl font-medium leading-[26.4px] tracking-tight text-[#167E6C]"
                        style={{
                          color: "#146e96",
                        }}
                      >
                        {stat.value}
                      </motion.span>
                      <motion.p 
                        animate={{
                          opacity: hoveredStat === index ? 1 : 0.7,
                        }}
                        className="text-xs leading-[13.2px] text-[#7C7F88] m-0 whitespace-pre-line"
                      >
                        {stat.description}
                      </motion.p>
                      
                      {/* Micro-interaction indicator */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: hoveredStat === index ? "100%" : "0%",
                        }}
                        className="h-0.5 bg-gradient-to-r from-[#146e96] to-[#1e7ba8] rounded-full"
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
