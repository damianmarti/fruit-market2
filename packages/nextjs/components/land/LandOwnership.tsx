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
  const [page, setPage] = useState(0);

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
  for (let i = 10 * page; i < (10 * page + 10); i++) {
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

  const tabs = [];

  for (let i = 0; i < 10; i++) {
    tabs.push(
      <li className="me-1">
        <a onClick={() => setPage(i)} className="inline-block p-2 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">
          {10 * i} - {10 * i + 9}
        </a>
      </li>,
    );
  }

  return (
    <>
      <div className="w-full mb-2 mt-4 text-center">
        <h2 className="text-2xl font-bold">Lands</h2>
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
          <>
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px justify-center">
                {tabs}
              </ul>
            </div>
            <div className="flex flex-row flex-wrap gap-2">{allLandButtons}</div>
          </>
        )}
      </div>
    </>
  );
};
