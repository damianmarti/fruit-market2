import { Address } from "~~/components/scaffold-eth";
import { useAliases } from "~~/hooks/useAliases";
import scaffoldConfig from "~~/scaffold.config";
import { etherFormatted } from "~~/utils/etherFormatted";

export const Events = ({ events }: { events: any[] }) => {
  const aliases = useAliases({ enablePolling: false });

  const saltEmoji = scaffoldConfig.saltToken.emoji;

  if (events.length === 0) {
    return (
      <div>
        <p>No data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row">
      <div className="flex flex-col gap-x-20 justify-center">
        {events.slice(0, 15).map((data, index) => (
          <div className="flex gap-2 animate-fadeIn bg-slate-100 rounded-xl m-1" key={index}>
            <div className="flex gap-2 p-3 items-center">
              <div className="flex w-[350px]">
                <Address address={data.address} alias={aliases[data.address]} disableAddressLink={true} copy={false} />
                {data.tradeDirection === 0n ? (
                  <span className="pl-2">
                    <span className="pr-2">
                      {saltEmoji}
                      {etherFormatted(data.tokensSwapped)}
                    </span>
                    -&gt;
                    <span className="pl-2">
                      {data.tokenEmoji}
                      {etherFormatted(data.tokensReceived)}
                    </span>
                  </span>
                ) : (
                  <span className="pl-2">
                    <span className="pr-2">
                      {data.tokenEmoji}
                      {etherFormatted(data.tokensSwapped)}
                    </span>
                    -&gt;
                    <span className="pl-2">
                      {saltEmoji}
                      {etherFormatted(data.tokensReceived)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
