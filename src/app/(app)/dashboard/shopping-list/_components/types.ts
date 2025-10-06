export type ShoppingListItem = {
  id: string;
  name: string;
  unit?: string;
  preparation?: string;
  amount: number | string | undefined;
};
