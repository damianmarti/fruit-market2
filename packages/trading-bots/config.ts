import { parseEther } from "viem";

const botConfig = {
  creditTokenName: "SaltToken",
  tokensToSend: parseEther("9990"),
  networkTokensToSend: parseEther("0.5"),
  networkTokenRefill: parseEther("0.1"),
  networkTokenRefillAt: parseEther("0.05"),
  confirmations: 1,
  tradeFrequency: 3_000,
};

export default botConfig;
