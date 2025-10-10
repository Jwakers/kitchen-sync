"use client";

import { api } from "@/../convex/_generated/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "ready" | "accepting" | "success" | "error"
  >("loading");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const invitationDetails = useQuery(api.households.getInvitationDetails, {
    token,
  });
  const acceptInvitation = useMutation(api.households.acceptInvitationByToken);

  useEffect(() => {
    if (invitationDetails === undefined) {
      setStatus("loading");
    } else if (invitationDetails === null) {
      setStatus("error");
      setErrorMessage("Invitation not found");
    } else if (
      "isExpired" in invitationDetails &&
      invitationDetails.isExpired
    ) {
      setStatus("error");
      setErrorMessage("This invitation has expired");
    } else if (
      "isConsumed" in invitationDetails &&
      invitationDetails.isConsumed
    ) {
      setStatus("error");
      setErrorMessage(
        "This invitation has already been used. Each invitation link can only be used once."
      );
    } else {
      setStatus("ready");
    }
  }, [invitationDetails]);

  const handleAcceptInvitation = async () => {
    setStatus("accepting");
    try {
      const result = await acceptInvitation({ token });
      setHouseholdId(result.householdId);
      setStatus("success");
      toast.success("Invitation accepted! Welcome to the household!");
    } catch (error: unknown) {
      console.error("Error accepting invitation:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to accept invitation."
      );
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Loading Invitation...
            </h3>
            <p className="text-muted-foreground text-center">
              Please wait whilst we verify your invitation
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    status === "ready" &&
    invitationDetails &&
    "householdName" in invitationDetails
  ) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You&apos;re Invited!</h3>
            <p className="text-muted-foreground text-center mb-2">
              <strong>{invitationDetails.invitedByName}</strong> has invited you
              to join
            </p>
            <p className="text-lg font-semibold text-foreground mb-6">
              {invitationDetails.householdName}
            </p>

            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation can only be used once. If you accept, no one
                else can use this link.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 w-full">
              <Button
                onClick={handleAcceptInvitation}
                className="flex-1"
                size="lg"
              >
                Accept Invitation
              </Button>
              <Button variant="outline" asChild className="flex-1" size="lg">
                <Link href="/dashboard/households">Maybe Later</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "accepting") {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Accepting Invitation...
            </h3>
            <p className="text-muted-foreground text-center">
              Please wait whilst we add you to the household
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Invitation Invalid</h3>
            <p className="text-muted-foreground text-center mb-6">
              {errorMessage}
            </p>
            <Button asChild>
              <Link href="/dashboard/households">View My Households</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-primary">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Invitation Accepted!</h3>
          <p className="text-muted-foreground text-center mb-6">
            You&apos;ve successfully joined the household. You can now view and
            share recipes with your household members.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                router.push(`/dashboard/households/${householdId}`)
              }
            >
              View Household
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/households">All Households</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
