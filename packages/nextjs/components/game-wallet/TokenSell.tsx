import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useInterval } from "usehooks-ts";
import { formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import CashIcon from "~~/icons/CashIcon";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type TokenName = "Avocado" | "Banana" | "Tomato";

export const TokenSell = ({
  token,
  defaultAmountIn,
  defaultAmountOut,
  close,
  balanceToken,
}: {
  token: ContractName;
  defaultAmountIn: string;
  defaultAmountOut: string;
  close?: () => void;
  balanceToken: bigint;
}) => {
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState<string>(defaultAmountIn);
  const [amountOut, setAmountOut] = useState<string>(defaultAmountOut);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);

  const tokenName: TokenName = token.replace("Token", "") as TokenName;
  const tokenEmoji = scaffoldConfig.tokens.find(t => token === t.contractName)?.emoji;

  const dexContractName: ContractName = `BasicDex${tokenName}` as ContractName;

  const { data: dexContract, isLoading: isLoadingDex } = useScaffoldContract({ contractName: dexContractName });

  const { data: saltAllowance } = useScaffoldContractRead({
    contractName: "SaltToken",
    functionName: "allowance",
    args: [address, dexContract?.address],
  });

  console.log("saltAllowance", saltAllowance?.toString());

  const { data: tokenAllowance } = useScaffoldContractRead({
    contractName: token,
    functionName: "allowance",
    args: [address, dexContract?.address],
  });

  console.log("tokenAllowance", token, tokenAllowance?.toString());

  const slippage = 95n / 100n;

  const { writeAsync: assetToCredit, isMining: isMiningAssetToCredit } = useScaffoldContractWrite({
    contractName: dexContractName,
    functionName: "assetToCredit",
    args: [parseEther(amountIn || "0"), parseEther(amountOut || "0") * slippage],
    gas: 1000000n,
  });

  const { writeAsync: approveToken, isMining: isMiningApproveToken } = useScaffoldContractWrite({
    contractName: token,
    functionName: "approve",
    args: [dexContract?.address, parseEther("100000")],
  });

  const isLoading = isLoadingDex || isMiningAssetToCredit || isMiningApproveToken;
  const disabled = isLoading || amountIn === "" || amountOut === "" || parseEther(amountIn || "0") > balanceToken;

  const changeAmountIn = async (amount: string) => {
    const parsedAmount = parseEther(amount || "0");

    if (dexContract && parsedAmount > 0n) {
      let price = 0n;
      price = await dexContract.read.assetInPrice([parsedAmount]);

      setAmountIn(amount);
      setAmountOut(formatUnits(price, 18));
    } else {
      setAmountIn("");
      setAmountOut("");
    }
    setPriceLoading(false);
  };

  const updateAmountOut = async () => {
    const currentAmountIn = parseEther(amountIn || "0");

    if (dexContract && amountIn !== "") {
      let price = 0n;
      price = await dexContract.read.assetInPrice([currentAmountIn]);

      setAmountOut(formatUnits(price, 18));
    }
  };

  const handleSend = async () => {
    const parsedAmountOut = parseEther(amountOut || "0");
    if (parsedAmountOut <= 0n) {
      notification.error("Please enter an amount");
      return;
    }

    const parsedAmountIn = parseEther(amountIn || "0");
    if (parsedAmountIn <= 0n) {
      notification.error("Please enter an amount");
      return;
    }

    try {
      console.log("tokenAllowance: ", tokenAllowance?.toString());
      if (tokenAllowance !== undefined && tokenAllowance < parsedAmountIn) {
        await approveToken();
      }
      await assetToCredit();

      setAmountIn("");
      setAmountOut("");
      if (close) {
        close();
      }
    } catch (e) {
      console.error("Error swapping tokens: ", e);
      notification.error("Error swapping tokens");
    }
  };

  const debouncedChangeAmountIn = useDebouncedCallback(async v => {
    if (v.length < 21) {
      await changeAmountIn(v);
    }
  }, 1000);

  useInterval(async () => {
    await updateAmountOut();
  }, scaffoldConfig.pollingInterval);

  return (
    <div className="flex flex-col gap-2 m-8">
      <div className="flex justify-center text-2xl">Sell {tokenEmoji}</div>
      <div className="flex justify-center">
        <div className="w-[200px]">
          <InputBase
            value={amountIn}
            onChange={v => {
              debouncedChangeAmountIn(v);
              setAmountIn(v);
              setPriceLoading(true);
            }}
            placeholder="0"
          />
        </div>
        <button
          className="ml-1 mt-3 text-primary"
          onClick={() => {
            if (balanceToken) {
              changeAmountIn(formatUnits(balanceToken, 18));
            } else {
              changeAmountIn("0");
            }
          }}
        >
          Max
        </button>
      </div>
      <div className="flex justify-center">
        <div className="w-[200px]">
          <CashIcon width="53" height="35" className="inline" />
          {priceLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <span className={`${parseEther(amountIn || "0") > balanceToken ? "text-red-600" : ""}`}>
              {amountOut.slice(0, amountOut.indexOf(".") + 5)}
            </span>
          )}
        </div>
      </div>
      <div>
        <button
          onClick={handleSend}
          className={`btn btn-primary w-full mt-4 ${isLoading ? "loading" : ""}`}
          disabled={disabled}
        >
          <PaperAirplaneIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          Sell
        </button>
      </div>
    </div>
  );
};
