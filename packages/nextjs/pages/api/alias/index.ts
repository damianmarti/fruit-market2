import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { ByteArray, Hex, verifyMessage } from "viem";
import scaffoldConfig from "~~/scaffold.config";

type ReqBody = {
  signature: Hex | ByteArray;
  signerAddress: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { signature, signerAddress }: ReqBody = req.body;

    if (!signature || !signerAddress) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }

    let valid = false;
    try {
      const message = JSON.stringify({ action: "save-alias", address: signerAddress });
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

    const keyAliasCount = `aliasCount:${signerAddress}`;
    const count: number | null = await kv.get(keyAliasCount);
    if (count && count >= scaffoldConfig.userAliasesMaxTimes) {
      res.status(403).json({ error: "You have reached the max aliases generations" });
      return;
    }

    const aliasData: { [key: string]: string } = {};

    const firstNameIndex = Math.floor(Math.random() * scaffoldConfig.userAliases.firstNames.length);
    const lastNameIndex = Math.floor(Math.random() * scaffoldConfig.userAliases.lastNames.length);

    const firstName = scaffoldConfig.userAliases.firstNames[firstNameIndex];
    const lastName = scaffoldConfig.userAliases.lastNames[lastNameIndex];

    // TODO: check for duplicates

    const alias = `${firstName} ${lastName}`;

    aliasData[signerAddress] = alias;
    await kv.hset("users:alias", aliasData);
    await kv.incr(keyAliasCount);

    res.status(200).json({ message: "Alias saved!", count: count ? count + 1 : 1, alias });
    return;
  } else {
    let aliases = await kv.hgetall("users:alias");
    if (!aliases) {
      aliases = {};
    }
    res.status(200).json(aliases);
  }
}
