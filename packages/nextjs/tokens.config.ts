import { TTokenInfo } from "./types/wallet";

export type TokensConfig = TTokenInfo[];

const tokensConfig = [
  {
    contractName: "BassToken",
    name: "Bass",
    emoji: "🐟",
    initAssetAmount: "2002",
    initCreditAmount: "1000",
  },
  {
    contractName: "SharkToken",
    name: "Shark",
    emoji: "🦈",
    initAssetAmount: "143",
    initCreditAmount: "1000",
  },
  {
    contractName: "CrabToken",
    name: "Crab",
    emoji: "🦞",
    initAssetAmount: "435.21739130434787",
    initCreditAmount: "1000",
  },
  {
    contractName: "WhaleToken",
    name: "Whale",
    emoji: "🐋",
    initAssetAmount: "100.1",
    initCreditAmount: "1000",
  },
  {
    contractName: "OctopusToken",
    name: "Octopus",
    emoji: "🐙",
    initAssetAmount: "212.9787234042553",
    initCreditAmount: "1000",
  },
  {
    contractName: "SalmonToken",
    name: "Salmon",
    emoji: "🐬",
    initAssetAmount: "192.5",
    initCreditAmount: "1000",
  },
  {
    contractName: "DolphinToken",
    name: "Dolphin",
    emoji: "🦈",
    initAssetAmount: "158.88888888888889",
    initCreditAmount: "1000",
  },
  {
    contractName: "BluegillToken",
    name: "Bluegill",
    emoji: "🐠",
    initAssetAmount: "556.1111111111111",
    initCreditAmount: "1000",
  },
  {
    contractName: "TroutToken",
    name: "Trout",
    emoji: "🦐",
    initAssetAmount: "322.9032258064516",
    initCreditAmount: "1000",
  },
] satisfies TokensConfig;

export default tokensConfig;
