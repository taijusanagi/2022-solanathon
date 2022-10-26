export const getMintMessage = (prompt: string, image: string, userWalletAddress: string, adminSignature: string) => {
  return `Create Rakugaki NFT
  
  prompt: ${prompt}

  image: ${image}

  userWalletAddress: ${userWalletAddress}
  
  adminSignature: ${adminSignature}
  `;
};

export const getPromtToImageMessage = (prompt: string, image: string) => {
  return `${prompt}${image}`;
};
