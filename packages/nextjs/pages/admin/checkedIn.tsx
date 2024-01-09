import { useEffect, useState } from "react";
import { fetchBalance } from "@wagmi/core";
import { useInterval } from "usehooks-ts";
import { CheckedIn } from "~~/components/game-wallet/CheckedIn";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import type { NextPageWithLayout } from "~~/pages/_app";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

type LeaderboardData = {
  address: string;
  balance: bigint;
  salt: bigint;
};

const CheckedInPage: NextPageWithLayout = () => {
  const [loadingCheckedIn, setLoadingCheckedIn] = useState(true);
  const [checkedInAddresses, setCheckedInAddresses] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: saltContract } = useScaffoldContract({
    contractName: "SaltToken",
  });

  const fetchPeopleCheckedIn = async () => {
    try {
      const response = await fetch("/api/admin/checked-in", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCheckedInAddresses(data);
      } else {
        notification.error(data.error);
      }
    } catch (e) {
      console.log("Error fetching checked in addresses", e);
    } finally {
      setLoadingCheckedIn(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPeopleCheckedIn();
    })();
  }, []);

  useInterval(async () => {
    await fetchPeopleCheckedIn();
  }, scaffoldConfig.pollingInterval);

  useEffect(() => {
    const updateLeaderboard = async () => {
      if (!loadingCheckedIn && saltContract && checkedInAddresses && checkedInAddresses.length > 0) {
        let leaderboardData: LeaderboardData[] = [];
        for (let i = 0; i < checkedInAddresses.length; i++) {
          const address = checkedInAddresses[i];
          const salt = await saltContract.read.balanceOf([address]);
          const balanceResult = await fetchBalance({ address });
          const balance = balanceResult.value;
          leaderboardData.push({ address, balance, salt });
        }
        leaderboardData = leaderboardData.sort((a, b) => (b.address > a.address ? 1 : -1));
        setLeaderboard(leaderboardData);
        setIsLoading(false);
      }
    };
    updateLeaderboard();
  }, [loadingCheckedIn, checkedInAddresses, saltContract]);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="max-w-96 p-8">
        <h1 className="text-4xl font-bold">People Checked-in</h1>
      </div>
      <div className="flex flex-col pt-2 gap-[100px] md:flex-row">
        <CheckedIn addresses={leaderboard} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CheckedInPage;
