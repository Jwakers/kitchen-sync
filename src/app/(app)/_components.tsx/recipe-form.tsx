"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREPARATION_OPTIONS, UNITS } from "@/lib/constants";
import { recipeSchema, type RecipeFormData } from "@/lib/schemas/recipe";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type RecipeFormProps = {
  onClose: () => void;
};

type FormStep = "basic" | "ingredients" | "method" | "review";

export function RecipeForm({ onClose }: RecipeFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Options for dropdowns
  const unitOptions = UNITS.map((unit: string) => ({
    value: unit,
    label: unit,
  }));
  const preparationOptions = PREPARATION_OPTIONS.map((prep: string) => ({
    value: prep,
    label: prep,
  }));

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      prepTime: 0,
      cookTime: 0,
      serves: 1,
      category: "main",
      ingredients: [],
      method: [],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: methodFields,
    append: appendMethodStep,
    remove: removeMethodStep,
  } = useFieldArray({
    control: form.control,
    name: "method",
  });

  const steps: { key: FormStep; title: string; description: string }[] = [
    { key: "basic", title: "Basic Info", description: "Recipe details" },
    {
      key: "ingredients",
      title: "Ingredients",
      description: "Add ingredients",
    },
    { key: "method", title: "Method", description: "Cooking steps" },
    { key: "review", title: "Review", description: "Check and save" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setSlideDirection("next");
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setSlideDirection("prev");
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const addIngredient = () => {
    appendIngredient({
      id: Date.now().toString(),
      name: "",
      amount: "",
      unit: "",
      preparation: "",
    });
  };

  const addMethodStep = () => {
    appendMethodStep({
      id: Date.now().toString(),
      step: "",
    });
  };

  const onSubmit = (data: RecipeFormData) => {
    console.log("Recipe data:", data);
    // TODO: Save to database
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipe title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full p-2 border border-input rounded-md bg-background h-20 resize-none"
                        placeholder="Describe your recipe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (min) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <FormField
                control={form.control}
                name="serves"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serves *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        );

      case "ingredients":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ingredients</h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {ingredientFields.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    layout
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-2">
                        <motion.span
                          className="text-sm text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {index + 1}.
                        </motion.span>
                        <div className="flex-1 space-y-2">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <FormField
                              control={form.control}
                              name={`ingredients.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Ingredient name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                          <motion.div
                            className="grid grid-cols-3 gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <FormField
                              control={form.control}
                              name={`ingredients.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Amount" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredients.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Unit" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {unitOptions.map(
                                          (option: {
                                            value: string;
                                            label: string;
                                          }) => (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`ingredients.${index}.preparation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Combobox
                                      options={preparationOptions}
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      placeholder="Preparation"
                                      searchPlaceholder="Search preparation..."
                                      emptyText="No preparation found."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {ingredientFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ingredients added yet.</p>
                  <p className="text-sm">
                    Click the card below to add your first ingredient.
                  </p>
                </div>
              )}

              {/* Add Ingredient Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={addIngredient}
              >
                <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add Ingredient</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case "method":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cooking Method</h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {methodFields.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    layout
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-2">
                        <motion.span
                          className="text-sm text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {index + 1}.
                        </motion.span>
                        <motion.div
                          className="flex-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name={`method.${index}.step`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    placeholder="Describe this step..."
                                    className="w-full p-2 border border-input rounded-md bg-background h-20 resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMethodStep(index)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {methodFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No steps added yet.</p>
                  <p className="text-sm">
                    Click the card below to add your first step.
                  </p>
                </div>
              )}

              {/* Add Method Step Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={addMethodStep}
              >
                <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add Step</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case "review":
        const formValues = form.getValues();
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Recipe</h3>

              <Card className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-xl">
                    {formValues.title || "Untitled Recipe"}
                  </h4>
                  {formValues.description && (
                    <p className="text-muted-foreground mt-1">
                      {formValues.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prep:</span>{" "}
                    {formValues.prepTime} min
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cook:</span>{" "}
                    {formValues.cookTime} min
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serves:</span>{" "}
                    {formValues.serves}
                  </div>
                </div>

                {formValues.ingredients.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">
                      Ingredients ({formValues.ingredients.length})
                    </h5>
                    <ul className="space-y-1 text-sm">
                      {formValues.ingredients.map((ing, index) => (
                        <li key={ing.id}>
                          {index + 1}. {ing.name}{" "}
                          {ing.amount &&
                            ing.unit &&
                            `(${ing.amount} ${ing.unit})`}
                          {ing.preparation && ` - ${ing.preparation}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formValues.method.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">
                      Method ({formValues.method.length} steps)
                    </h5>
                    <ol className="space-y-1 text-sm">
                      {formValues.method.map((step, index) => (
                        <li key={step.id}>
                          {index + 1}. {step.step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col overflow-auto"
      >
        {/* Step content */}
        <div className="flex-1 p-4">
          <AnimatePresence mode="popLayout" custom={slideDirection}>
            <motion.div
              key={currentStep}
              custom={slideDirection}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: (direction: "next" | "prev") => ({
                  x: direction === "next" ? 300 : -300,
                  opacity: 0,
                  scale: 0.95,
                }),
                animate: {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                },
                exit: (direction: "next" | "prev") => ({
                  x: direction === "next" ? -300 : 300,
                  opacity: 0,
                  scale: 0.95,
                }),
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.6,
              }}
              className="h-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 from-background/20 to-background bg-linear-to-b backdrop-blur-sm">
          {/* Progress indicator */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span>{steps[currentStepIndex].title}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Individual step indicators with individual progress */}
              {steps.map((_, index) => (
                <div
                  key={index}
                  className="relative h-2 flex-grow overflow-hidden rounded"
                >
                  {/* Background for each section */}
                  <div className="absolute inset-0 bg-secondary" />
                  {/* Progress fill for completed sections - always rendered for smooth animation */}
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: index <= currentStepIndex ? "100%" : "0%",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      duration: 0.6,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              {currentStepIndex > 0 ? (
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}

              {currentStepIndex < steps.length - 1 ? (
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="button" onClick={nextStep} className="w-full">
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full">
                    Save Recipe
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
