import { ReactElement, ReactNode, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { NextPage } from "next";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const ScaffoldEthApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();
  const [alias, setAlias] = useState("");

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  const getLayout =
    Component.getLayout ??
    (page => (
      <div className="flex flex-col items-center justify-center py-2">
        <div className="md:min-w-[32rem] p-6 my-14 md:my-10 w-full md:w-[35%]">
          <Header alias={alias} />
          <main className="md:static fixed bottom-0 left-0 w-full pb-4 bg-white md:bg-[#ffffff00] h-[50vh] md:h-full overflow-y-scroll rounded-t-3xl p-2 no-scrollbar">
            {page}
          </main>
          <Footer />
        </div>
      </div>
    ));

  return (
    <WagmiConfig config={wagmiConfig}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        {getLayout(<Component alias={alias} setAlias={setAlias} {...pageProps} />)}
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
