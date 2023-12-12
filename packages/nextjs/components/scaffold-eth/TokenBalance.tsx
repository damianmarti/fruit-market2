import { formatEther } from 'viem'
import CashIcon from "~~/icons/CashIcon";

type TTokenBalanceProps = {
  amount?: bigint;
};

/**
 * Display Balance of a token
 */
export const TokenBalance = ({ amount }: TTokenBalanceProps) => {
  console.log("amount", amount);
  const amountRounded: bigint = amount ? amount - (amount % 100000000000000n) : 0n;
  return (
    <div className="w-full flex items-center justify-between">
      <>
        <span className="text-3xl font-bold mr-1">
          <CashIcon width="53" height="35" />
        </span>
        <div className="flex flex-col">
          <span className="text-2xl font-medium">
            {formatEther(amountRounded)}
          </span>
        </div>
      </>
    </div>
  );
};
