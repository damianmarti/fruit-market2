import { useState } from "react";
import { Events } from "~~/components/game-wallet/SwapEvents/Events";
import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export const SwapEvents = () => {
  type SwapData = {
    tokenEmoji: string;
    address: string;
    tradeDirection: bigint;
    tokensSwapped: bigint;
    tokensReceived: bigint;
  };

  const [events, setEvents] = useState<SwapData[]>([]);

  scaffoldConfig.tokens.forEach(token => {
    // The tokens array should not change, so this should be safe. Anyway, we can refactor this later.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useScaffoldEventSubscriber({
      contractName: `BasicDex${token.name}` as ContractName,
      eventName: "TokenSwap",
      listener: logs => {
        logs.forEach(log => {
          const { _user, _tradeDirection, _tokensSwapped, _tokensReceived } = log.args;
          console.log("📡 TokenSwap event", _user, _tradeDirection, _tokensSwapped, _tokensReceived);
          const tokenEmoji = token.emoji;
          if (_user && _tradeDirection !== undefined && _tokensSwapped && _tokensReceived) {
            const newEvent: SwapData = {
              tokenEmoji,
              address: _user,
              tradeDirection: _tradeDirection,
              tokensSwapped: _tokensSwapped,
              tokensReceived: _tokensReceived,
            };
            setEvents(events => [newEvent, ...events]);
          }
        });
      },
    });
  });

  return (
    <div className="flex flex-row pt-2 gap-[100px]">
      <Events events={events} />
    </div>
  );
};
