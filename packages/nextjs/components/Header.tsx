import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { QrCodeButton } from "~~/components/game-wallet/QrCodeButton";
import { Balance, FaucetButton } from "~~/components/scaffold-eth";
import { AddressMain } from "~~/components/scaffold-eth/AddressMain";
import { TokenBalance } from "~~/components/scaffold-eth/TokenBalance";
import { useAutoConnect, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import GasFilledIcon from "~~/icons/GasFilledIcon";
import HomeIcon from "~~/icons/HomeIcon";
import MedalsIcon from "~~/icons/MedalsIcon";
import SendIcon from "~~/icons/SendIcon";

/**
 * Site header
 */
export const Header = ({ alias }: { alias: string }) => {
  useAutoConnect();

  const { address } = useAccount();
  const router = useRouter();

  const { data: balance } = useScaffoldContractRead({
    contractName: "SaltToken",
    functionName: "balanceOf",
    args: [address],
  });

  return (
    <>
      <Image src="/bg.svg" alt="Event Wallet Logo" width={21} height={28} className="absolute top-0 left-0 m-5" />
      <div className="absolute top-0 right-0 m-5">
        <div className="flex items-center">
          <QrCodeButton />
          <div className="flex items-center border border-[#000] rounded-full">
            <Balance className="pr-1" address={address} />
            <span className="text-sm pr-4">
              {" "}
              <GasFilledIcon width={"20"} height={"20"} fill="black" />
            </span>
          </div>
          <FaucetButton />
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <>
          <div className="flex flex-col items-center mb-6 gap-4">
            <AddressMain address={address} disableAddressLink={true} alias={alias} />
            <div className="flex gap-4 items-center w-11/12 bg-white py-1 px-2 rounded-xl mt-4">
              <TokenBalance amount={balance} />
              <div className="text-xl font-bold flex gap-1">
                {alias ? (
                  <span title="Checked-in">
                    <CheckCircleIcon className="w-4 text-green-800" />
                  </span>
                ) : (
                  <span title="Not checked-in">
                    <ExclamationCircleIcon className="w-4 text-red-800" />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-6 justify-around mb-8">
            <Link
              href="/"
              className={`${
                router.pathname === "/" ? "bg-white scale-110" : "bg-white "
              } text-custom-black rounded-full p-2 `}
            >
              <HomeIcon width="22" height="22" fill={`${router.pathname === "/" ? "#629FFC" : "#0D0D0D"}`} />
            </Link>
            <Link
              href="/send"
              className={`${
                router.pathname === "/send" ? "bg-white scale-110" : "bg-white"
              } text-custom-black rounded-full p-2`}
            >
              <SendIcon width="22" height="22" fill={`${router.pathname === "/send" ? "#629FFC" : "#0D0D0D"}`} />
            </Link>
            <Link
              href="/leaderboard"
              className={`${
                router.pathname === "/leaderboard" ? "bg-white scale-110" : "bg-white"
              } text-custom-black rounded-full p-2`}
            >
              <MedalsIcon
                width="22"
                height="22"
                fill={`${router.pathname === "leaderboard" ? "#629FFC" : "#0D0D0D"}`}
              />
            </Link>
          </div>
        </>
      </div>
    </>
  );
};
