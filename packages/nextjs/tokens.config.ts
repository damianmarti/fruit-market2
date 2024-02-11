import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "HoochToken",
    name: "Hooch",
    emoji: "🥃",
    initAssetAmount: "125.125",
    initCreditAmount: "1000",
  },
  {
    contractName: "BarleyToken",
    name: "Barley",
    emoji: "🌾",
    initAssetAmount: "834.1666666666667",
    initCreditAmount: "1000",
  },
  {
    contractName: "WaterToken",
    name: "Water",
    emoji: "💧",
    initAssetAmount: "2502.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "SugarToken",
    name: "Sugar",
    emoji: "🍚",
    initAssetAmount: "400.4",
    initCreditAmount: "1000",
  },
  {
    contractName: "WoodToken",
    name: "Wood",
    emoji: "🪵",
    initAssetAmount: "286",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
