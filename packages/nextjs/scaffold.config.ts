import tokensConfig from "./tokens.config";
import { TTokenInfo } from "./types/wallet";
import userAliases from "./userAliases";
import { type Chain } from "viem";
import * as chains from "viem/chains";

const localRpcUrl = process.env.NEXT_PUBLIC_CUSTOM_LOCAL_RPC;

console.log("localRpcUrl", localRpcUrl);

const customChain = {
  id: 31_337,
  name: "cloud",
  network: "cloud",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: [localRpcUrl ? localRpcUrl : "http://127.0.0.1:8545"] },
    public: { http: [localRpcUrl ? localRpcUrl : "http://127.0.0.1:8545"] },
  },
} as const satisfies Chain;

export type ScaffoldConfig = {
  targetNetwork: chains.Chain;
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
  saltToken: TTokenInfo;
  tokens: TTokenInfo[];
  tokenLeaderboardPollingInterval: number;
  showChart: boolean;
  userAliases: string[];
  burnerWallet: {
    signConfirmation: boolean;
  };
};

const scaffoldConfig = {
  // The network where your DApp lives in
  targetNetwork: customChain, /// you need to set this to chains.hardhat sorry !

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect on the local network
  pollingInterval: 5000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,

  saltToken: { contractName: "SaltToken", name: "Salt", emoji: "💸" },
  tokens: tokensConfig,
  tokenLeaderboardPollingInterval: 60000,
  showChart: false,
  userAliases: userAliases,

  // Burner Wallet configuration
  burnerWallet: {
    signConfirmation: false,
  },
} satisfies ScaffoldConfig;

export default scaffoldConfig;
