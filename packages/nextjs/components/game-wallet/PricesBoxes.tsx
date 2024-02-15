import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

const PricesBoxes = () => {
  type TokenPrices = {
    [key: string]: string;
  };

  const [prices, setPrices] = useState<TokenPrices>({});
  const [isLoading, setIsLoading] = useState(true);

  const tokens = scaffoldConfig.tokens;
  const saltEmoji = scaffoldConfig.saltToken.emoji;

  const fetchPrices = async () => {
    try {
      const response = await fetch("/api/prices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPrices(data);
      } else {
        notification.error(data.error);
      }
    } catch (e) {
      console.log("Error fetching leaderboard", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPrices();
    })();
  }, []);

  useInterval(async () => {
    await fetchPrices();
  }, scaffoldConfig.tokenLeaderboardPollingInterval);

  return (
    <div className="flex flex-row flex-wrap pt-2 gap-[14px]">
      {tokens.map(token => (
        <div className="flex bg-base-300 rounded-xl w-[132px] p-2 text-center bg-white" key={token.name}>
          <div className="text-2xl">{token.emoji}</div>
          <div className="text-sm">
            <h2 className="font-bold">{token.name}</h2>
            <p className="m-1">{isLoading ? "..." : `${saltEmoji} ${prices[token.name]}`}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricesBoxes;
