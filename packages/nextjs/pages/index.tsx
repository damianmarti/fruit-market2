import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { NextPageWithLayout } from "./_app";
import { useInterval } from "usehooks-ts";
import { formatUnits, parseEther } from "viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";
import { BackwardIcon } from "@heroicons/react/24/outline";
import PriceChart from "~~/components/game-wallet/PriceChart";
import { TokenBalanceRow } from "~~/components/game-wallet/TokenBalanceRow";
import { TokenBuy } from "~~/components/game-wallet/TokenBuy";
import { TokenSell } from "~~/components/game-wallet/TokenSell";
import { LandOwnership } from "~~/components/land/LandOwnership";
import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import CashIcon from "~~/icons/CashIcon";
import scaffoldConfig from "~~/scaffold.config";
import { TTokenBalance, TTokenInfo } from "~~/types/wallet.d";
import { etherFormatted, etherFormattedPlusOne } from "~~/utils/etherFormatted";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type DexesPaused = { [key: string]: boolean };

const Home: NextPageWithLayout<{ setAlias: Dispatch<SetStateAction<string>> }> = ({ setAlias }) => {
  const tokens = scaffoldConfig.tokens;

  const { address } = useAccount();
  const [loadingCheckedIn, setLoadingCheckedIn] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [swapToken, setSwapToken] = useState<TTokenInfo>(scaffoldConfig.tokens[0]);
  const [showBuy, setShowBuy] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [selectedTokenName, setSelectedTokenName] = useState<string>(tokens[0].name);
  const [tokensData, setTokensData] = useState<{ [key: string]: TTokenBalance }>({});
  const [loadingTokensData, setLoadingTokensData] = useState<boolean>(true);
  const [totalNetWorth, setTotalNetWorth] = useState<bigint>(0n);
  const [dexesPaused, setDexesPaused] = useState<DexesPaused>({});

  const selectedTokenEmoji = scaffoldConfig.tokens.find(t => selectedTokenName === t.name)?.emoji;

  const message = {
    action: "user-checkin",
    address: address,
  };

  const { data: balanceSalt } = useScaffoldContractRead({
    contractName: "SaltToken",
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    const updateAlias = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/alias/${address}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (response.ok && data) {
            setAlias(data);
          }
        } catch (e) {
          console.log("Error checking if user has alias", e);
        }
      }
    };
    updateAlias();
  }, [address]);

  const tokenContracts: { [key: string]: any } = {};
  const dexContracts: { [key: string]: any } = {};
  const tokenContractsAddresses: string[] = [];
  const dexContractsAddresses: string[] = [];
  const tokensByAddress: { [key: string]: TTokenInfo } = {};

  tokens.forEach(token => {
    const contractName: ContractName = `${token.name}Token` as ContractName;
    const contractDexName: ContractName = `BasicDex${token.name}` as ContractName;

    // The tokens array should not change, so this should be safe. Anyway, we can refactor this later.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useScaffoldContract({ contractName });
    if (data) {
      tokenContracts[token.name] = data;
      tokenContractsAddresses.push(data.address);
      tokensByAddress[data.address] = token;
    }

    // The tokens array should not change, so this should be safe. Anyway, we can refactor this later.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: dex } = useScaffoldContract({ contractName: contractDexName });
    if (dex) {
      dexContracts[token.name] = dex;
      dexContractsAddresses.push(dex.address);
    }
  });

  const { data: fruitTokensDataContract } = useScaffoldContract({ contractName: "FruitTokensData" });

  const updateTokensData = async () => {
    const newTokenData: { [key: string]: TTokenBalance } = {};
    let total = balanceSalt || 0n;

    if (address && fruitTokensDataContract && tokenContractsAddresses.length > 0 && dexContractsAddresses.length > 0) {
      const size = 10;
      const tokenContractsAddressesArrays = [];
      const dexContractsAddressesArrays = [];

      while (tokenContractsAddresses.length > 0) {
        tokenContractsAddressesArrays.push(tokenContractsAddresses.splice(0, size));
      }

      while (dexContractsAddresses.length > 0) {
        dexContractsAddressesArrays.push(dexContractsAddresses.splice(0, size));
      }

      const balances = [];
      const prices = [];
      const pricesIn = [];

      for (let i = 0; i < tokenContractsAddressesArrays.length; i++) {
        const tokenAddresses = tokenContractsAddressesArrays[i];
        const dexAddresses = dexContractsAddressesArrays[i];

        const newBalances = await fruitTokensDataContract.read.balancesOf([address, tokenAddresses]);
        const newPrices = await fruitTokensDataContract.read.assetOutPrices([dexAddresses]);
        const newPricesIn = await fruitTokensDataContract.read.assetInPrices([dexAddresses]);

        balances.push(...newBalances);
        prices.push(...newPrices);
        pricesIn.push(...newPricesIn);
      }

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        const balance: bigint = balances[i];
        const price: bigint = prices[i];
        const priceIn: bigint = pricesIn[i];
        const value: bigint = (price * balance) / parseEther("1");

        newTokenData[token.name] = {
          balance: balance,
          price: price,
          priceIn: priceIn,
          value: value,
        };

        total = total + value;
      }
    }

    setTokensData(newTokenData);
    setTotalNetWorth(total);
    setLoadingTokensData(false);
  };

  const updateDexesData = async () => {
    const pausedData: { [key: string]: boolean } = {};

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const dexContract = dexContracts[token.name];

      if (dexContract) {
        const paused = await dexContract.read.paused();

        pausedData[token.name] = paused;
      }
    }

    setDexesPaused(pausedData);
  };

  useEffect(() => {
    (async () => {
      if (Object.keys(dexContracts).length === tokens.length) {
        await updateDexesData();
      }
    })();
  }, [Object.keys(dexContracts).length]);

  useInterval(async () => {
    if (Object.keys(dexContracts).length === tokens.length) {
      await updateDexesData();
    }
  }, scaffoldConfig.tokenLeaderboardPollingInterval);

  useEffect(() => {
    (async () => {
      if (Object.keys(tokenContracts).length === tokens.length && Object.keys(dexContracts).length === tokens.length) {
        await updateTokensData();
      }
    })();
  }, [Object.keys(tokenContracts).length, Object.keys(dexContracts).length]);

  useInterval(async () => {
    if (Object.keys(tokenContracts).length === tokens.length && Object.keys(dexContracts).length === tokens.length) {
      await updateTokensData();
    }
  }, scaffoldConfig.pollingInterval);

  useEffect(() => {
    const updateCheckedIn = async () => {
      try {
        setLoadingCheckedIn(true);
        const response = await fetch(`/api/users/${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setCheckedIn(true);
        }
      } catch (e) {
        console.log("Error checking if user is checked in", e);
      } finally {
        setLoadingCheckedIn(false);
      }
    };

    if (address) {
      updateCheckedIn();
    }
  }, [address]);

  useEffect(() => {
    const handleCheckIn = async () => {
      if (!address) {
        return;
      }

      const burnerPK = loadBurnerSK();

      const account = privateKeyToAccount(burnerPK);

      const signer = createWalletClient({
        account,
        chain: scaffoldConfig.targetNetwork,
        transport: http(),
      });

      // Sign the message
      const messageString = JSON.stringify(message);
      const signature = await signer.signMessage({
        account,
        message: messageString,
      });

      try {
        // Post the signed message to the API
        const response = await fetch("/api/check-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signature, signerAddress: address }),
        });

        const result = await response.json();

        if (response.ok) {
          setCheckedIn(true);
          notification.success(result.message);
          setAlias(result.alias);
        } else {
          notification.error(result.error);
        }
      } catch (e) {
        console.log("Error checking in the user", e);
      }
    };

    if (address && !loadingCheckedIn && !checkedIn) {
      handleCheckIn();
    }
  }, [address, loadingCheckedIn, checkedIn]);

  const handleShowBuy = (selectedToken: TTokenInfo) => {
    console.log("selectedToken emoji: ", selectedToken.emoji);
    setSwapToken(selectedToken);
    setShowBuy(true);
  };

  const handleShowSell = (selectedToken: TTokenInfo) => {
    console.log("selectedToken emoji: ", selectedToken.emoji);
    setSwapToken(selectedToken);
    setShowSell(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2 max-w-[430px] text-center m-auto">
        {checkedIn && (
          <p className="font-bold">
            Total Net Worth: <CashIcon width="53" height="35" className="inline" />{" "}
            {loadingTokensData ? "..." : etherFormatted(totalNetWorth)}
          </p>
        )}

        {!checkedIn && !loadingCheckedIn && <div>Checking-in...</div>}

        {checkedIn && !showBuy && !showSell && (
          <>
            <div className="rounded-xl">
              <table className="table-auto border-separate ">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Price</th>
                    <th>Balance</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(token => (
                    <TokenBalanceRow
                      key={token.name}
                      tokenInfo={token}
                      tokenBalance={tokensData[token.name]}
                      handleShowBuy={handleShowBuy}
                      handleShowSell={handleShowSell}
                      loading={loadingTokensData}
                      paused={dexesPaused[token.name]}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {scaffoldConfig.showChart && (
              <>
                <div className="flex gap-4 text-3xl mt-8">
                  {tokens.map(token => (
                    <label
                      key={token.name}
                      className={`p-2 cursor-pointer ${
                        selectedTokenName === token.name ? "bg-primary outline outline-2 outline-black" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="token"
                        value={token.name}
                        className="w-0 h-0"
                        onChange={t => setSelectedTokenName(t.target.value)}
                      />
                      {token.emoji}
                    </label>
                  ))}
                </div>

                {selectedTokenEmoji && (
                  <PriceChart
                    tokenName={selectedTokenName}
                    tokenEmoji={selectedTokenEmoji}
                    rangeSelector={true}
                    navigator={true}
                  />
                )}
              </>
            )}
          </>
        )}

        {checkedIn && showBuy && (
          <div className="bg-base-300 rounded-xl p-4">
            <button className="btn btn-primary" onClick={() => setShowBuy(false)}>
              <BackwardIcon className="h-5 w-5 mr-2" /> Go Back
            </button>
            <TokenBuy
              token={swapToken.contractName as ContractName}
              defaultAmountOut={"1"}
              defaultAmountIn={etherFormattedPlusOne(tokensData[swapToken.name].price)}
              balanceSalt={balanceSalt || 0n}
              close={() => setShowBuy(false)}
            />
          </div>
        )}

        {checkedIn && showSell && (
          <div className="bg-base-300 rounded-xl p-4">
            <button className="btn btn-primary" onClick={() => setShowSell(false)}>
              <BackwardIcon className="h-5 w-5 mr-2" /> Go Back
            </button>
            <TokenSell
              token={swapToken.contractName as ContractName}
              defaultAmountOut={formatUnits(tokensData[swapToken.name].priceIn ?? 0n, 18)}
              defaultAmountIn={"1"}
              balanceToken={tokensData[swapToken.name].balance ?? 0n}
              close={() => setShowSell(false)}
            />
          </div>
        )}
      </div>

      <LandOwnership tokenContracts={tokenContracts} tokensByAddress={tokensByAddress} />
    </>
  );
};

export default Home;
