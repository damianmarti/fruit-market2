import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "CornToken",
    name: "Corn",
    emoji: "🌽",
    initAssetAmount: "500.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "SugarToken",
    name: "Sugar",
    emoji: "🍚",
    initAssetAmount: "667.3333333333334",
    initCreditAmount: "1000",
  },
  {
    contractName: "YeastToken",
    name: "Yeast",
    emoji: "🍞",
    initAssetAmount: "1251.25",
    initCreditAmount: "1000",
  },
  {
    contractName: "BarrelsToken",
    name: "Barrels",
    emoji: "🛢️",
    initAssetAmount: "50.05",
    initCreditAmount: "1000",
  },
  {
    contractName: "WaterToken",
    name: "Water",
    emoji: "🚰",
    initAssetAmount: "10010",
    initCreditAmount: "1000",
  },
  {
    contractName: "FruitToken",
    name: "Fruit",
    emoji: "🍒",
    initAssetAmount: "100.1",
    initCreditAmount: "1000",
  },
  {
    contractName: "FirewoodToken",
    name: "Firewood",
    emoji: "🔥",
    initAssetAmount: "66.73333333333333",
    initCreditAmount: "1000",
  },
  {
    contractName: "MoonshineToken",
    name: "Moonshine",
    emoji: "🥃",
    initAssetAmount: "10.01",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
