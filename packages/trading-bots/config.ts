import { parseEther } from "viem";

const botConfig = {
  creditTokenName: "SaltToken",
  tokensToSend: parseEther("9990"),
  networkTokensToSend: parseEther("0.5"),
  confirmations: 1,
  tradeFrequency: 3_000,
};

export default botConfig;
