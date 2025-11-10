// nutrition.js
let nutritionMode = "per_serving"; // default

// Toggle handler
function toggleNutritionMode() {
  nutritionMode = nutritionMode === "per_serving" ? "per_recipe" : "per_serving";
  const activeRecipe = window.currentRecipe;
  if (activeRecipe) renderNutrition(activeRecipe);
}

// Render nutrition info
function renderNutrition(recipe) {
  const container = document.getElementById("nutrition");
  if (!recipe.nutrition) {
    container.innerHTML = "<p>No nutrition info available.</p>";
    return;
  }

  const { calories, protein_g, carbs_g, fat_g } = recipe.nutrition;
  const servings = recipe.servings || 1;

  const factor = nutritionMode === "per_serving" ? 1 : servings;
  const label = nutritionMode === "per_serving" ? "Per Serving" : "Whole Recipe";

  container.innerHTML = `
    <h3>Nutrition (${label})</h3>
    <ul>
      <li>Calories: ${(calories * factor).toFixed(0)} kcal</li>
      <li>Protein: ${(protein_g * factor).toFixed(1)} g</li>
      <li>Carbs: ${(carbs_g * factor).toFixed(1)} g</li>
      <li>Fat: ${(fat_g * factor).toFixed(1)} g</li>
    </ul>
    <button id="toggle-nutrition">Switch to ${nutritionMode === "per_serving" ? "Whole Recipe" : "Per Serving"}</button>
  `;

  // Re-attach toggle button event
  document.getElementById("toggle-nutrition").addEventListener("click", toggleNutritionMode);
}
