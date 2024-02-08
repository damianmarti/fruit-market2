import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "BasicDexFlour",
    name: "Flour",
    emoji: "🌾",
    initAssetAmount: "999.8",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexSugar",
    name: "Sugar",
    emoji: "🍚",
    initAssetAmount: "1000.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexEggs",
    name: "Egg",
    emoji: "🥚",
    initAssetAmount: "1000.2",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexCake",
    name: "Cake",
    emoji: "🍰",
    initAssetAmount: "991",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
