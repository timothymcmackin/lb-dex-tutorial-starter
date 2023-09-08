import BigNumber from "bignumber.js";
import type { TezosToolkit } from "@taquito/taquito";
import type { token } from "./types";
import type { TezosAccountAddress } from "./store";
import { tzbtcAddress, sirsAddress } from "./config";

export const displayTokenAmount = (
  amount_: BigNumber | number,
  token: token
): string => {
  let amount = BigNumber.isBigNumber(amount_) ? amount_.toNumber() : amount_;
  switch (token) {
    case "XTZ":
      return (+(amount / 10 ** 6).toFixed(6)).toLocaleString("en-US");
    case "tzBTC":
      if (amount < 100) {
        return "> 0.000001";
      }
      return (+(amount / 10 ** 8).toFixed(8)).toLocaleString("en-US", {
        maximumSignificantDigits: 8
      });
    case "SIRS":
      return (+amount.toFixed(2)).toLocaleString("en-US");
  }
};

export const shortenHash = (hash: string): string =>
  hash ? hash.slice(0, 5) + "..." + hash.slice(-5) : "";

export const fetchExchangeRates = async (): Promise<{
  tzbtcPrice: number;
  xtzPrice: number;
} | null> => {

  // TUTORIAL TODO

};

export const fetchBalances = async (
  Tezos: TezosToolkit,
  userAddress: TezosAccountAddress
): Promise<{
  xtzBalance: number;
  tzbtcBalance: number;
  sirsBalance: number;
} | null> => {
  try {

    // TUTORIAL TODO

  } catch (error) {
    console.error(error);
    return null;
  }
};

export const calcDeadline = () =>
  new Date(Date.now() + 3_600_000).toISOString();
