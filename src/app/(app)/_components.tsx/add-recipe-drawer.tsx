"use client";

import { ROUTES } from "@/app/constants";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Camera, Globe, Palette } from "lucide-react";
import Link from "next/link";

type AddRecipeDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddRecipeDrawer({ open, onOpenChange }: AddRecipeDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Recipe</DrawerTitle>
          <DrawerDescription>
            Choose how you&apos;d like to add a new recipe
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 p-4">
          <Link href={ROUTES.IMPORT_RECIPE} onClick={() => onOpenChange(false)}>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <Globe className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Import Recipe</h3>
                  <p className="text-muted-foreground text-sm">
                    From a URL or paste recipe text - we&apos;ll do the rest
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href={`${ROUTES.IMPORT_RECIPE}?mode=photo`}
            onClick={() => onOpenChange(false)}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent rounded-lg">
                  <Camera className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Photograph Recipe</h3>
                  <p className="text-muted-foreground text-sm">
                    Take photos of recipe pages and we&apos;ll extract the
                    details
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href={ROUTES.CREATE_RECIPE}
            onClick={() => onOpenChange(false)}
            aria-label="Create Your Own"
          >
            <Card className="p-6 text-left transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-lg">
                  <Palette className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Create Your Own</h3>
                  <p className="text-muted-foreground text-sm">
                    Start from scratch and build your perfect recipe
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
