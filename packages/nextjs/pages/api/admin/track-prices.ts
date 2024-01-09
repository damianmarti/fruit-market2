import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, getContract, http, parseEther } from "viem";
import scaffoldConfig from "~~/scaffold.config";
import { etherFormatted } from "~~/utils/etherFormatted";
import { Contract, ContractName, contracts } from "~~/utils/scaffold-eth/contract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add signature verification or secret key

  const tokens = scaffoldConfig.tokens;
  const tokensData: { [key: string]: { price: string; priceFormatted: string } } = {};

  const publicClient = createPublicClient({
    chain: scaffoldConfig.targetNetwork,
    transport: http(),
  });

  const dexContractsAddresses = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    const contractDexName: ContractName = `BasicDex${token.name}` as ContractName;
    const deployedContract = contracts?.[scaffoldConfig.targetNetwork.id]?.[contractDexName] as Contract<ContractName>;

    dexContractsAddresses.push(deployedContract.address);

    const dexContract = getContract({ address: deployedContract.address, abi: deployedContract.abi, publicClient });

    const price = await dexContract.read.assetOutPrice([parseEther("1")]);

    const priceFormatted = etherFormatted(price);

    tokensData[token.name] = { price: price.toString(), priceFormatted };

    const key = `${token.name}:price`;

    console.log("key", key);

    await kv.zadd(key, { score: Date.now(), member: `${Date.now()}-${priceFormatted}` });
  }

  const addresses = await kv.smembers("users:checkin");

  const deployedContract = contracts?.[scaffoldConfig.targetNetwork.id]?.["CreditNwCalc"] as Contract<ContractName>;

  const creditNwCalcContract = getContract({
    address: deployedContract.address,
    abi: deployedContract.abi,
    publicClient,
  });

  const netWorths = await creditNwCalcContract.read.getNetWorths([addresses, dexContractsAddresses]);

  console.log("netWorths", netWorths);

  const scoreMemberPairs = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const netWorth = netWorths[i];
    const balanceFormatted = etherFormatted(netWorth);
    const balanceNumber = Number(balanceFormatted) * 10000;
    scoreMemberPairs.push({ score: balanceNumber, member: address });
  }

  await kv.del("tokenLeaderboard");

  // @ts-ignore TODO: Fix this
  await kv.zadd("tokenLeaderboard", ...scoreMemberPairs);

  res.status(200).json(tokensData);
}
