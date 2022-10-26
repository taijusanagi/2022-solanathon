import { ThirdwebSDK } from "@thirdweb-dev/sdk/solana";
import type { NextApiRequest, NextApiResponse } from "next";

import { getMintMessage } from "../../lib/utils";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, image, userWalletAddress, adminSignature, userSignature } = req.body;

  console.log("input...");
  console.log("userWalletAddress", userWalletAddress);
  console.log("prompt", prompt);
  console.log("image", image);
  console.log("adminSignature", adminSignature);
  console.log("userSignature", userSignature);

  console.log("check conditions...");
  if (!process.env.NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT contract address invalid");
  }

  if (!process.env.PRIVATE_KEY) {
    throw new Error("Private key invalid");
  }

  console.log("initialize sdk...");
  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const sdk = ThirdwebSDK.fromPrivateKey("devnet", privateKey);
  const message = getMintMessage(prompt, image, userWalletAddress, adminSignature);

  console.log("validate sigature...");
  const isSignatureVerified = sdk.wallet.verifySignature(message, userSignature, userWalletAddress);
  if (!isSignatureVerified) {
    throw new Error("Signature invalid");
  }

  console.log("initialize collection...");
  const program = await sdk.getProgram(nftContractAddress, "nft-collection");

  console.log("create NFT...");
  const metadata = {
    name: "RAKUGAKI",
    description: "This is RAKUGAKI NFT",
    image,
  };
  await program.mintTo(userWalletAddress, metadata);

  console.log("nft is minted");
  res.send(metadata);
};

export default handler;
