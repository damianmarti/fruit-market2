import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface LandButtonProps {
  id: number;
  contractMapData: any;
  canHarvestAll: any;
  rottenAll: any;
}

export const LandButton = ({ id, contractMapData, canHarvestAll, rottenAll }: LandButtonProps) => {
  const { address } = useAccount();

  const [loadingApproval, setLoadingApproval] = useState(false);

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

  const landButtons = [];

  const { writeAsync: plantStrawberries } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "farm",
    args: [BigInt(id)],
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
        <button
          className="btn btn-secondary"
          disabled={loadingApproval}
          onClick={() => {
            setLoadingApproval(true);
            plantStrawberries();
            setTimeout(() => {
              setLoadingApproval(false);
            }, 5000);
          }}
        >
          🍓 Plant Strawberries on Land #{id}
        </button>,
      );
    } else if (sprite === 2) {
      if (rottenAll && rottenAll[id]) {
        landButtons.push(
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
            🥀 Rotten Strawberries! Plant again on Land #{id}
          </button>,
        );
      } else if (canHarvestAll && !canHarvestAll[id]) {
        landButtons.push(
          <button className="btn btn-secondary" disabled={true}>
            👨‍🌾 Waiting for harvest
          </button>,
        );
      } else {
        landButtons.push(
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
            🍓 Harvest Strawberries from Land #{id}
          </button>,
        );
      }
    }
  } else {
    if (isAvailable) {
      landButtons.push(
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
          📑 Claim Land #{id} for 💸 10 Credits
        </button>,
      );
    } else {
      landButtons.push(
        <button className="btn btn-secondary" disabled={true}>
          🏡 Land #{id} is owned
        </button>,
      );
    }
  }

  return (
    <>
      <div className="flex gap-1 justify-center w-full mb-2 mt-4">{landButtons}</div>
    </>
  );
};
