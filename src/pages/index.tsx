import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSDK } from "@thirdweb-dev/react/solana";
import axios from "axios";
import type { NextPage } from "next";
import { useState } from "react";

import { Modal } from "../components/Modal";
import { getMintMessage } from "../lib/utils";

require("@solana/wallet-adapter-react-ui/styles.css");

const Home: NextPage = () => {
  // hooks
  const { onOpen, onClose, isOpen } = useDisclosure();

  // states
  const [mode, setMode] = useState<"input" | "preview" | "completed">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [adminSignature, setAdminSignature] = useState("");

  const sdk = useSDK();

  const clear = () => {
    setMode("input");
    setPrompt("");
    setImage("");
    setAdminSignature("");
    onClose();
  };

  const onClickStart = () => {
    onOpen();
  };

  const onClickInputModalCreate = async () => {
    setIsLoading(true);
    const {
      data: { image, adminSignature },
    } = await axios.post(`${window.location.origin}/api/generate`, {
      prompt,
    });
    setImage(image);
    setAdminSignature(adminSignature);
    setMode("preview");
    setIsLoading(false);
  };

  const onClickPreviewModalMint = async () => {
    if (!sdk || !image) {
      return;
    }
    const userWalletAddress = sdk.wallet.getAddress();
    if (!userWalletAddress) {
      return;
    }
    setIsLoading(true);
    const message = getMintMessage(prompt, image, userWalletAddress, adminSignature);
    const userSignature = await sdk.wallet.sign(message);
    await axios.post(`${window.location.origin}/api/mint`, {
      prompt,
      image,
      userWalletAddress,
      adminSignature,
      userSignature,
    });
    setMode("completed");
    setIsLoading(false);
  };

  const onClickCompletedModalView = () => {
    clear();
  };

  return (
    <Stack minHeight={"100vh"} direction={"column"}>
      <Box position={"absolute"} right="2" top="2">
        <WalletMultiButton />
      </Box>
      <Center flex={1} maxW="8xl">
        <Box>
          <Button onClick={onClickStart}>Start</Button>
          <Modal isOpen={isOpen} onClose={clear} header="RAKUGAKI">
            <Stack spacing="4">
              {mode === "input" && (
                <FormControl>
                  <FormLabel>Input text</FormLabel>
                  <Input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </FormControl>
              )}
              {mode === "preview" && (
                <Center height="400px">
                  <Image h="400" src={image} alt="image" />
                </Center>
              )}
              {mode === "completed" && (
                <Stack height={"400px"} spacing="8" px="4">
                  <Text align={"center"} fontSize="xl" fontWeight={"bold"}>
                    Congratulations!
                  </Text>
                  <Text align={"center"} fontSize="xs">
                    Your RAKUGAKI is converted to NFT, you can view it in 3rd party NFT viewer.
                  </Text>
                  <Center height="240px">
                    <Image h="240" src={image} alt="image" />
                  </Center>
                </Stack>
              )}
              <HStack spacing="4">
                {mode === "input" && (
                  <Button w="full" onClick={onClickInputModalCreate} isLoading={isLoading}>
                    Create
                  </Button>
                )}
                {mode === "preview" && (
                  <Button w="full" onClick={onClickPreviewModalMint} isLoading={isLoading}>
                    Mint
                  </Button>
                )}
                {mode === "completed" && (
                  <Button w="full" onClick={onClickCompletedModalView}>
                    Close
                  </Button>
                )}
              </HStack>
            </Stack>
          </Modal>
        </Box>
      </Center>
    </Stack>
  );
};

export default Home;
