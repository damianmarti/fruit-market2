import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let aliases = await kv.hgetall("users:alias");
  if (!aliases) {
    aliases = {};
  }
  res.status(200).json(aliases);
}
