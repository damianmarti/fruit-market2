import { useState } from "react";
import { LandButton } from "./LandButton";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TTokenInfo } from "~~/types/wallet";

/**
 * Site footer
 */
export const LandOwnership = ({
  tokenContracts,
  tokensByAddress,
}: {
  tokenContracts: { [key: string]: any };
  tokensByAddress: { [key: string]: TTokenInfo };
}) => {
  const { address } = useAccount();

  const { data: landContractInfo } = useDeployedContractInfo("Land");

  const { writeAsync: approveCredits } = useScaffoldContractWrite({
    contractName: "SaltToken",
    functionName: "approve",
    args: [landContractInfo?.address, parseEther("999999999")],
  });

  const { data: approvedCredits } = useScaffoldContractRead({
    contractName: "SaltToken",
    functionName: "allowance",
    args: [address, landContractInfo?.address],
  });

  const [loadingApproval, setLoadingApproval] = useState(false);

  const isApproved = approvedCredits && approvedCredits > parseEther("10");

  const { data: contractMapData } = useScaffoldContractRead({
    contractName: "Land",
    functionName: "getMap",
  });

  const { data: canHarvestAll } = useScaffoldContractRead({
    contractName: "Land",
    functionName: "canHarvestAll",
  });

  const { data: rottenAll } = useScaffoldContractRead({
    contractName: "Land",
    functionName: "rottenAll",
  });

  const allLandButtons = [];
  for (let i = 0; i < 10; i++) {
    allLandButtons.push(
      <LandButton
        id={i}
        contractMapData={contractMapData}
        canHarvestAll={canHarvestAll}
        rottenAll={rottenAll}
        tokenContracts={tokenContracts}
        tokensByAddress={tokensByAddress}
      />,
    );
  }

  return (
    <>
      <div className="flex gap-1 justify-center w-full mb-2 mt-4">
        {!isApproved ? (
          <button
            className="btn btn-secondary"
            disabled={loadingApproval}
            onClick={() => {
              setLoadingApproval(true);
              approveCredits();
              setTimeout(() => {
                setLoadingApproval(false);
              }, 5000);
            }}
          >
            📑 Apply for land ownersip ({approvedCredits?.toString()})
          </button>
        ) : (
          <div>{allLandButtons}</div>
        )}
      </div>
    </>
  );
};
