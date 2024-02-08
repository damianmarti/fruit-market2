import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "Grain",
    name: "Grain",
    emoji: "🌾",
  },
  {
    contractName: "Sugar",
    name: "Sugar",
    emoji: "🍚",
  },
  {
    contractName: "Yeast",
    name: "Yeast",
    emoji: "🍞",
  },
  {
    contractName: "Water",
    name: "Water",
    emoji: "💧",
  },
  {
    contractName: "Pipe",
    name: "Pipe",
    emoji: "🔧",
  },
  {
    contractName: "Firewood",
    name: "Firewood",
    emoji: "🪵",
  },
] satisfies TokensConfig;

export default tokensConfig;
