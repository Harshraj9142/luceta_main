"use client"

import { useCallback, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2Icon, PhoneIcon, PhoneOffIcon, PhoneCallIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Orb } from "@/components/ui/orb"
import { ShimmeringText } from "@/components/ui/shimmering-text"

const AGENT_CONFIG = {
  agentId: "agent_1901kdg5gq7rf1a9972s2sxpwjys",
  name: "Luceta AI Assistant",
  description: "Tap to start voice chat",
}

type AgentState = "disconnected" | "connecting" | "connected" | "disconnecting" | null

export function AIVoiceAgent() {
  const [agentState, setAgentState] = useState<AgentState>("disconnected")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCallingPhone, setIsCallingPhone] = useState(false)

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("Error:", error)
      setAgentState("disconnected")
    },
  })

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null)
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await conversation.startSession({
        agentId: AGENT_CONFIG.agentId,
        // @ts-ignore
        connectionType: "webrtc",
        onStatusChange: (status: any) => setAgentState(status.status),
      })
    } catch (error) {
      console.error("Error starting conversation:", error)
      setAgentState("disconnected")
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions.")
      }
    }
  }, [conversation])

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting")
      startConversation()
    } else if (agentState === "connected") {
      conversation.endSession()
      setAgentState("disconnected")
    }
  }, [agentState, conversation, startConversation])

  // Outbound phone call
  const handlePhoneCall = async () => {
    setIsCallingPhone(true)
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
        method: "POST",
        headers: {
          "xi-api-key": "sk_75b1dc86c9a595880cb50aec31e8baba18d8b8fa080296aa",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_1901kdg5gq7rf1a9972s2sxpwjys",
          agent_phone_number_id: "phnum_4501kdh07x74eb5rpmetsj02v2bd",
          to_number: "+916204299438",
        }),
      })

      if (response.ok) {
        alert("📞 Call initiated! Check your phone.")
      } else {
        const error = await response.text()
        alert(`Call failed: ${error}`)
      }
    } catch (error) {
      console.error("Phone call error:", error)
      alert("Failed to initiate call")
    } finally {
      setIsCallingPhone(false)
    }
  }

  const isCallActive = agentState === "connected"
  const isTransitioning = agentState === "connecting" || agentState === "disconnecting"

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        {/* Orb */}
        <div className="relative size-32">
          <div className="relative h-full w-full rounded-full p-1 bg-gray-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
            <div className="h-full w-full overflow-hidden rounded-full bg-white shadow-[inset_0_0_12px_rgba(0,0,0,0.05)]">
              <Orb
                className="h-full w-full"
                volumeMode="manual"
                getInputVolume={getInputVolume}
                getOutputVolume={getOutputVolume}
              />
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{AGENT_CONFIG.name}</h2>
          
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-red-500 text-center text-sm"
              >
                {errorMessage}
              </motion.p>
            ) : agentState === "disconnected" || agentState === null ? (
              <motion.p
                key="disconnected"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-gray-500 text-sm"
              >
                {AGENT_CONFIG.description}
              </motion.p>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    agentState === "connected" && "bg-green-500",
                    isTransitioning && "bg-[#156d95] animate-pulse"
                  )}
                />
                <span className="text-sm capitalize">
                  {isTransitioning ? (
                    <ShimmeringText text={agentState} />
                  ) : (
                    <span className="text-green-600">Connected</span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Web Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCall}
            disabled={isTransitioning}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all",
              isCallActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#156d95] hover:bg-[#156d95]/90 text-white",
              isTransitioning && "opacity-50 cursor-not-allowed"
            )}
          >
            <AnimatePresence mode="wait">
              {isTransitioning ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                >
                  <Loader2Icon className="h-5 w-5" />
                </motion.div>
              ) : isCallActive ? (
                <motion.div
                  key="end"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneOffIcon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneIcon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Phone Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePhoneCall}
            disabled={isCallingPhone}
            className={cn(
              "h-12 px-4 rounded-full flex items-center gap-2 transition-all",
              "bg-green-500 hover:bg-green-600 text-white",
              isCallingPhone && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCallingPhone ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <PhoneCallIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">Call Me</span>
          </motion.button>
        </div>

        <p className="text-xs text-gray-400 text-center max-w-[200px]">
          Powered by ElevenLabs AI
        </p>
      </div>
    </div>
  )
}
