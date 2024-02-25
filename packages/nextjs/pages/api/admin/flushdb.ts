import scaffoldConfig from "../../../scaffold.config";
import { Contract, ContractName, contracts } from "../../../utils/scaffold-eth/contract";
import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyMessage } from "viem";
import { ByteArray, Hex } from "viem";
import { createPublicClient, getContract, http } from "viem";

type ReqBody = {
  signature: Hex | ByteArray;
  signerAddress: `0x${string}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { signature, signerAddress }: ReqBody = req.body;

  if (!signature || !signerAddress) {
    res.status(400).json({ error: "Missing required parameters." });
    return;
  }

  let valid = false;
  try {
    const message = JSON.stringify({ action: "flushdb", address: signerAddress });
    valid = await verifyMessage({
      address: signerAddress,
      message: message,
      signature,
    });
  } catch (error) {
    res.status(400).json({ error: "Error recovering the signature" });
    return;
  }

  if (!valid) {
    res.status(403).json({ error: "The signature is not valid" });
    return;
  }

  const publicClient = createPublicClient({
    chain: scaffoldConfig.targetNetwork,
    transport: http(),
  });

  const deployedContract = contracts?.[scaffoldConfig.targetNetwork.id]?.["SaltToken"] as Contract<ContractName>;

  const saltContract = getContract({
    address: deployedContract.address,
    abi: deployedContract.abi,
    publicClient,
  });

  const minterRole = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  const hasRole = await saltContract.read.hasRole([minterRole, signerAddress]);

  if (!hasRole) {
    res.status(403).json({ error: "The signer does not have the required role" });
    return;
  }

  kv.flushdb();

  res.status(200).json({ message: "DB Flushed!" });
}
