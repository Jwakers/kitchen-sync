"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "convex/_generated/dataModel";

interface DeleteRecipeDialogProps {
  recipe: Doc<"recipes"> | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteRecipeDialog({
  recipe,
  onClose,
  onConfirm,
}: DeleteRecipeDialogProps) {
  return (
    <Dialog open={!!recipe} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{recipe?.title}
            &quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
