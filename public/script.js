// public/script.js
const generateBtn = document.getElementById('generate');
const ingredientsInput = document.getElementById('ingredients');
const cuisineSelect = document.getElementById('cuisine');

// Output containers
const recipeListEl = document.getElementById('recipe-list');
const recipeDetailEl = document.getElementById('recipe-detail');
const rawOutput = document.getElementById('raw-output');

async function generateRecipe() {
  const ingredients = ingredientsInput.value.trim();
  const cuisine = cuisineSelect.value || 'any';
  if (!ingredients) {
    alert('Please enter at least one ingredient');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, cuisine })
    });

    const json = await resp.json();
    if (!resp.ok || !json.success) {
      console.error('API error', json);
      recipeListEl.innerHTML = `<p>Error: ${json?.error || 'unknown error'}</p>`;
      rawOutput.style.display = 'block';
      rawOutput.textContent = JSON.stringify(json, null, 2);
      return;
    }

    const recipes = json.recipes;
    rawOutput.style.display = 'none';

    // Clear containers
    recipeListEl.innerHTML = '';
    recipeDetailEl.innerHTML = '';

    if (!recipes || recipes.length === 0) {
      recipeListEl.innerHTML = '<p>No recipes generated.</p>';
      return;
    }

    // Create recipe cards
    recipes.forEach((recipe) => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <h3>${recipe.title || 'Untitled recipe'}</h3>
        <p>${recipe.time_minutes ? recipe.time_minutes + ' mins • ' : ''}${recipe.servings ? recipe.servings + ' servings' : ''}</p>
      `;
      card.addEventListener('click', () => showRecipeDetail(recipe));
      recipeListEl.appendChild(card);
    });

  } catch (err) {
    console.error('Network error', err);
    recipeListEl.innerHTML = `<p>Network error: ${err.message}</p>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Recipes';
  }
}

function showRecipeDetail(recipe) {
  recipeDetailEl.innerHTML = `
    <h2>${recipe.title}</h2>
    <p>${recipe.servings ? recipe.servings + ' servings • ' : ''}${recipe.time_minutes ? recipe.time_minutes + ' mins' : ''}</p>
    <h3>Ingredients</h3>
    <ul>${(recipe.ingredients || []).map(i => `<li>${i.quantity ? i.quantity + ' ' : ''}${i.name || i}</li>`).join('')}</ul>
    <h3>Steps</h3>
    <ol>${(recipe.steps || []).map(s => `<li>${s}</li>`).join('')}</ol>
    ${recipe.notes ? `<h3>Notes</h3><p>${recipe.notes}</p>` : ''}
  `;
}

generateBtn.addEventListener('click', generateRecipe);
