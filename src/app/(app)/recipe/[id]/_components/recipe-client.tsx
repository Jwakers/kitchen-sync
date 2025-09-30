"use client";

import { ROUTES } from "@/app/constants";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeleteRecipeDialog } from "./delete-recipe-dialog";
import { EditableRecipeMeta } from "./editable-recipe-meta";
import { IngredientsSection } from "./ingredients-section";
import { MethodSection } from "./method-section";
import { RecipeHeader } from "./recipe-header";
import { RecipeLoading } from "./recipe-loading";
import { RecipeNotFound } from "./recipe-not-found";
import { RecipeEditFormData, recipeEditSchema } from "./schema";

interface RecipeClientProps {
  recipeId: Id<"recipes">;
}

export function RecipeClient({ recipeId }: RecipeClientProps) {
  const router = useRouter();

  const [isEditMode, setIsEditMode] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Doc<"recipes"> | null>(
    null
  );

  const recipe = useQuery(api.recipes.getRecipe, { recipeId });
  const updateRecipeMutation = useMutation(api.recipes.updateRecipe);
  const deleteRecipeMutation = useMutation(api.recipes.deleteRecipe);

  const form = useForm<RecipeEditFormData>({
    resolver: zodResolver(recipeEditSchema),
    defaultValues: {
      title: "",
      description: "",
      prepTime: 0,
      cookTime: 0,
      serves: 0,
      category: "main",
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
      });
    }
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditMode(false);
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
      });

      toast.success("Recipe updated successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update recipe");
    }
  };

  const handleDelete = (recipe: Doc<"recipes">) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <RecipeHeader
              recipe={recipe}
              isEditMode={isEditMode}
              onToggleEditMode={handleToggleEditMode}
              onDelete={handleDelete}
              form={form}
            />

            {isEditMode && (
              <EditableRecipeMeta
                recipe={recipe}
                form={form}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IngredientsSection recipe={recipe} isEditMode={isEditMode} />
              <MethodSection recipe={recipe} isEditMode={isEditMode} />
            </div>
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
