import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Household | Kitchen Sync",
  description:
    "You've been invited to join a household on Kitchen Sync. Share and discover recipes together!",
  openGraph: {
    title: "Join Household on Kitchen Sync",
    description:
      "You've been invited to join a household. Share and discover recipes together!",
    type: "website",
    siteName: "Kitchen Sync",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Household on Kitchen Sync",
    description:
      "You've been invited to join a household. Share and discover recipes together!",
  },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
