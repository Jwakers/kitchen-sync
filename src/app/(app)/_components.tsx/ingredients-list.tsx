type Ingredient = {
  name: string;
  amount: number;
  unit?: string;
  preparation?: string;
};

export function IngredientsList(props: { ingredients: Ingredient[] }) {
  return (
    <ul className="space-y-2">
      {props.ingredients.map((ingredient) => (
        <li
          key={`${ingredient.name}-${ingredient.amount}-${ingredient.unit}`}
          className="flex items-start gap-2"
        >
          <span className="text-muted-foreground mt-1">•</span>
          <span>
            <span className="font-medium">{ingredient.amount}</span>
            {ingredient.unit && ` ${ingredient.unit}`}
            {ingredient.name && ` ${ingredient.name}`}
            {ingredient.preparation && (
              <span className="text-muted-foreground italic">
                , {ingredient.preparation}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
