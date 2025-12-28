import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTMarketplaceModule = buildModule("NFTMarketplaceModule", (m) => {
  // Get deployer address for fee recipient
  const feeRecipient = m.getAccount(0);

  // Deploy SongNFT
  const songNFT = m.contract("SongNFT", [
    "Luceta Songs",           // name
    "LSONG",                  // symbol
    "ipfs://",                // baseURI
    10000n,                   // maxSupply
    1000000000000000n,        // mintPrice (0.001 ETH)
  ]);

  // Deploy NFTMarketplace with fee recipient
  const marketplace = m.contract("NFTMarketplace", [feeRecipient]);

  return { songNFT, marketplace };
});

export default NFTMarketplaceModule;
