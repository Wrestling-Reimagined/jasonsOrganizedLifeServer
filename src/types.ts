export type User = {
  id: number;
  email: string;
};

export type Recipe = {
  id: number;
  name: string;
  ingredientsText: string;
  instructionsText: string;
  createdAt?: string;
  averageRating?: number | null;
};

export type MealEvent = {
  id: number;
  recipeId: number | null;
  title: string;
  madeAt: string;
  expiresAt?: string | null;
  notes?: string | null;
};

export type MealConsumption = {
  id: number;
  mealEventId: number;
  consumerName: string;
  consumedAt: string;
  rating: number;
};

export type RecipeRating = {
  id: number;
  consumerName: string;
  consumedAt: string;
  rating: number;
  mealTitle: string;
};

export type Payment = {
  id: number;
  amount: number;
  paidAt: string;
  category: string;
  notes?: string | null;
};
