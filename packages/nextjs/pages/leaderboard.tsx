import React from "react";
import type { NextPageWithLayout } from "./_app";
import { Leaderboard } from "~~/components/game-wallet/Leaderboard";

const LeaderboardPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col place-items-center gap-2 text-center m-auto overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="font-medium text-xl">Leaderboard</h1>
      </div>
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
