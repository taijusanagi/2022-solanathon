import { ThirdwebSDK } from "@thirdweb-dev/sdk/solana";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { clearInterval } from "timers";

import { getPromtToImageMessage } from "../../lib/utils";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt } = req.body;

  console.log("check conditions...");
  if (!process.env.PRIVATE_KEY) {
    throw new Error("Private key invalid");
  }

  if (!process.env.API_KEY) {
    throw new Error("API key invalid");
  }

  console.log("initialize sdk...");
  const privateKey = process.env.PRIVATE_KEY;
  const apiKey = process.env.API_KEY;
  const sdk = ThirdwebSDK.fromPrivateKey("devnet", privateKey);

  const { data } = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version: "a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef",
      input: { prompt },
    },
    {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    }
  );
  const i = 0;
  const image: string = await new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const getResult = await axios.get(data.urls.get, {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      });
      if (getResult.data.status === "succeeded") {
        clearInterval(intervalId);
        resolve(getResult.data.output[0]);
      }
      if (i >= 5) {
        clearInterval(intervalId);
        const error = new Error("timeout");
        reject(error);
      }
      console.log(i);
    }, 5000);
  });

  const message = getPromtToImageMessage(prompt, image);
  const adminSignature = await sdk.wallet.sign(message);
  res.status(200).json({ image, adminSignature });
};

export default handler;
