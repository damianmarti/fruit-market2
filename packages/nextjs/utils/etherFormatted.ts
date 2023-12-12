import { formatEther } from "viem";

export const roundedTo4 = (value: bigint) => value - (value % 100000000000000n);

export const etherFormatted = (value: bigint) => formatEther(roundedTo4(value));

export const etherFormattedPlusOne = (value: bigint) => formatEther(roundedTo4(value) + 100000000000000n);