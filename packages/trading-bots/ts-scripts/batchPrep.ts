import {
  createWalletClient,
  createPublicClient,
  getAddress,
  maxUint256,
  getContract,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { generateBurner } from "./generateBurnerAccount";
import tokensConfig from "../../nextjs/tokens.config";
import { TDexInfo } from "../types/wallet";
import scaffoldConfig from "../../nextjs/scaffold.config";
import { contracts } from "../../nextjs/utils/scaffold-eth/contract";
import * as fs from "fs";
import dotenv from "dotenv";
import botConfig from "../config";
dotenv.config();

// array of all asset names
const assetNames = tokensConfig.map((token) => token.name);
console.log("Assets: ", assetNames);

const creditTokenName = botConfig.creditTokenName;
const tokensToSend = botConfig.tokensToSend;
const networkTokensToSend = botConfig.networkTokensToSend;
const confirmations = botConfig.confirmations;

// array the token name, address objects will be stored
let addressInfo: TDexInfo[] = [];

// private key of address that will disperse the assetNames
const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
const account = privateKeyToAccount(`0x${deployerPk}`);

const targetNetwork = scaffoldConfig.targetNetwork;

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

  console.log("Wallet address: ", address);

  if (!contracts) {
    throw new Error("No contracts found");
  }

  const contractsCurrentNetwork = contracts[targetNetwork.id];

  // address of credit token and contract instance
  const creditAddress = contractsCurrentNetwork[creditTokenName]["address"];
  console.log("creditAddress: ", creditAddress);

  // loop over assetNames in array
  // create burner wallet, store private key in .env & return wallet info
  for (let i = 0; i < assetNames.length; i++) {
    console.log("-------🚢 " + assetNames[i]);
    // generate burner address
    const burner = await generateBurner(assetNames[i].toUpperCase());

    // push the address, name object to the array
    addressInfo.push({
      address: getAddress(burner.address),
      name: assetNames[i],
    });

    // get token/dex addresses
    const assetName = (assetNames[i] + "Token") as string;
    console.log("assetName", assetName);
    console.log("contracts", contractsCurrentNetwork);
    const assetAddress = contractsCurrentNetwork[assetName]["address"];
    console.log("assetAddress: ", assetAddress);

    const dexName = "BasicDex" + assetNames[i];
    const dexAddress = contractsCurrentNetwork[dexName]["address"];
    console.log("dexAddress: ", dexAddress);

    const assetTokenAbi = contractsCurrentNetwork[assetName]["abi"];

    // send credit token
    const creditContract = getContract({
      address: getAddress(creditAddress),
      abi: assetTokenAbi,
      publicClient,
      walletClient,
    });

    console.log("the credit token is ", creditContract);

    const creditHash = await creditContract.write.transfer([
      burner.address,
      tokensToSend,
    ]);
    const creditTransaction = await publicClient.waitForTransactionReceipt({
      confirmations,
      hash: creditHash,
    });
    console.log(
      "Credit Transfer TX Confirmed",
      creditTransaction.transactionHash
    );

    // send asset token
    const tokenContract = getContract({
      address: getAddress(assetAddress),
      abi: assetTokenAbi,
      publicClient,
      walletClient,
    });
    const tokenHash = await tokenContract.write.transfer([
      burner.address,
      tokensToSend,
    ]);
    const tokenTransaction = await publicClient.waitForTransactionReceipt({
      confirmations,
      hash: tokenHash,
    });
    console.log(
      "Token Transfer TX Confirmed",
      tokenTransaction.transactionHash
    );

    // send network token
    const networkTokenHash = await walletClient.sendTransaction({
      to: getAddress(burner.address),
      value: networkTokensToSend,
    });
    const networkTokenTransaction =
      await publicClient.waitForTransactionReceipt({
        confirmations,
        hash: networkTokenHash,
      });
    console.log(
      "Network Token Transfer TX Confirmed",
      networkTokenTransaction.transactionHash
    );

    const burnerClient = createWalletClient({
      account: burner,
      chain: targetNetwork,
      transport: http(process.env.RPC),
    });

    const creditContractBurner = getContract({
      address: getAddress(creditAddress),
      abi: assetTokenAbi,
      publicClient,
      walletClient: burnerClient,
    });

    const creditApproveHash = await creditContractBurner.write.approve([
      dexAddress,
      maxUint256,
    ]);
    const creditApproveTx = await publicClient.waitForTransactionReceipt({
      confirmations,
      hash: creditApproveHash,
    });
    console.log("Credit Approve Tx Confirmed", creditApproveTx.transactionHash);

    const tokenContractBurner = getContract({
      address: getAddress(assetAddress),
      abi: assetTokenAbi,
      publicClient,
      walletClient: burnerClient,
    });

    const tokenApproveHash = await tokenContractBurner.write.approve([
      dexAddress,
      maxUint256,
    ]);
    const tokenApproveTx = await publicClient.waitForTransactionReceipt({
      confirmations,
      hash: tokenApproveHash,
    });
    console.log("Token Approve Tx Confirmed", tokenApproveTx.transactionHash);
  }

  // write addresses to wallets.json file
  const addresses = { addresses: addressInfo };
  const jsonAddressInfo = JSON.stringify(addresses);

  fs.writeFile("./wallets.json", jsonAddressInfo, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("wallets.json file saved!");
  });
}

main();
