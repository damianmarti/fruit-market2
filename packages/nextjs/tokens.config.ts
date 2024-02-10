import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "AppleToken",
    name: "Apple",
    emoji: "🍎",
    initAssetAmount: "834.1666666666667",
    initCreditAmount: "1000",
  },
  {
    contractName: "PeachToken",
    name: "Peach",
    emoji: "🍑",
    initAssetAmount: "500.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "WatermelonToken",
    name: "Watermelon",
    emoji: "🍉",
    initAssetAmount: "400.4",
    initCreditAmount: "1000",
  },
  {
    contractName: "GrapeToken",
    name: "Grape",
    emoji: "🍇",
    initAssetAmount: "770",
    initCreditAmount: "1000",
  },
  {
    contractName: "LemonToken",
    name: "Lemon",
    emoji: "🍋",
    initAssetAmount: "1251.25",
    initCreditAmount: "1000",
  },
  {
    contractName: "PineappleToken",
    name: "Pineapple",
    emoji: "🍍",
    initAssetAmount: "333.6666666666667",
    initCreditAmount: "1000",
  },
  {
    contractName: "ApricotToken",
    name: "Apricot",
    emoji: "🍊",
    initAssetAmount: "454.99999999999994",
    initCreditAmount: "1000",
  },
  {
    contractName: "StrawberryToken",
    name: "Strawberry",
    emoji: "🍓",
    initAssetAmount: "333.6666666666667",
    initCreditAmount: "1000",
  },
  {
    contractName: "BananaToken",
    name: "Banana",
    emoji: "🍌",
    initAssetAmount: "715",
    initCreditAmount: "1000",
  },
  {
    contractName: "CherryToken",
    name: "Cherry",
    emoji: "🍒",
    initAssetAmount: "1112.2222222222222",
    initCreditAmount: "1000",
  },
  {
    contractName: "MangoToken",
    name: "Mango",
    emoji: "🥭",
    initAssetAmount: "286",
    initCreditAmount: "1000",
  },
  {
    contractName: "OrangeToken",
    name: "Orange",
    emoji: "🍊",
    initAssetAmount: "357.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "CoconutToken",
    name: "Coconut",
    emoji: "🥥",
    initAssetAmount: "250.25",
    initCreditAmount: "1000",
  },
  {
    contractName: "AvocadoToken",
    name: "Avocado",
    emoji: "🥑",
    initAssetAmount: "500.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "BlueberryToken",
    name: "Blueberry",
    emoji: "🍇",
    initAssetAmount: "667.3333333333334",
    initCreditAmount: "1000",
  },
  {
    contractName: "PapayaToken",
    name: "Papaya",
    emoji: "🥭",
    initAssetAmount: "303.33333333333337",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
