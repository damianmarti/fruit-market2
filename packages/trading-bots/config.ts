import { parseEther } from "viem";

const botConfig = {
  creditTokenName: "SaltToken",
  tokensToSend: parseEther("10"),
  networkTokensToSend: parseEther("0.001"),
  confirmations: 1,
  tradeFrequency: 15_000,
};

export default botConfig;
