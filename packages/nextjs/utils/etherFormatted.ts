import { formatEther } from "viem";

export const roundedTo4 = (value: bigint) => value - (value % 100000000000000n);

export const etherFormatted = (value?: bigint) => (value ? formatEther(roundedTo4(value)) : "0.0");

export const etherFormattedPlusOne = (value?: bigint) =>
  value ? formatEther(roundedTo4(value) + 100000000000000n) : "0.0";
