import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rawLeaderboard = await kv.zrange("tokenLeaderboard", 0, 50, { rev: true, withScores: true });

    const leaderboard: { address: string; balance: number; alias?: string }[] = [];

    const aliases: { [key: string]: string } | null = await kv.hgetall("users:alias");

    for (let i = 0; i < rawLeaderboard.length; i += 2) {
      const address = rawLeaderboard[i] as string;
      const alias = aliases && aliases[address] ? aliases[address] : address;
      leaderboard.push({ address, alias, balance: (rawLeaderboard[i + 1] as number) / 10000 });
    }

    res.status(200).json(leaderboard);
  }
}
