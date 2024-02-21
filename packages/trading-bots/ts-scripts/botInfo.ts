import {
  createPublicClient,
  http,
  formatEther,
  createWalletClient,
} from "viem";
import scaffoldConfig from "../../nextjs/scaffold.config";
import dotenv from "dotenv";
dotenv.config();
import { contracts } from "../../nextjs/utils/scaffold-eth/contract";
import fs from "fs";
import botConfig from "../config";
import { privateKeyToAccount } from "viem/accounts";

const targetNetwork = scaffoldConfig.targetNetwork;

if (!contracts) {
  throw new Error("No contracts found");
}

const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
const account = privateKeyToAccount(`0x${deployerPk}`);

//const contractsCurrentNetwork = contracts[targetNetwork.id];

//console.log("contractsCurrentNetwork", contractsCurrentNetwork);

// Modified to read the wallets.json file and access the addresses array
const walletsData = JSON.parse(fs.readFileSync("./wallets.json").toString());
const wallets = walletsData.addresses; // Access the addresses array
//console.log("wallets", wallets);

async function main() {
  const publicClient = createPublicClient({
    chain: targetNetwork,
    transport: http(process.env.RPC),
  });
  const walletClient = createWalletClient({
    account,
    chain: targetNetwork,
    transport: http(process.env.RPC),
  });

  // Iterate over the wallets array directly
  for (const wallet of wallets) {
    // Validate the wallet address before proceeding
    if (!wallet.address) {
      console.error(
        `Invalid address for wallet: ${wallet.name || "Unnamed wallet"}`
      );
      continue; // Skip to the next wallet if the current one has an invalid address
    }

    try {
      //console.log("getting address balance for", wallet);
      const balance = await publicClient.getBalance({
        address: wallet.address,
      });
      const balanceFormatted = formatEther(balance);
      console.log(
        `${wallet.name} bot:`,
        balanceFormatted,
        "ETH @",
        wallet.address
      );
      if (balance < botConfig.networkTokenRefillAt) {
        console.log(
          "Wallet balance is below ",
          formatEther(botConfig.networkTokenRefillAt),
          " sending ",
          formatEther(botConfig.networkTokenRefill),
          "..."
        );
        await walletClient.sendTransaction({
          to: wallet.address,
          value: botConfig.networkTokenRefill,
        });
      }
      //}
      //check if they are funded enough..........................
    } catch (error) {
      // Type assertion added here
      const errorMessage = (error as Error).message;
      console.error(`Error fetching balance for ${wallet.name}:`, errorMessage);
    }
  }
}

main();
