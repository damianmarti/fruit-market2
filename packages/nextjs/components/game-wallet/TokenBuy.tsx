import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useInterval } from "usehooks-ts";
import { formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type TokenName = "Avocado" | "Banana" | "Tomato";

export const TokenBuy = ({
  token,
  defaultAmountIn,
  defaultAmountOut,
  close,
  balanceSalt,
}: {
  token: ContractName;
  defaultAmountIn: string;
  defaultAmountOut: string;
  close?: () => void;
  balanceSalt: bigint;
}) => {
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState<string>(defaultAmountIn);
  const [amountOut, setAmountOut] = useState<string>(defaultAmountOut);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);

  const tokenName: TokenName = token.replace("Token", "") as TokenName;
  const tokenEmoji = scaffoldConfig.tokens.find(t => token === t.contractName)?.emoji;
  const saltEmoji = scaffoldConfig.saltToken.emoji;

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

  const slippage = 105n / 100n;

  const { writeAsync: creditToAsset, isMining: isMiningCreditToAsset } = useScaffoldContractWrite({
    contractName: dexContractName,
    functionName: "creditToAsset",
    args: [parseEther(amountIn || "0") * slippage, parseEther(amountOut || "0")],
    // @ts-ignore
    gas: 1000000,
  });

  const { writeAsync: approveSalt, isMining: isMiningApproveSalt } = useScaffoldContractWrite({
    contractName: "SaltToken",
    functionName: "approve",
    args: [dexContract?.address, parseEther("100000")],
  });

  const isLoading = isLoadingDex || isMiningCreditToAsset || isMiningApproveSalt;
  const disabled = isLoading || amountIn === "" || amountOut === "" || parseEther(amountIn || "0") > balanceSalt;

  const updateAmountInWithParsedAmount = async (parsedAmount: bigint) => {
    if (dexContract && parsedAmount > 0n) {
      try {
        const price = await dexContract.read.assetOutPrice([parsedAmount]);

        setAmountIn(formatUnits(price, 18));
      } catch (e: any) {
        console.error("Error getting price: ", e);
        // TODO: make it work importing InsufficientLiquidityError
        // const isInsufficientLiquidityError = e.walk(e => e instanceof InsufficientLiquidityError);
        // console.log("isInsufficientLiquidityError: ", isInsufficientLiquidityError);
        if (e.name === "ContractFunctionExecutionError" && e.message.includes("InsufficientLiquidityError")) {
          console.log("InsufficientLiquidityError");
          notification.error("Insufficient liquidity for this amount. Please try a smaller amount");
        } else {
          notification.error("Error getting price");
        }
        setAmountIn("");
      }
    }
  };

  const changeAmountOut = async (amount: string) => {
    const parsedAmount = parseEther(amount || "0");

    console.log("changeAmountOut", amount, parsedAmount.toString());

    if (dexContract && parsedAmount > 0n) {
      setAmountOut(amount);
      await updateAmountInWithParsedAmount(parsedAmount);
    } else {
      setAmountOut("");
      setAmountIn("");
    }
    setPriceLoading(false);
  };

  const changeAmountIn = async (amount: string) => {
    const parsedAmount = parseEther(amount || "0");

    if (dexContract && parsedAmount > 0n) {
      let price = 0n;
      price = await dexContract.read.creditInPrice([parsedAmount]);

      setAmountIn(amount);
      setAmountOut(formatUnits(price, 18));
    } else {
      setAmountIn("");
      setAmountOut("");
    }
  };

  const updateAmountIn = async () => {
    const currentAmountOut = parseEther(amountOut || "0");

    if (dexContract && amountOut !== "") {
      await updateAmountInWithParsedAmount(currentAmountOut);
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
      console.log("saltAllowance: ", saltAllowance);
      console.log("parsedAmountIn: ", parsedAmountIn);
      if (saltAllowance !== undefined && saltAllowance < parsedAmountIn) {
        console.log("Approving salt");
        await approveSalt();
      }
      await creditToAsset();

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

  const debouncedChangeAmountOut = useDebouncedCallback(async v => {
    if (v.length < 21) {
      await changeAmountOut(v);
    }
  }, 1000);

  useInterval(async () => {
    await updateAmountIn();
  }, scaffoldConfig.pollingInterval);

  return (
    <div className="flex flex-col gap-2 m-8">
      <div className="flex justify-center text-2xl">Buy {tokenEmoji}</div>
      <div className="flex justify-center">
        <div className="w-[200px]">
          <InputBase
            value={amountOut}
            onChange={v => {
              debouncedChangeAmountOut(v);
              setAmountOut(v);
              setPriceLoading(true);
            }}
            placeholder="0"
          />
        </div>
        <button
          className="ml-1 mt-3 text-primary"
          onClick={() => {
            if (balanceSalt) {
              changeAmountIn(formatUnits(balanceSalt, 18));
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
          {saltEmoji}
          {priceLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <span className={`${parseEther(amountIn || "0") > balanceSalt ? "text-red-600" : ""}`}>
              {amountIn.slice(0, amountIn.indexOf(".") + 5)}
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
          Buy
        </button>
      </div>
    </div>
  );
};
