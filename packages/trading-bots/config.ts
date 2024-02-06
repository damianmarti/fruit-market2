import { parseEther } from "viem";

const botConfig = {
  creditTokenName: "SaltToken",
  tokensToSend: parseEther("990"),
  networkTokensToSend: parseEther("0.1"),
  confirmations: 1,
  tradeFrequency: 3_000,
};

export default botConfig;
