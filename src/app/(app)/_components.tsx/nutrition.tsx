type Nutrition = Partial<{
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}>;

export function Nutrition({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {nutrition.calories && (
        <div>
          <p className="text-sm text-muted-foreground">Calories</p>
          <p className="font-medium">{nutrition.calories}</p>
        </div>
      )}
      {nutrition.protein && (
        <div>
          <p className="text-sm text-muted-foreground">Protein</p>
          <p className="font-medium">{nutrition.protein}g</p>
        </div>
      )}
      {nutrition.fat && (
        <div>
          <p className="text-sm text-muted-foreground">Fat</p>
          <p className="font-medium">{nutrition.fat}g</p>
        </div>
      )}
      {nutrition.carbohydrates && (
        <div>
          <p className="text-sm text-muted-foreground">Carbs</p>
          <p className="font-medium">{nutrition.carbohydrates}g</p>
        </div>
      )}
    </div>
  );
}
