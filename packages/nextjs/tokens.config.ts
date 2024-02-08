import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  { contractName: "AvocadoToken", name: "Avocado", emoji: "🥑", initAssetAmount: "1000", initCreditAmount: "1000" },
  { contractName: "BananaToken", name: "Banana", emoji: "🍌", initAssetAmount: "1000", initCreditAmount: "1000" },
  { contractName: "TomatoToken", name: "Tomato", emoji: "🍅", initAssetAmount: "1000", initCreditAmount: "1000" },
  {
    contractName: "StrawberryToken",
    name: "Strawberry",
    emoji: "🍓",
    initAssetAmount: "1000",
    initCreditAmount: "1000",
  },
  { contractName: "AppleToken", name: "Apple", emoji: "🍏", initAssetAmount: "1000", initCreditAmount: "1000" },
  { contractName: "LemonToken", name: "Lemon", emoji: "🍋", initAssetAmount: "1000", initCreditAmount: "1000" },
] satisfies TokensConfig;

export default tokensConfig;
