"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { Check, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ShareToHouseholdDialogProps {
  recipeId: Id<"recipes">;
  recipeTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareToHouseholdDialog({
  recipeId,
  recipeTitle,
  open,
  onOpenChange,
}: ShareToHouseholdDialogProps) {
  const households = useQuery(api.households.getUserHouseholds);
  const [selectedHouseholds, setSelectedHouseholds] = useState<
    Set<Id<"households">>
  >(new Set());
  const [isSharing, setIsSharing] = useState(false);
  const shareRecipe = useMutation(api.households.shareRecipeToHousehold);

  const handleToggleHousehold = (householdId: Id<"households">) => {
    const newSelected = new Set(selectedHouseholds);
    if (newSelected.has(householdId)) {
      newSelected.delete(householdId);
    } else {
      newSelected.add(householdId);
    }
    setSelectedHouseholds(newSelected);
  };

  const handleShare = async () => {
    if (selectedHouseholds.size === 0) {
      toast.error("Please select at least one household");
      return;
    }

    setIsSharing(true);

    try {
      const promises = Array.from(selectedHouseholds).map((householdId) =>
        shareRecipe({ recipeId, householdId })
      );

      await Promise.all(promises);

      toast.success(
        `Recipe shared to ${selectedHouseholds.size} ${
          selectedHouseholds.size === 1 ? "household" : "households"
        }!`
      );
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error sharing recipe:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to share recipe"
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
          <DialogDescription>
            Share &quot;{recipeTitle}&quot; with your households
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {households === undefined ? (
            <div className="text-center text-muted-foreground py-8">
              Loading households...
            </div>
          ) : households.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any households yet
              </p>
              <Link href={ROUTES.HOUSEHOLDS}>
                <Button variant="outline">Create a Household</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {households.map((household) => (
                <Label
                  key={household._id}
                  htmlFor={household._id}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={household._id}
                    checked={selectedHouseholds.has(household._id)}
                    onCheckedChange={() => handleToggleHousehold(household._id)}
                  />
                  <div className="font-medium">{household.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {household.memberCount}{" "}
                    {household.memberCount === 1 ? "member" : "members"}
                  </div>
                  {selectedHouseholds.has(household._id) && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </Label>
              ))}
            </div>
          )}
        </div>

        {households && households.length > 0 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSharing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing || selectedHouseholds.size === 0}
              className="flex-1"
            >
              {isSharing ? "Sharing..." : "Share Recipe"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
