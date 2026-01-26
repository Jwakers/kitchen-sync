"use client";

import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import useShare from "@/lib/hooks/use-share";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import {
  Copy,
  Edit,
  Link2,
  MoreVertical,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeleteRecipeDialog } from "./delete-recipe-dialog";
import { EditableRecipeMeta } from "./editable-recipe-meta";
import { IngredientsSection } from "./ingredients-section";
import { MethodSection } from "./method-section";
import { NutritionSection } from "./nutrition-section";
import { RecipeAttribution } from "./recipe-attribution";
import { RecipeHeader } from "./recipe-header";
import { RecipeLoading } from "./recipe-loading";
import { RecipeNotFound } from "./recipe-not-found";
import {
  recipeEditSchema,
  type RecipeEditFormData,
} from "@/lib/schemas/recipe";
import { ShareToHouseholdDialog } from "./share-to-household-dialog";

type RecipeClientProps = {
  recipeId: Id<"recipes">;
};

export type Recipe = FunctionReturnType<typeof api.recipes.getRecipe>;

export function RecipeClient({ recipeId }: RecipeClientProps) {
  const router = useRouter();

  const [isEditMode, setIsEditMode] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const recipe = useQuery(api.recipes.getRecipe, { recipeId });
  const updateRecipeMutation = useMutation(api.recipes.updateRecipe);
  const deleteRecipeMutation = useMutation(api.recipes.deleteRecipe);

  const form = useForm<RecipeEditFormData>({
    resolver: zodResolver(recipeEditSchema),
    defaultValues: {
      title: "",
      description: "",
      prepTime: 0,
      cookTime: undefined,
      serves: 0,
      category: "main",
      ingredients: [],
      method: [],
    },
  });

  const handleToggleEditMode = () => {
    if (isEditMode) {
      form.reset();
      setIsEditMode(false);
      return;
    }

    if (recipe) {
      form.reset({
        title: recipe.title,
        description: recipe.description || "",
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        serves: recipe.serves,
        category: recipe.category,
        ingredients: recipe.ingredients || [],
        method: recipe.method || [],
      });
    }
    setIsEditMode(true);
  };

  const handleSave = async (data: RecipeEditFormData) => {
    if (!recipe) return;

    try {
      await updateRecipeMutation({
        recipeId: recipe._id,
        title: data.title,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        serves: data.serves,
        category: data.category,
        ingredients: data.ingredients,
        method: data.method.map((step) => ({
          ...step,
          image: undefined, // TODO
        })),
      });

      toast.success("Recipe updated successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update recipe");
    }
  };

  const handleDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await deleteRecipeMutation({ recipeId: recipeToDelete._id });
      router.replace(ROUTES.MY_RECIPES);
      toast.success("Recipe deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete recipe");
    }
  };

  if (recipe === undefined) {
    return <RecipeLoading />;
  }

  if (recipe === null) {
    return <RecipeNotFound />;
  }

  // Only allow editing if user is the owner
  const canEdit = recipe.isOwner !== false; // Default to true if isOwner is not set (backward compatibility)

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {!canEdit && recipe.ownerName && (
          <div className="mb-4 p-4 bg-muted rounded-lg border">
            <p className="text-sm text-muted-foreground">
              This recipe is shared with you by{" "}
              <strong>{recipe.ownerName}</strong>. You can view it but not edit
              it.
            </p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="relative">
            <RecipeHeader
              recipe={recipe}
              isEditMode={isEditMode}
              canEdit={canEdit}
              form={form}
            />

            <RecipeControls
              isEditMode={isEditMode}
              recipe={recipe}
              onToggleEditMode={handleToggleEditMode}
              onDelete={handleDelete}
              canEdit={canEdit}
            />

            {isEditMode && <EditableRecipeMeta recipe={recipe} form={form} />}

            {!isEditMode && <NutritionSection recipe={recipe} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IngredientsSection
                recipe={recipe}
                isEditMode={isEditMode}
                form={form}
              />
              <MethodSection
                recipe={recipe}
                isEditMode={isEditMode}
                form={form}
              />
            </div>

            {!isEditMode && recipe.originalUrl && (
              <div className="mt-6">
                <RecipeAttribution recipe={recipe} />
              </div>
            )}
          </form>
        </Form>

        {/* Delete Confirmation Dialog */}
        <DeleteRecipeDialog
          recipe={recipeToDelete}
          onClose={() => setRecipeToDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}

function RecipeControls({
  isEditMode,
  onToggleEditMode,
  onDelete,
  recipe,
  canEdit,
}: {
  isEditMode: boolean;
  recipe: NonNullable<Recipe>;
  onToggleEditMode: () => void;
  onDelete: (recipe: NonNullable<Recipe>) => void;
  canEdit: boolean;
}) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { canShare, share, copyToClipboard } = useShare();

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
    }
  };

  return (
    <div
      className={cn(
        "flex items-center flex-wrap gap-3 py-4",
        isEditMode ? "sticky top-0 bg-background border-b" : ""
      )}
    >
      {isEditMode ? (
        <>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onToggleEditMode}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" size="lg" className="ml-auto">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </>
      ) : (
        <>
          {canEdit && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="lg" variant="outline">
                    <Users className="h-4 w-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
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
              <DropdownMenuTrigger asChild className="ml-auto">
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  aria-label="More Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="default" onClick={onToggleEditMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Recipe
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(recipe)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
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
