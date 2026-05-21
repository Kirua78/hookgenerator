import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata = {
  title: "HookGenerator",
  description: "Génère des hooks viraux pour tes vidéos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${oswald.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}