"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, TrendingUp, Star } from "lucide-react"
import { MarketplaceCard, sampleMarketplaceItems } from "./MarketplaceCard"

const categories = [
  "All",
  "Combat Audio",
  "Ambient",
  "UI/UX",
  "Vehicle",
  "Fantasy",
  "Sci-Fi",
  "Music",
]

export const MarketplaceSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = sampleMarketplaceItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredItems = sampleMarketplaceItems.filter(item => item.featured)

  return (
    <section id="marketplace" className="w-full py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-[40px] leading-tight font-normal text-[#202020] mb-6 tracking-tight"
            style={{
              fontFamily: "var(--font-figtree), Figtree",
              fontWeight: "400",
            }}
          >
            Audio Marketplace
          </h2>
          <p
            className="text-lg leading-7 text-[#666666] max-w-2xl mx-auto mb-8"
            style={{
              fontFamily: "var(--font-figtree), Figtree",
            }}
          >
            Discover thousands of high-quality audio assets created by the community. From epic soundscapes to subtle UI sounds - find the perfect audio for your game.
          </p>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex-1"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search audio assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#156d95]/20 focus:border-[#156d95] transition-colors"
              />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filters</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-[#156d95] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#156d95]/30 hover:text-[#156d95]"
                }`}
              >
                {category}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Section */}
        {selectedCategory === "All" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-[#156d95]" />
              <h3 className="text-2xl font-semibold text-gray-900">Featured Assets</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, index) => (
                <MarketplaceCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">
              {selectedCategory === "All" ? "All Assets" : selectedCategory}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{filteredItems.length} assets found</span>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <MarketplaceCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-[#156d95]/5 to-[#1e7ba8]/5 rounded-2xl border border-[#156d95]/10"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to share your audio creations?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of audio creators and start selling your game audio assets to developers worldwide. Build locally, sell globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#156d95] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#156d95]/90 transition-colors"
            >
              Start Selling
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-[#156d95] text-[#156d95] px-8 py-3 rounded-xl font-medium hover:bg-[#156d95]/5 transition-colors"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}