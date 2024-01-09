import { useState } from "react";
import type { NextPageWithLayout } from "./_app";
import { isAddress, parseEther } from "viem";
import { TokenInput, TokenListTypes } from "~~/components/game-wallet/Input/TokenInput";
import { GemHistory } from "~~/components/game-wallet/Send/GemsHistory";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

const Send: NextPageWithLayout = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<ContractName>(
    scaffoldConfig.saltToken.contractName as ContractName,
  );

  const { writeAsync: transfer, isMining } = useScaffoldContractWrite({
    contractName: selectedToken,
    functionName: "transfer",
    args: [toAddress, parseEther(amount || "0")],
  });

  const handleSend = async () => {
    if (!isAddress(toAddress)) {
      notification.error("Please enter a valid address");
      return;
    }

    const parsedAmount: bigint = parseEther(amount || "0");
    if (parsedAmount <= 0) {
      notification.error("Please enter an amount");
      return;
    }

    await transfer();
    setAmount("");
  };

  return (
    <div className="flex flex-col gap-2 text-center m-auto overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="font-medium text-xl"> Send Tokens </h1>
      </div>
      <div>
        <AddressInput value={toAddress} onChange={v => setToAddress(v)} placeholder="To Address" />
      </div>
      <div>
        <TokenInput
          name="tokenInput"
          onChange={v => {
            setAmount(v);
          }}
          value={amount}
          onTokenChange={value => setSelectedToken(value as ContractName)}
          tokens={[scaffoldConfig.saltToken].concat(scaffoldConfig.tokens) as TokenListTypes[]}
        />
      </div>
      <div>
        <button onClick={handleSend} className={`btn btn-primary w-full mt-4 text-white ${isMining ? "loading" : ""}`}>
          Send
        </button>
      </div>
      <div className="mt-4 w-full">
        <GemHistory tokenContract={selectedToken} />
      </div>
    </div>
  );
};

export default Send;
