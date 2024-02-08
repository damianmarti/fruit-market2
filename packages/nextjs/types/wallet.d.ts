export type TTokenInfo = {
  contractName: string;
  name: string;
  emoji: string;
  initAssetAmount?: string;
  initCreditAmount?: string;
};

export type TTokenBalance = {
  balance?: bigint;
  price?: bigint;
  priceIn?: bigint;
  value?: bigint;
};
