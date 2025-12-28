"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Download, Play, Heart } from "lucide-react"

type MarketplaceItem = {
  id: string
  title: string
  description: string
  author: string
  category: string
  rating: number
  downloads: string
  price: string
  image: string
  tags: string[]
  featured?: boolean
}

type MarketplaceCardProps = {
  item: MarketplaceItem
  index?: number
}

export const MarketplaceCard = ({ item, index = 0 }: MarketplaceCardProps) => {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#156d95]/30 transition-all duration-300 overflow-hidden"
    >
      {item.featured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gradient-to-r from-[#156d95] to-[#1e7ba8] text-white text-xs font-medium px-3 py-1 rounded-full">
            Featured
          </span>
        </div>
      )}

      {/* Image/Preview */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Play className="w-5 h-5 text-[#156d95] ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#156d95] bg-[#156d95]/10 px-2 py-1 rounded-full">
            {item.category}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {item.price === "0" ? "Free" : `$${item.price}`}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#156d95] transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Author */}
        <p className="text-xs text-gray-500 mb-4">
          by <span className="font-medium">{item.author}</span>
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{item.downloads}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#156d95] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#156d95]/90 transition-colors"
            >
              {item.price === "0" ? "Download" : "Buy Now"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Sample marketplace items for demo
export const sampleMarketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Epic Battle Soundscape",
    description: "Immersive battle audio with dynamic layers, perfect for action games and combat sequences.",
    author: "AudioForge Studios",
    category: "Combat Audio",
    rating: 4.8,
    downloads: "2.3k",
    price: "29",
    image: "/placeholder.jpg",
    tags: ["Battle", "Dynamic", "Layered", "Action"],
    featured: true,
  },
  {
    id: "2",
    title: "Ambient Forest Pack",
    description: "Peaceful forest ambience with birds, wind, and nature sounds for exploration games.",
    author: "NatureSounds Co",
    category: "Ambient",
    rating: 4.9,
    downloads: "5.1k",
    price: "0",
    image: "/placeholder.jpg",
    tags: ["Nature", "Ambient", "Forest", "Peaceful"],
  },
  {
    id: "3",
    title: "Sci-Fi UI Audio Kit",
    description: "Futuristic interface sounds, beeps, and transitions for sci-fi games and apps.",
    author: "FutureTech Audio",
    category: "UI/UX",
    rating: 4.7,
    downloads: "1.8k",
    price: "19",
    image: "/placeholder.jpg",
    tags: ["Sci-Fi", "UI", "Interface", "Futuristic"],
  },
  {
    id: "4",
    title: "Medieval Town Atmosphere",
    description: "Rich medieval town ambience with market sounds, blacksmith, and period-appropriate audio.",
    author: "HistoricAudio",
    category: "Ambient",
    rating: 4.6,
    downloads: "3.2k",
    price: "24",
    image: "/placeholder.jpg",
    tags: ["Medieval", "Town", "Historic", "Atmosphere"],
    featured: true,
  },
  {
    id: "5",
    title: "Racing Engine Collection",
    description: "High-quality engine sounds for racing games, from sports cars to motorcycles.",
    author: "SpeedSound Pro",
    category: "Vehicle",
    rating: 4.9,
    downloads: "4.7k",
    price: "39",
    image: "/placeholder.jpg",
    tags: ["Racing", "Engine", "Vehicle", "Sports"],
  },
  {
    id: "6",
    title: "Magic Spell Effects",
    description: "Mystical spell casting sounds and magical effects for fantasy RPG games.",
    author: "MysticAudio",
    category: "Fantasy",
    rating: 4.8,
    downloads: "6.3k",
    price: "0",
    image: "/placeholder.jpg",
    tags: ["Magic", "Fantasy", "Spells", "RPG"],
  },
]