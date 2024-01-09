import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

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
        <table className="table table-zebra self-start">
          <tbody>
            {leaderboard.map((data, index) => (
              <tr key={JSON.stringify(leaderboard[0]) + index} className="text-center">
                <td>{index + 1}</td>
                <td>
                  <Address address={data.address} alias={data.alias} />
                </td>
                <td className="text-right">
                  {scaffoldConfig.saltToken.emoji} {data.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
