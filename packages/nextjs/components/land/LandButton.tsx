import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { TTokenInfo } from "~~/types/wallet";

interface LandButtonProps {
  id: number;
  contractMapData: any;
  canHarvestAll: any;
  rottenAll: any;
  tokenContracts: { [key: string]: any };
  tokensByAddress: { [key: string]: TTokenInfo };
}

export const LandButton = ({
  id,
  contractMapData,
  canHarvestAll,
  rottenAll,
  tokenContracts,
  tokensByAddress,
}: LandButtonProps) => {
  const { address } = useAccount();

  const [loadingApproval, setLoadingApproval] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");

  const tokens = scaffoldConfig.tokens;

  // write to land contract a claim
  const { writeAsync: claimLand } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "claim",
    args: [BigInt(id)],
  });

  const isOwnedByMe = contractMapData && contractMapData[id] && contractMapData[id].owner === address;
  const isAvailable =
    contractMapData &&
    contractMapData[id] &&
    contractMapData[id].owner === "0x0000000000000000000000000000000000000000";

  const sprite = contractMapData && contractMapData[id] && contractMapData[id].sprite;
  const tokenAddress = contractMapData && contractMapData[id] && contractMapData[id].tokenAddress;
  const tokenFromLand = tokensByAddress[tokenAddress];

  const landButtons = [];

  const { writeAsync: plant } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "farm",
    args: [BigInt(id), tokenContracts[selectedToken]?.address],
  });

  const { writeAsync: harvestStrawberries } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "harvest",
    args: [BigInt(id)],
  });

  const { writeAsync: plantAgainStrawberries } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "farmAgain",
    args: [BigInt(id)],
  });

  if (isOwnedByMe) {
    if (sprite === 1) {
      landButtons.push(
        <div className="flex flex-col items-center mb-2">
          <div className="text-lg font-bold mb-2">Land #{id}</div>
          <div>
            <select
              className="p-2 border-2 border-gray-300 rounded-2xl mr-4"
              disabled={loadingApproval}
              value={selectedToken}
              onChange={e => setSelectedToken(e.target.value)}
            >
              <option>Choose a token</option>
              {tokens.map((token: TTokenInfo) => {
                return (
                  <option key={token.name} value={token.name}>
                    {token.emoji} {token.name}
                  </option>
                );
              })}
            </select>
            {selectedToken && (
              <button
                className="btn btn-secondary"
                disabled={loadingApproval}
                onClick={() => {
                  setLoadingApproval(true);
                  plant();
                  setTimeout(() => {
                    setLoadingApproval(false);
                  }, 5000);
                }}
              >
                {tokens.find((token: TTokenInfo) => token.name === selectedToken)?.emoji} Plant {selectedToken}
              </button>
            )}
          </div>
        </div>,
      );
    } else if (sprite === 2) {
      if (rottenAll && rottenAll[id]) {
        landButtons.push(
          <div className="flex flex-col items-center mb-2">
            <div className="text-lg font-bold mb-2">Land #{id}</div>
            <div>
              <button
                className="btn btn-secondary"
                disabled={loadingApproval}
                onClick={() => {
                  setLoadingApproval(true);
                  plantAgainStrawberries();
                  setTimeout(() => {
                    setLoadingApproval(false);
                  }, 5000);
                }}
              >
                {tokenFromLand?.emoji} Rotten! Plant again
              </button>
            </div>
          </div>,
        );
      } else if (canHarvestAll && !canHarvestAll[id]) {
        landButtons.push(
          <div className="flex flex-col items-center mb-2">
            <div className="text-lg font-bold mb-2">Land #{id}</div>
            <div>
              <button className="btn btn-secondary" disabled={true}>
                👨‍🌾 Waiting for harvest
              </button>
            </div>
          </div>,
        );
      } else {
        landButtons.push(
          <div className="flex flex-col items-center mb-2">
            <div className="text-lg font-bold mb-2">Land #{id}</div>
            <div>
              <button
                className="btn btn-secondary"
                disabled={loadingApproval}
                onClick={() => {
                  setLoadingApproval(true);
                  harvestStrawberries();
                  setTimeout(() => {
                    setLoadingApproval(false);
                  }, 5000);
                }}
              >
                {tokenFromLand?.emoji} Harvest {tokenFromLand?.name}
              </button>
            </div>
          </div>,
        );
      }
    }
  } else {
    if (isAvailable) {
      landButtons.push(
        <div className="flex flex-col items-center mb-2">
          <div className="text-lg font-bold mb-2">Land #{id}</div>
          <div>
            <button
              className="btn btn-secondary"
              disabled={loadingApproval}
              onClick={() => {
                setLoadingApproval(true);
                claimLand();
                setTimeout(() => {
                  setLoadingApproval(false);
                }, 5000);
              }}
            >
              📑 Claim Land for 💸 10 Credits
            </button>
          </div>
        </div>,
      );
    } else {
      landButtons.push(
        <div className="flex flex-col items-center mb-2">
          <div className="text-lg font-bold mb-2">Land #{id}</div>
          <div>
            <button className="btn btn-secondary" disabled={true}>
              🏡 Owned
            </button>
          </div>
        </div>,
      );
    }
  }

  return (
    <>
      <div className="flex gap-1 justify-center w-full mb-2 mt-4">{landButtons}</div>
    </>
  );
};
