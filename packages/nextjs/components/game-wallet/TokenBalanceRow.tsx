import { TTokenBalance, TTokenInfo } from "~~/types/wallet";
import { etherFormatted } from "~~/utils/etherFormatted";

type TTokenBalanceProps = {
  tokenInfo: TTokenInfo;
  tokenBalance?: TTokenBalance;
  handleShowBuy: (selectedToken: TTokenInfo) => void;
  handleShowSell: (selectedToken: TTokenInfo) => void;
  loading?: boolean;
  paused?: boolean;
};

/**
 * Display row with balance of a token
 */
export const TokenBalanceRow = ({
  tokenInfo,
  tokenBalance,
  handleShowBuy,
  handleShowSell,
  loading,
  paused,
}: TTokenBalanceProps) => {
  return (
    <tr>
      <td align="left" className="px-3 text-xs">
        {tokenInfo.emoji + " " + tokenInfo.name}
      </td>
      <td>{loading ? "..." : etherFormatted(tokenBalance?.price)}</td>
      <td>{loading ? "..." : etherFormatted(tokenBalance?.balance)}</td>
      <td>{loading ? "..." : etherFormatted(tokenBalance?.value)}</td>
      <td className="flex flex-row place-content-center">
        {paused ? (
          <div>PAUSED</div>
        ) : (
          <>
            <button
              onClick={() => handleShowBuy(tokenInfo)}
              className="btn bg-black btn-xs text-[0.75rem] btn-ghost text-custom-green min-h-6 h-7 capitalize px-4"
              disabled={loading}
            >
              {" "}
              Buy{" "}
            </button>
            <button
              onClick={() => handleShowSell(tokenInfo)}
              className="btn btn-secondary btn-xs ml-2 text-[0.75rem] bg-grey-btn btn-ghost min-h-6 h-7 capitalize px-4"
              disabled={loading}
            >
              Sell
            </button>
          </>
        )}
      </td>
    </tr>
  );
};
