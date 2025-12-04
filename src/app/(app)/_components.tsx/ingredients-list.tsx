type Ingredient = {
  name: string;
  amount?: number;
  unit?: string;
  preparation?: string;
};

export function IngredientsList(props: { ingredients: Ingredient[] }) {
  return (
    <ul className="space-y-2">
      {props.ingredients.map((ingredient, index) => (
        <li
          key={`${index}-${ingredient.name}-${ingredient.amount}-${ingredient.unit}`}
          className="flex items-start gap-2"
        >
          <span className="text-muted-foreground mt-1">•</span>
          <span className="capitalize">
            {ingredient.amount ? (
              <span className="font-medium">{ingredient.amount}</span>
            ) : null}
            {ingredient.unit ? ` ${ingredient.unit}` : null}
            {ingredient.name ? ` ${ingredient.name}` : null}
            {ingredient.preparation ? (
              <span className="text-muted-foreground italic">
                , {ingredient.preparation}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
