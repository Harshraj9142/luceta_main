import { NextRequest, NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY!;

// Upload file to Pinata
async function uploadFileToPinata(file: File): Promise<string> {
  // Convert File to Blob with proper handling
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  
  const formData = new FormData();
  formData.append("file", blob, file.name);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  });

  const responseText = await res.text();
  
  if (!res.ok) {
    console.error("Pinata file upload error:", responseText);
    throw new Error(`Upload failed: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  console.log("Pinata response:", data);
  return `ipfs://${data.IpfsHash}`;
}

// Upload JSON metadata to Pinata
async function uploadMetadataToPinata(metadata: object, name: string): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${name}-metadata.json`,
      },
    }),
  });

  const responseText = await res.text();
  
  if (!res.ok) {
    console.error("Pinata metadata error:", responseText);
    throw new Error(`Metadata upload failed: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return `ipfs://${data.IpfsHash}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get("audio") as File | null;
    const coverFile = formData.get("cover") as File | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const artist = formData.get("artist") as string;
    const genre = formData.get("genre") as string;

    if (!audioFile || !name) {
      return NextResponse.json(
        { error: "Audio file and name are required" },
        { status: 400 }
      );
    }

    console.log("=== Starting IPFS Upload ===");
    console.log("Name:", name);
    console.log("Audio:", audioFile.name, "-", audioFile.size, "bytes", "-", audioFile.type);

    // 1. Upload audio to IPFS
    const audioURI = await uploadFileToPinata(audioFile);
    console.log("✓ Audio uploaded:", audioURI);

    // 2. Upload cover image if provided
    let imageURI = "";
    if (coverFile && coverFile.size > 0) {
      console.log("Cover:", coverFile.name, "-", coverFile.size, "bytes");
      imageURI = await uploadFileToPinata(coverFile);
      console.log("✓ Cover uploaded:", imageURI);
    }

    // 3. Create NFT metadata
    const metadata = {
      name,
      description: description || `${name} by ${artist || "Unknown Artist"}`,
      image: imageURI || "https://luceta.audio/music-placeholder.png",
      animation_url: audioURI,
      external_url: "https://luceta.audio",
      attributes: [
        { trait_type: "Artist", value: artist || "Unknown" },
        { trait_type: "Genre", value: genre || "Music" },
        { trait_type: "Type", value: "Audio NFT" },
        { trait_type: "Platform", value: "Luceta" },
      ],
    };

    // 4. Upload metadata to IPFS
    const metadataURI = await uploadMetadataToPinata(metadata, name);
    console.log("✓ Metadata uploaded:", metadataURI);
    console.log("=== Upload Complete ===");

    return NextResponse.json({
      success: true,
      audioURI,
      imageURI,
      metadataURI,
      metadata,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
