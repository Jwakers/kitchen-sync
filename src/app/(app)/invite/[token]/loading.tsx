import { Loader2 } from "lucide-react";
import InviteCard from "./invite-card";

export default function InviteLoading() {
  return (
    <InviteCard>
      <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
      <h3 className="text-xl font-semibold mb-2">Loading Invitation...</h3>
      <p className="text-muted-foreground text-center">
        Please wait whilst we verify your invitation
      </p>
    </InviteCard>
  );
}
