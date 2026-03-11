import {
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiRequest } from "../api/client";
import type { MealConsumption, MealEvent, Recipe, RecipeRating } from "../types";
import { useFeedback } from "../ui/FeedbackProvider";

export const FoodPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealEvents, setMealEvents] = useState<MealEvent[]>([]);
  const [consumptions, setConsumptions] = useState<MealConsumption[]>([]);
  const [recipeRatings, setRecipeRatings] = useState<Record<number, RecipeRating[]>>({});
  const [visibleRecipeRatings, setVisibleRecipeRatings] = useState<Record<number, boolean>>({});
  const { showToast, withSplash } = useFeedback();

  const [recipeName, setRecipeName] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");

  const [mealTitle, setMealTitle] = useState("");
  const [mealRecipeId, setMealRecipeId] = useState("");
  const [madeAt, setMadeAt] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [expiresAt, setExpiresAt] = useState("");
  const [mealNotes, setMealNotes] = useState("");

  const [consumptionMealEventId, setConsumptionMealEventId] = useState("");
  const [consumerName, setConsumerName] = useState("");
  const [consumedAt, setConsumedAt] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [rating, setRating] = useState("7");
  const [activeTab, setActiveTab] = useState(0);
  const [showAddRecipeForm, setShowAddRecipeForm] = useState(false);

  const formatMealEventOption = (event: MealEvent): string => {
    const expiryLabel = event.expiresAt
      ? ` | Expires ${dayjs(event.expiresAt).format("MMM D, YYYY h:mm A")}`
      : "";
    return `${event.title} - ${dayjs(event.madeAt).format("MMM D, YYYY h:mm A")}${expiryLabel}`;
  };

  const getMealTitle = (mealEventId: number): string => {
    const event = mealEvents.find((mealEvent) => mealEvent.id === mealEventId);
    return event?.title ?? `Meal #${mealEventId}`;
  };

  const availablePreppedMeals = useMemo(() => {
    const consumedMealIds = new Set(consumptions.map((consumption) => consumption.mealEventId));
    return mealEvents.filter((mealEvent) => !consumedMealIds.has(mealEvent.id));
  }, [consumptions, mealEvents]);

  const isMealExpired = (mealEvent: MealEvent): boolean => {
    if (!mealEvent.expiresAt) {
      return false;
    }
    return dayjs(mealEvent.expiresAt).isBefore(dayjs());
  };

  useEffect(() => {
    if (!consumptionMealEventId) {
      return;
    }
    const stillAvailable = availablePreppedMeals.some(
      (mealEvent) => String(mealEvent.id) === consumptionMealEventId,
    );
    if (!stillAvailable) {
      setConsumptionMealEventId("");
    }
  }, [availablePreppedMeals, consumptionMealEventId]);

  const loadAll = async (withBlockingSplash = false) => {
    const operation = async () => {
      const [nextRecipes, nextMealEvents, nextConsumptions] = await Promise.all([
        apiRequest<Recipe[]>("/recipes"),
        apiRequest<MealEvent[]>("/meals"),
        apiRequest<MealConsumption[]>("/meals/consumptions"),
      ]);
      setRecipes(nextRecipes);
      setMealEvents(nextMealEvents);
      setConsumptions(nextConsumptions);
    };

    try {
      if (withBlockingSplash) {
        await withSplash("Loading food data...", operation);
      } else {
        await operation();
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  useEffect(() => {
    void loadAll(true);
  }, []);

  const createRecipe = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await withSplash("Saving recipe...", () =>
        apiRequest("/recipes", {
          method: "POST",
          body: { name: recipeName, ingredientsText, instructionsText },
        }),
      );
      setRecipeName("");
      setIngredientsText("");
      setInstructionsText("");
      setShowAddRecipeForm(false);
      await loadAll();
      showToast("Recipe saved.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const deleteRecipe = async (id: number) => {
    try {
      await withSplash("Deleting recipe...", () => apiRequest(`/recipes/${id}`, { method: "DELETE" }));
      await loadAll();
      showToast("Recipe deleted.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const toggleRecipeRatings = async (recipeId: number) => {
    const currentlyVisible = Boolean(visibleRecipeRatings[recipeId]);
    setVisibleRecipeRatings((current) => ({
      ...current,
      [recipeId]: !currentlyVisible,
    }));

    if (!currentlyVisible && !recipeRatings[recipeId]) {
      try {
        const ratings = await apiRequest<RecipeRating[]>(`/recipes/${recipeId}/ratings`);
        setRecipeRatings((current) => ({
          ...current,
          [recipeId]: ratings,
        }));
      } catch (err) {
        showToast((err as Error).message, "error");
      }
    }
  };

  const createMealEvent = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await withSplash("Saving prepped meal...", () =>
        apiRequest("/meals", {
          method: "POST",
          body: {
            title: mealTitle,
            recipeId: mealRecipeId ? Number(mealRecipeId) : null,
            madeAt: new Date(madeAt).toISOString(),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            notes: mealNotes || undefined,
          },
        }),
      );
      setMealTitle("");
      setMealRecipeId("");
      setExpiresAt("");
      setMealNotes("");
      await loadAll();
      showToast("Prepped meal recorded.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const markConsumed = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await withSplash("Saving consumption...", () =>
        apiRequest("/meals/consume", {
          method: "POST",
          body: {
            mealEventId: Number(consumptionMealEventId),
            consumerName,
            consumedAt: new Date(consumedAt).toISOString(),
            rating: Number(rating),
          },
        }),
      );
      setConsumptionMealEventId("");
      setConsumerName("");
      setRating("7");
      await loadAll();
      showToast("Consumption recorded.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Food</Typography>

      <Paper sx={{ p: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, nextValue: number) => setActiveTab(nextValue)}
          variant="fullWidth"
        >
          <Tab label="Recipes" />
          <Tab label="Meals Created" />
          <Tab label="Available for Consumption" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          <Paper sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => setShowAddRecipeForm((current) => !current)}>
              {showAddRecipeForm ? "Hide form" : "Add new recipe"}
            </Button>
            <Collapse in={showAddRecipeForm}>
              <Stack component="form" spacing={2} onSubmit={createRecipe} sx={{ mt: 2 }}>
                <TextField
                  label="Recipe name"
                  required
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                />
                <TextField
                  label="Ingredients"
                  multiline
                  minRows={3}
                  required
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                />
                <TextField
                  label="Instructions"
                  multiline
                  minRows={3}
                  required
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                />
                <Button type="submit" variant="contained">
                  Save recipe
                </Button>
              </Stack>
            </Collapse>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recipes</Typography>
            <List>
              {recipes.map((recipe) => (
                <Box key={recipe.id}>
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button onClick={() => void toggleRecipeRatings(recipe.id)}>
                          {visibleRecipeRatings[recipe.id] ? "Hide ratings" : "View ratings"}
                        </Button>
                        <Button color="error" onClick={() => deleteRecipe(recipe.id)}>
                          Delete
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={recipe.name}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" sx={{ display: "block" }}>
                            Average rating:{" "}
                            {recipe.averageRating != null ? `${recipe.averageRating.toFixed(2)} / 10` : "No ratings yet"}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ display: "block" }}>
                            Ingredients: {recipe.ingredientsText}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ display: "block" }}>
                            Instructions: {recipe.instructionsText}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Collapse in={Boolean(visibleRecipeRatings[recipe.id])} timeout="auto">
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Ratings history
                      </Typography>
                      {(recipeRatings[recipe.id] ?? []).length === 0 ? (
                        <Typography variant="body2">No ratings for this recipe yet.</Typography>
                      ) : (
                        <Stack spacing={0.75}>
                          {(recipeRatings[recipe.id] ?? []).map((ratingEntry) => (
                            <Typography key={ratingEntry.id} variant="body2">
                              {ratingEntry.rating}/10 by {ratingEntry.consumerName} on{" "}
                              {dayjs(ratingEntry.consumedAt).format("MMM D, YYYY h:mm A")} ({ratingEntry.mealTitle})
                            </Typography>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </List>
          </Paper>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Mark meal as made
            </Typography>
            <Stack component="form" spacing={2} onSubmit={createMealEvent}>
              <TextField
                select
                label="Recipe (optional)"
                value={mealRecipeId}
                onChange={(e) => {
                  const nextRecipeId = e.target.value;
                  setMealRecipeId(nextRecipeId);

                  if (!mealTitle && nextRecipeId) {
                    const selectedRecipe = recipes.find((recipe) => String(recipe.id) === nextRecipeId);
                    if (selectedRecipe) {
                      setMealTitle(selectedRecipe.name);
                    }
                  }
                }}
              >
                <MenuItem value="">No linked recipe</MenuItem>
                {recipes.map((recipe) => (
                  <MenuItem key={recipe.id} value={String(recipe.id)}>
                    {recipe.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Meal title" required value={mealTitle} onChange={(e) => setMealTitle(e.target.value)} />
              <TextField
                label="Made at"
                type="datetime-local"
                value={madeAt}
                onChange={(e) => setMadeAt(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Expiration date (optional)"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField label="Notes" value={mealNotes} onChange={(e) => setMealNotes(e.target.value)} />
              <Button type="submit" variant="contained">
                Save prepped meal
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Prepped meals</Typography>
            <List>
              {mealEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemText
                    primary={`${event.title} (${dayjs(event.madeAt).format("MMM D, YYYY h:mm A")})`}
                    secondary={`Recipe ID: ${event.recipeId ?? "None"}${
                      event.expiresAt ? ` | Expires: ${dayjs(event.expiresAt).format("MMM D, YYYY h:mm A")}` : ""
                    }${event.notes ? ` | Notes: ${event.notes}` : ""}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      {activeTab === 2 && (
        <>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Mark consumed
            </Typography>
            <Stack component="form" spacing={2} onSubmit={markConsumed}>
              <TextField
                select
                label="Prepped meal"
                required
                value={consumptionMealEventId}
                disabled={availablePreppedMeals.length === 0}
                onChange={(e) => setConsumptionMealEventId(e.target.value)}
                helperText={
                  availablePreppedMeals.length === 0
                    ? "No prepped meals available. Create a new one or this list is fully consumed."
                    : undefined
                }
              >
                {availablePreppedMeals.map((event) => (
                  <MenuItem
                    key={event.id}
                    value={String(event.id)}
                    sx={isMealExpired(event) ? { backgroundColor: "#f8bbd0", "&:hover": { backgroundColor: "#f48fb1" } } : undefined}
                  >
                    {formatMealEventOption(event)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Consumed by"
                required
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
              />
              <TextField
                select
                label="Meal quality (1-10)"
                required
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {Array.from({ length: 10 }, (_, index) => {
                  const score = String(index + 1);
                  return (
                    <MenuItem key={score} value={score}>
                      {score}
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField
                label="Consumed at"
                type="datetime-local"
                value={consumedAt}
                onChange={(e) => setConsumedAt(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button type="submit" variant="contained">
                Mark meal as consumed
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Meal consumptions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {consumptions.map((entry) => (
                <Box key={entry.id}>
                  <Typography variant="body2">
                    {getMealTitle(entry.mealEventId)} consumed by {entry.consumerName} (Rating: {entry.rating}/10) on{" "}
                    {dayjs(entry.consumedAt).format("MMM D, YYYY h:mm A")}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
};
