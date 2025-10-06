import { RECIPE_CATEGORIES } from "convex/lib/constants";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  MY_RECIPES: "/dashboard/my-recipes",
  RECIPE: "/recipe",
  IMPORT_RECIPE: "/dashboard/import-recipe",
  SHOPPING_LIST: "/dashboard/shopping-list",
} as const;

export const CATEGORY_COLORS: Record<
  (typeof RECIPE_CATEGORIES)[number],
  string
> = {
  main: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dessert: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  snack:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  appetizer:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  side: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  beverage: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  breakfast:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  lunch:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  dinner: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const STORAGE_KEYS = {
  shoppingList: "shopping_list",
} as const;
