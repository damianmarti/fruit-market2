import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { CheckCircleIcon, EllipsisHorizontalCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { QrCodeButton } from "~~/components/game-wallet/QrCodeButton";
import { Balance, FaucetButton } from "~~/components/scaffold-eth";
import { AddressMain } from "~~/components/scaffold-eth/AddressMain";
import { TokenBalance } from "~~/components/scaffold-eth/TokenBalance";
import { useAutoConnect, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import GasFilledIcon from "~~/icons/GasFilledIcon";
import HomeIcon from "~~/icons/HomeIcon";
import MedalsIcon from "~~/icons/MedalsIcon";
import SendIcon from "~~/icons/SendIcon";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

type UserData = {
  checkin: string;
};

/**
 * Site header
 */
export const Header = () => {
  useAutoConnect();

  const [loadingUserData, setLoadingUserData] = useState(true);
  const [userData, setUserData] = useState<UserData>();

  const { address } = useAccount();
  const router = useRouter();

  const saltToken = scaffoldConfig.saltToken;

  const { data: balance } = useScaffoldContractRead({
    contractName: "SaltToken",
    functionName: "balanceOf",
    args: [address],
  });

  console.log("balance", balance);

  const updateUserData = async () => {
    try {
      setLoadingUserData(true);
      const response = await fetch(`/api/users/${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
      } else {
        const result = await response.json();
        notification.error(result.error);
      }
    } catch (e) {
      console.log("Error getting user data", e);
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    if (address) {
      updateUserData();
    }
  }, [address]);

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
            <AddressMain address={address} disableAddressLink={true} />
            <div className="flex gap-4 items-center w-11/12 bg-white py-1 px-2 rounded-xl mt-4">
              <TokenBalance amount={balance} />
              <div className="text-xl font-bold flex gap-1">
                {loadingUserData ? (
                  <EllipsisHorizontalCircleIcon className="w-4" />
                ) : (
                  <>
                    {userData && userData.checkin ? (
                      <span title="Checked-in">
                        <CheckCircleIcon className="w-4 text-green-800" />
                      </span>
                    ) : (
                      <span title="Not checked-in">
                        <ExclamationCircleIcon className="w-4 text-red-800" />
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-6 justify-around mb-8">
            <Link
              href="/"
              className={`${router.pathname === "/" ? "bg-white scale-110" : "bg-white "
                } text-custom-black rounded-full p-2 `}
            >
              <HomeIcon width="22" height="22" fill={`${router.pathname === "/" ? "#629FFC" : "#0D0D0D"}`} />
            </Link>
            <Link
              href="/send"
              className={`${router.pathname === "/send" ? "bg-white scale-110" : "bg-white"
                } text-custom-black rounded-full p-2`}
            >
              <SendIcon width="22" height="22" fill={`${router.pathname === "/send" ? "#629FFC" : "#0D0D0D"}`} />
            </Link>
            <Link
              href="/medals"
              className={`${router.pathname === "/medals" ? "bg-white scale-110" : "bg-white"
                } text-custom-black rounded-full p-2`}
            >
              <MedalsIcon width="22" height="22" fill={`${router.pathname === "medals" ? "#629FFC" : "#0D0D0D"}`} />
            </Link>
          </div>
        </>
      </div>
    </>
  );
};
