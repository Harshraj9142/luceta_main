import { PortfolioNavbar } from "@/components/PortfolioNavbar"
import { NFTMarketplace } from "@/components/NFTMarketplace"
import { Footer } from "@/components/Footer"

export default function MarketplacePage() {
  return (
    <>
      <PortfolioNavbar />
      <div className="pt-20">
        <NFTMarketplace />
      </div>
      <Footer />
    </>
  )
}