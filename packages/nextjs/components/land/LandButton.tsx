import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface LandButtonProps {
  id: number;
  contractMapData: any;
  canHarvestAll: any;
}

export const LandButton = ({ id, contractMapData, canHarvestAll }: LandButtonProps) => {
  const { address } = useAccount();

  const [loadingApproval, setLoadingApproval] = useState(false);

  // write to land contract a claim
  const { writeAsync: claimLand } = useScaffoldContractWrite({
    contractName: "Land",
    functionName: "claim",
    args: [BigInt(id)],
  });

  const isOwnedByMe = contractMapData && contractMapData[id] && contractMapData[id].owner === address;

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
      if (canHarvestAll && !canHarvestAll[id]) {
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
  }

  return (
    <>
      <div className="flex gap-1 justify-center w-full mb-2 mt-4">{landButtons}</div>
    </>
  );
};
