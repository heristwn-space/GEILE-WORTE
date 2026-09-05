import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata = {
  title: "GEILE WORTE - Deutsch Vokabelspiel",
  description: "Ein buntes und spielerisches Deutsch-Vokabelspiel für Kinder und Erwachsene.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${fredoka.variable} h-full antialiased`}>
      <body className={`${fredoka.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
