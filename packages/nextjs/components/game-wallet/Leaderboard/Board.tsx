import { Address } from "~~/components/scaffold-eth";
import CashIcon from "~~/icons/CashIcon";

export const Board = ({ leaderboard, isLoading }: { leaderboard: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div>
        <p>No data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-20 justify-center">
        <table className="table self-start">
          <tbody>
            {leaderboard.slice(0, 15).map((data, index) => (
              <tr key={JSON.stringify(leaderboard[0]) + index} className="text-center">
                <td>{index + 1}</td>
                <td>
                  <Address address={data.address} alias={data.alias} copy={false} disableAddressLink />
                </td>
                <td className="text-right">
                  <CashIcon width="35" height="23" className="inline" /> {data.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
