"use client";

import { CATEGORY_COLORS, ROUTES } from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useShare from "@/lib/hooks/use-share";
import { titleCase } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Edit,
  ImageIcon,
  Link2,
  MoreVertical,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { ChangeImageModal } from "./change-image-modal";
import { Recipe } from "./recipe-client";
import { RecipeEditFormData } from "./schema";
import { ShareToHouseholdDialog } from "./share-to-household-dialog";

interface RecipeHeaderProps {
  recipe: NonNullable<Recipe>;
  isEditMode: boolean;
  canEdit: boolean;
  onToggleEditMode: () => void;
  onDelete: (recipe: NonNullable<Recipe>) => void;
  form: UseFormReturn<RecipeEditFormData>;
}

export function RecipeHeader({
  recipe,
  isEditMode,
  canEdit,
  onToggleEditMode,
  onDelete,
  form,
}: RecipeHeaderProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { canShare, share, copyToClipboard } = useShare();

  const prepMinutes = recipe.prepTime ?? 0;
  const cookMinutes = recipe.cookTime ?? 0;
  const totalTime = prepMinutes + cookMinutes;
  const cookTimeDisplay =
    recipe.cookTime === undefined || recipe.cookTime === 0
      ? "No cooking required"
      : `${cookMinutes} cook`;
  const categoryLabel = titleCase(recipe.category);
  const categoryColor = CATEGORY_COLORS[recipe.category];

  const handleShareLink = async () => {
    const recipeUrl = `${window.location.origin}/recipe/${recipe._id}`;

    if (canShare) {
      await share(
        recipe.title,
        `Check out this recipe: ${recipe.title}`,
        recipeUrl
      );
    } else {
      await copyToClipboard(recipeUrl);
      toast.success("Recipe link copied to clipboard!");
    }
  };

  return (
    <div className="mb-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link href={ROUTES.MY_RECIPES}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Recipes
        </Link>
      </Button>
      {/* Recipe Image Placeholder */}
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden rounded-lg mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {recipe.image && (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover size-full"
            unoptimized
          />
        )}

        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="secondary"
            className={`${categoryColor} border-0 font-medium text-sm px-3 py-1`}
          >
            {categoryLabel}
          </Badge>
        </div>

        {/* Change Image Button - Only visible in edit mode */}
        {isEditMode && (
          <div className="absolute top-6 left-6 z-10">
            <Button
              type="button"
              size="default"
              variant="secondary"
              onClick={() => setIsImageModalOpen(true)}
              className="gap-2 shadow-lg"
            >
              <ImageIcon className="h-4 w-4" />
              Change Image
            </Button>
          </div>
        )}
      </div>
      <div className="mb-4">
        {isEditMode ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Recipe title..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="text-lg resize-none"
                      placeholder="Recipe description..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="md:text-4xl text-2xl font-bold">{recipe.title}</h1>
            {recipe.description && (
              <p className="md:text-lg text-sm max-w-2xl">
                {recipe.description}
              </p>
            )}
          </div>
        )}
      </div>
      {/* Recipe Meta */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            {Math.max(0, totalTime)}{" "}
            {Math.max(0, totalTime) === 1 ? "minute" : "minutes"} total
          </span>
          <span className="text-sm">
            ({prepMinutes} prep + {cookTimeDisplay})
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="font-medium">Serves {recipe.serves}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">
            {new Date(
              recipe.updatedAt ?? recipe._creationTime
            ).toLocaleDateString()}
          </span>
        </div>
        <Badge
          variant={recipe.status === "published" ? "default" : "secondary"}
          className="ml-auto"
        >
          {recipe.status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isEditMode ? (
          <>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={onToggleEditMode}
            >
              <X className="h-4 w-4" />
              Cancel Edit
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="gap-2"
                  onClick={onToggleEditMode}
                >
                  <Edit className="h-4 w-4" />
                  Edit Recipe
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsShareDialogOpen(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Share to Households
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareLink}>
                      {canShare ? (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          Share Link
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(recipe)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>

      {/* Change Image Modal */}
      <ChangeImageModal
        recipeId={recipe._id}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      {/* Share to Household Dialog */}
      {canEdit && (
        <ShareToHouseholdDialog
          recipeId={recipe._id}
          recipeTitle={recipe.title}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}
    </div>
  );
}
