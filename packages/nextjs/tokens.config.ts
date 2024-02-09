import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "BasicDexCorn",
    name: "Corn",
    emoji: "🌽",
    initAssetAmount: "500.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexSugar",
    name: "Sugar",
    emoji: "🍚",
    initAssetAmount: "667.3333333333334",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexYeast",
    name: "Yeast",
    emoji: "🍞",
    initAssetAmount: "1251.25",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexBarrels",
    name: "Barrels",
    emoji: "🛢️",
    initAssetAmount: "50.05",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexWater",
    name: "Water",
    emoji: "🚰",
    initAssetAmount: "10010",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexFruit",
    name: "Fruit",
    emoji: "🍒",
    initAssetAmount: "100.1",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexFirewood",
    name: "Firewood",
    emoji: "🔥",
    initAssetAmount: "66.73333333333333",
    initCreditAmount: "1000",
  },
  {
    contractName: "BasicDexMoonshine",
    name: "Moonshine",
    emoji: "🥃",
    initAssetAmount: "10.01",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
