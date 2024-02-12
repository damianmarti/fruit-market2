import {
  createWalletClient,
  createPublicClient,
  getContract,
  http,
  parseEther,
  formatEther,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import scaffoldConfig from "../../nextjs/scaffold.config";
import dotenv from "dotenv";
dotenv.config();
import { contracts } from "../../nextjs/utils/scaffold-eth/contract";
import fs from "fs";
import botConfig from "../config";

if (process.argv.length != 3) {
  throw new Error("No asset name");
}

// capitalize first letter of asset name
const name = process.argv[2].charAt(0).toUpperCase() + process.argv[2].slice(1);

const privateKey = process.env[name.toUpperCase()];
//const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
//const account = privateKeyToAccount(`0x${deployerPk}`);
const account = privateKeyToAccount(`0x${privateKey?.slice(2)}`);
console.log(account);
const jsonFilepath = "./data.json";

const targetNetwork = scaffoldConfig.targetNetwork;

if (!contracts) {
  throw new Error("No contracts found");
}

const contractsCurrentNetwork = contracts[targetNetwork.id];

// read json file and get corresponding price target
//
/**
 * json file format
 * {
 *   "apple" : "10",
 *   "avocado" : "4",
 *   "banana" : "8",
 *   "lemon": "15",
 *   "strawberry": "25",
 *   "tomato": "15"
 * }
 *
 */

async function main() {
  const publicClient = createPublicClient({
    chain: targetNetwork,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: targetNetwork,
    transport: http(process.env.RPC),
  });

  const [address] = await walletClient.getAddresses();

  console.log("Trading from:", address);

  // console.log("contracts: ", contracts);

  const dexName = "BasicDex" + name;
  const dexAddress = contractsCurrentNetwork[dexName]["address"];
  const basicDexAbi = contractsCurrentNetwork[dexName]["abi"];

  // how often to make trades (in milliseconds)
  const tradeFrequency = botConfig.tradeFrequency;

  console.log("Beginning trades");

  const assetDexContract = getContract({
    address: getAddress(dexAddress),
    abi: basicDexAbi,
    publicClient,
    walletClient,
  });

  async function makeTx() {
    // returns bigint
    const targetPrice = getTargetPrice(name.toLowerCase());
    // returns bigint
    let currentPrice: bigint;
    try {
      // @ts-ignore
      currentPrice = await assetDexContract.read.assetOutPrice([
        parseEther("1"),
      ]);
    } catch (e) {
      console.log("Something went wrong", e);
      return;
    }
    console.log("targetPrice", formatEther(targetPrice));
    console.log("currentPrice", formatEther(currentPrice));

    if (betweenRange(currentPrice, targetPrice)) {
      console.log("Price is within range");
      return;
    }

    // @ts-ignore
    let totalLiquidity: bigint = await assetDexContract.read.totalLiquidity();
    let tradeSize = totalLiquidity / 50n;
    console.log("tradeSize: ", formatEther(tradeSize));
    if (targetPrice > currentPrice) {
      console.log("Trading Credit to Asset");
      // calc amount out, allow slippage (allow 1%)
      let amountOut = await calcAssetOut(tradeSize);
      console.log("amount out: ", formatEther(amountOut));
      // buy fruit
      try {
        await assetDexContract.write.creditToAsset([tradeSize, amountOut]);
      } catch (e) {
        console.log("Something went wrong", e);
      }
    } else {
      console.log("Trading Asset to Credit");
      tradeSize = tradeSize * parseEther("1") / currentPrice;
      console.log("tradeSize in assets: ", formatEther(tradeSize));
      // calc amount out, allow slippage (allow 1%)
      let amountOut = await calcCreditOut(tradeSize);
      console.log("amount out: ", formatEther(amountOut));
      // sell fruit
      try {
        await assetDexContract.write.assetToCredit([tradeSize, amountOut]);
      } catch (e) {
        console.log("Something went wrong", e);
      }
    }
  }

  function betweenRange(currentPrice: bigint, targetPrice: bigint) {
    let difference = (currentPrice * 100n) / targetPrice;
    return difference > 97n && difference < 103n;
  }

  async function calcAssetOut(amountIn: bigint) {
    let amountOut: bigint = 0n;
    try {
      //@ts-ignore
      amountOut = await assetDexContract.read.creditInPrice([amountIn]);
    } catch {
      console.log("calcSlippage Error");
    }

    return (amountOut * 99n) / 100n;
  }

  async function calcCreditOut(amountIn: bigint) {
    let amountOut: bigint = 0n;
    try {
      //@ts-ignore
      amountOut = await assetDexContract.read.assetInPrice([amountIn]);
    } catch {
      console.log("calcSlippage Error");
    }

    return (amountOut * 99n) / 100n;
  }

  // helper function to parse json file and return target price for given asset
  function getTargetPrice(assetName: string) {
    const data = fs.readFileSync(jsonFilepath, "utf8");

    const jsonData = JSON.parse(data);
    console.log(jsonData);
    return parseEther(jsonData[assetName]);
  }

  function calcPercentageDifference(a: bigint, b: bigint) {
    // if difference > 100 { a > b }
    // if difference < 100 { a < b }
    // if difference == 100 { a == b }
    let difference = (a * 100n) / b;
    // Calculate the multiplier
    return 100n + difference;
  }

  setInterval(makeTx, tradeFrequency);
}

main();
