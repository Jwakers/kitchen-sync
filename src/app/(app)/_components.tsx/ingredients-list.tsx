type Ingredient = {
  name: string;
  amount?: number;
  unit?: string;
  preparation?: string;
};

export function IngredientsList(props: { ingredients: Ingredient[] }) {
  return (
    <ul className="space-y-2 list-disc">
      {props.ingredients.map((ingredient, index) => (
        <li
          key={`${index}-${ingredient.name}-${ingredient.amount}-${ingredient.unit}`}
          className="flex items-start gap-1"
        >
          {ingredient.amount ? (
            <span className="font-medium">{ingredient.amount}</span>
          ) : null}
          {ingredient.unit ? <span>{ingredient.unit}</span> : null}
          {ingredient.name ? (
            <span className="capitalize">{ingredient.name}</span>
          ) : null}
          {ingredient.preparation ? (
            <span className="text-muted-foreground italic capitalize">
              - {ingredient.preparation}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
