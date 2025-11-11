import { isFavorited, addFavorite, removeFavorite } from './favorites.js';
import { getSelectedLanguage } from './api.js';

// Escape HTML utility
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Optional: simple translation map (example, extend as needed)


// Translate text based on selected language
function translate(text) {
  return text;
}

export function showRecipeDetail(recipe) {
  const recipeDetailEl = document.getElementById('recipe-detail');

  const ingHtml = (recipe.ingredients || []).map(i =>
    typeof i === 'string'
      ? `<li>${escapeHtml(translate(i))}</li>`
      : `<li>${i.quantity ? escapeHtml(i.quantity + ' ') : ''}${escapeHtml(translate(i.name || ''))}</li>`
  ).join('');

  const stepsHtml = (recipe.steps || []).map(s => `<li>${escapeHtml(translate(s))}</li>`).join('');

  const favorited = isFavorited(recipe);

  recipeDetailEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <div>
        <h2>${escapeHtml(translate(recipe.title))}</h2>
        <p class="muted">
          ${recipe.servings ? recipe.servings + ' servings • ' : ''}
          ${recipe.time_minutes ? recipe.time_minutes + ' mins' : ''}
        </p>
      </div>
      <div>
        <button id="fav-toggle-btn" class="btn ${favorited ? 'danger' : 'primary'}">
          ${favorited ? 'Remove from favorites' : 'Save to favorites'}
        </button>
      </div>
    </div>

    <h3>Ingredients</h3>
    <ul>${ingHtml}</ul>

    <h3>Steps</h3>
    <ol>${stepsHtml}</ol>

    ${recipe.notes ? `<h3>Notes</h3><p>${escapeHtml(translate(recipe.notes))}</p>` : ''}
  `;

  const favBtn = document.getElementById('fav-toggle-btn');
  favBtn.addEventListener('click', () => {
    if (isFavorited(recipe)) {
      removeFavorite(recipe);
      favBtn.textContent = 'Save to favorites';
      favBtn.classList.remove('danger');
      favBtn.classList.add('primary');
    } else {
      addFavorite(recipe);
      favBtn.textContent = 'Remove from favorites';
      favBtn.classList.remove('primary');
      favBtn.classList.add('danger');
    }
  });

  // Render nutrition if function exists
  if (typeof renderNutrition === 'function') renderNutrition(recipe);

  recipeDetailEl.scrollIntoView({ behavior: 'smooth' });
  window.currentRecipe = recipe;
}
