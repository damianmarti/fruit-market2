import { useState } from "react";
import { PunkBlockie } from "../game-wallet/PunkBlockie";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { isAddress } from "viem";
import { CheckCircleIcon, DocumentDuplicateIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { getBlockExplorerAddressLink, getTargetNetwork } from "~~/utils/scaffold-eth";

type TAddressProps = {
  address?: string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  alias?: string;
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const AddressMain = ({ address, disableAddressLink, format, alias }: TAddressProps) => {
  const [addressCopied, setAddressCopied] = useState(false);

  // Skeleton UI
  if (!address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(address)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(getTargetNetwork(), address);
  let displayAddress = address?.slice(0, 5) + "..." + address?.slice(-4);

  if (alias) {
    displayAddress = alias.slice(0, 15) + (alias.length > 15 ? "..." : "");
  } else if (format === "long") {
    displayAddress = address;
  }

  return (
    <>
      <div className="flex flex-row items-center justify-start w-full px-5 relative">
        <div className="flex-shrink-0">
          <PunkBlockie address={address} />
        </div>
        <div className="flex-col ml-4 py-2">
          <div className="flex items-center">
            {disableAddressLink ? (
              <span className="text-base font-normal">{displayAddress}</span>
            ) : (
              <a
                className="ml-1.5 text-base font-normal"
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
              >
                {displayAddress}
              </a>
            )}
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
            {addressCopied ? (
              <CheckCircleIcon
                className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                aria-hidden="true"
              />
            ) : (
              <>
                <CopyToClipboard
                  text={address}
                  onCopy={() => {
                    setAddressCopied(true);
                    setTimeout(() => {
                      setAddressCopied(false);
                    }, 800);
                  }}
                >
                  <DocumentDuplicateIcon
                    className="ml-1.5 text-xl font-normal text-gray-500 h-5 w-5 cursor-pointer"
                    aria-hidden="true"
                  />
                </CopyToClipboard>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
