import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const myFont = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
});
 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable} ${myFont.variable}`}>
      <Component {...pageProps} />
    </main>
  );
};

export default api.withTRPC(MyApp);
