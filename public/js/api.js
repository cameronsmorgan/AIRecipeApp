import { showRecipeDetail } from './recipeDetail.js';
import { escapeHtml } from './utils.js';

// State
let selectedCuisine = 'any';
let selectedLanguage = 'en';

export function setSelectedCuisine(value) {
  selectedCuisine = value;
}

export function setSelectedLanguage(value) {
  selectedLanguage = value;
}

export function getSelectedCuisine() {
  return selectedCuisine;
}

export function getSelectedLanguage() {
  return selectedLanguage;
}

// Main recipe generation
export async function generateRecipe() {
  const ingredientsInput = document.getElementById('ingredients');
  const recipeListEl = document.getElementById('recipe-list');
  const recipeDetailEl = document.getElementById('recipe-detail');
  const rawOutput = document.getElementById('raw-output');
  const loaderEl = document.getElementById('loader');
  const generateBtn = document.getElementById('generate');

  const ingredients = ingredientsInput.value.trim();
  if (!ingredients) {
    alert('Please enter at least one ingredient');
    return;
  }

  loaderEl?.classList.remove('hidden');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients,
        cuisine: selectedCuisine,
        language: selectedLanguage
      })
    });

    const json = await resp.json();

    if (!resp.ok || !json.success) {
      console.error('API error', json);
      recipeListEl.innerHTML = `<p>Error: ${json?.error || 'unknown error'}</p>`;
      rawOutput.style.display = 'block';
      rawOutput.textContent = JSON.stringify(json, null, 2);
      return;
    }

    const recipes = json.recipes || [];
    rawOutput.style.display = 'none';
    recipeListEl.innerHTML = '';
    recipeDetailEl.innerHTML = '';

    if (!recipes.length) {
      recipeListEl.innerHTML = '<p>No recipes generated.</p>';
      return;
    }

    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <h3>${escapeHtml(recipe.title || 'Untitled recipe')}</h3>
        <p>
          ${recipe.time_minutes ? escapeHtml(String(recipe.time_minutes)) + ' mins • ' : ''}
          ${recipe.servings ? escapeHtml(String(recipe.servings)) + ' servings' : ''}
        </p>
      `;
      card.addEventListener('click', () => showRecipeDetail(recipe));
      recipeListEl.appendChild(card);
    });
  } catch (err) {
    console.error('Network error', err);
    recipeListEl.innerHTML = `<p>Network error: ${escapeHtml(err.message || 'Unknown error')}</p>`;
  } finally {
    loaderEl?.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Recipes';
  }
}
