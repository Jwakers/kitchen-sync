import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ConvexClientProvider from "./providers/convex-client-provider";

const lexendSans = Lexend({
  variable: "--font-lexend-sans",
  subsets: ["latin"],
});

const APP_NAME = "Kitchen Sync";
const APP_DEFAULT_TITLE = "Kitchen Sync - Family Meal Planning";
const APP_TITLE_TEMPLATE = "%s | Kitchen Sync";
const APP_DESCRIPTION =
  "Create recipes, plan weekly meals, and generate smart shopping lists. Take the pain out of family meal planning with Kitchen Sync.";

const APP_URL = new URL(
  process.env.VERCEL_URL
    ? (process.env.NODE_ENV === "production" ? "https://" : "http://") +
      process.env.VERCEL_URL
    : "https://kitchen-sync-app.com"
);

export const metadata: Metadata = {
  metadataBase: APP_URL,
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
    startupImage: [
      {
        url: "/splash.png",
        media: "(device-width: 320px) and (device-height: 568px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 375px) and (device-height: 667px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 375px) and (device-height: 812px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 390px) and (device-height: 844px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 393px) and (device-height: 852px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 414px) and (device-height: 896px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 414px) and (device-height: 736px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 428px) and (device-height: 926px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 430px) and (device-height: 932px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 810px) and (device-height: 1080px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 820px) and (device-height: 1180px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 834px) and (device-height: 1194px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 834px) and (device-height: 1112px)",
      },
      {
        url: "/splash.png",
        media: "(device-width: 1024px) and (device-height: 1366px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": APP_NAME,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kitchen Sync - Family Meal Planning Made Simple",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#f0f8ff" },
  ],
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexendSans.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors className="pointer-events-auto" />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
