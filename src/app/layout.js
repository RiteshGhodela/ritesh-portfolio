import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Ritesh Ghodela — Frontend Developer",
  description: "Websites built to turn visitors into customers. Fast, animated websites and web apps for founders and businesses.",
};

const themeScript = `
(function() {
  try {
    var sv = localStorage.getItem('rg-theme');
    var cur = (sv === 'dark' || sv === 'light') ? sv : (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = cur;
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={interTight.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
