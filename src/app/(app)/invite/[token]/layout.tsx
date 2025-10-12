import { api } from "convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const token = (await params).token;
  const invitationDetails = await fetchQuery(
    api.households.getInvitationDetails,
    {
      token,
    }
  );

  if (!invitationDetails) {
    return {
      title: "Invitation Not Found",
      description: "The invitation you are looking for does not exist.",
    };
  }

  const metadata = {
    title: "Join Household",
    description:
      "You've been invited to join a household on Kitchen Sync. Share and discover recipes together!",
    openGraph: {
      title: "Join Household",
      description:
        "You've been invited to join a household. Share and discover recipes together!",
      type: "website",
      siteName: "Kitchen Sync",
      images: ["/favicon.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Join Household",
      description:
        "You've been invited to join a household. Share and discover recipes together!",
      images: ["/favicon.svg"],
    },
  } satisfies Metadata;

  if (invitationDetails.householdName && invitationDetails.invitedByName) {
    metadata.title = `Join ${invitationDetails.householdName}`;
    metadata.description = `You've been invited by ${invitationDetails.invitedByName} to join ${invitationDetails.householdName} on Kitchen Sync. Share and discover recipes together!`;
    metadata.openGraph.title = `Join ${invitationDetails.householdName}`;
    metadata.openGraph.description = `You've been invited by ${invitationDetails.invitedByName} to join ${invitationDetails.householdName}. Share and discover recipes together!`;
    metadata.twitter.title = `Join ${invitationDetails.householdName}`;
    metadata.twitter.description = `You've been invited by ${invitationDetails.invitedByName} to join ${invitationDetails.householdName}. Share and discover recipes together!`;
  }

  return metadata;
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
