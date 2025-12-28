"use client"

import { motion } from "framer-motion"
import { AIVoiceAgent } from "./AIVoiceAgent"
import { Mic, Phone, Bot, Sparkles } from "lucide-react"

export function AIVoiceSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#156d95]/5 to-white">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#156d95]/10 text-[#156d95] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by ElevenLabs
          </div>
          
          <h2 className="text-4xl font-normal text-gray-900 mb-4">
            AI Voice Assistant
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Talk to our AI assistant about Luceta, audio NFTs, or get help with your game audio. 
            Available via browser or phone call.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#156d95]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-[#156d95]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Voice Chat</h3>
                <p className="text-gray-600 text-sm">
                  Click the phone icon to start a real-time voice conversation in your browser.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Phone Call</h3>
                <p className="text-gray-600 text-sm">
                  Click "Call Me" and our AI will call your phone directly via Twilio.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Custom AI Agent</h3>
                <p className="text-gray-600 text-sm">
                  Trained on Luceta docs - ask about pricing, NFT marketplace, or Godot plugin.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>🎯 Hackathon Demo:</strong> This uses ElevenLabs Conversational AI 
                with a custom agent trained for Luceta support.
              </p>
            </div>
          </motion.div>

          {/* Voice Agent Widget */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <AIVoiceAgent />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
