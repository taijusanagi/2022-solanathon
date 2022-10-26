import { ChakraProvider } from "@chakra-ui/react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ThirdwebProvider } from "@thirdweb-dev/react/solana";
import { Network } from "@thirdweb-dev/sdk/solana";
import type { AppProps } from "next/app";

const network: Network = "devnet";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider network={network}>
      <WalletModalProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </WalletModalProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
