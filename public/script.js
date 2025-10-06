// public/script.js

// DOM elements
const generateBtn = document.getElementById('generate');
const ingredientsInput = document.getElementById('ingredients');
const cuisineSelect = document.getElementById('cuisine');
const languageSelect = document.getElementById('language');

const recipeListEl = document.getElementById('recipe-list');
const recipeDetailEl = document.getElementById('recipe-detail');
const rawOutput = document.getElementById('raw-output');

const toggleFavsBtn = document.getElementById('toggle-favorites');
const favCountEl = document.getElementById('fav-count');
const favoritesPanel = document.getElementById('favorites-panel');
const favoritesListEl = document.getElementById('favorites-list');
const noFavsEl = document.getElementById('no-favs');
const clearFavsBtn = document.getElementById('clear-favs');
const exportFavsBtn = document.getElementById('export-favs');

// localStorage key
const LOCAL_KEY = 'spicesync_favorites_v1';

// ----------------- Favorites utilities -----------------
function recipeId(recipe) {
  const ingNames = JSON.stringify(
    (recipe.ingredients || []).map(i =>
      typeof i === 'string' ? i : (i.name || '')
    )
  );
  return `${(recipe.title || '').trim()}|${ingNames}`;
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

function saveFavorites(arr) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
    updateFavoritesCount();
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

function isFavorited(recipe) {
  const id = recipeId(recipe);
  return loadFavorites().some(r => recipeId(r) === id);
}

function addFavorite(recipe) {
  const favorites = loadFavorites();
  const id = recipeId(recipe);
  if (favorites.some(r => recipeId(r) === id)) return false;
  const toSave = {
    title: recipe.title || 'Untitled',
    servings: recipe.servings || null,
    time_minutes: recipe.time_minutes || null,
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    notes: recipe.notes || '',
    nutrition: recipe.nutrition || null
  };
  favorites.unshift(toSave);
  saveFavorites(favorites);
  renderFavoritesList();
  return true;
}

function removeFavorite(recipe) {
  const favorites = loadFavorites();
  const id = recipeId(recipe);
  const filtered = favorites.filter(r => recipeId(r) !== id);
  saveFavorites(filtered);
  renderFavoritesList();
}

function clearFavorites() {
  if (!confirm('Clear all favorites? This cannot be undone.')) return;
  saveFavorites([]);
  renderFavoritesList();
}

function exportFavorites() {
  const favorites = loadFavorites();
  const blob = new Blob([JSON.stringify(favorites, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spicesync_favorites.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ----------------- UI: favorites rendering -----------------
function updateFavoritesCount() {
  if (!favCountEl) return;
  const favorites = loadFavorites();
  favCountEl.textContent = favorites.length;
}

function renderFavoritesList() {
  if (!favoritesListEl) return;
  const favorites = loadFavorites();
  favoritesListEl.innerHTML = '';
  updateFavoritesCount();

  if (!favorites.length) {
    if (noFavsEl) noFavsEl.style.display = 'block';
    return;
  } else {
    if (noFavsEl) noFavsEl.style.display = 'none';
  }

  favorites.forEach(fav => {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.innerHTML = `
      <div>
        <div class="favorite-title">${fav.title}</div>
        <div class="favorite-meta">
          ${fav.time_minutes ? fav.time_minutes + ' mins • ' : ''}
          ${fav.servings ? fav.servings + ' servings' : ''}
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn view">View</button>
        <button class="btn danger remove">Remove</button>
      </div>
    `;

    item.querySelector('.view').addEventListener('click', () => {
      showRecipeDetail(fav);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    item.querySelector('.remove').addEventListener('click', () => {
      removeFavorite(fav);
    });

    favoritesListEl.appendChild(item);
  });
}

function toggleFavoritesPanel() {
  if (!favoritesPanel) return;
  favoritesPanel.classList.toggle('hidden');
  renderFavoritesList();
}

// ----------------- API + rendering -----------------
async function generateRecipe() {
  const ingredients = ingredientsInput.value.trim();
  const cuisine = cuisineSelect.value || 'any';
  const language = languageSelect.value || 'en';

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
      body: JSON.stringify({ ingredients, cuisine, language })
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
        <h3>${recipe.title || 'Untitled recipe'}</h3>
        <p>
          ${recipe.time_minutes ? recipe.time_minutes + ' mins • ' : ''}
          ${recipe.servings ? recipe.servings + ' servings' : ''}
        </p>
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
  const ingHtml = (recipe.ingredients || [])
    .map(i =>
      typeof i === 'string'
        ? `<li>${i}</li>`
        : `<li>${i.quantity ? i.quantity + ' ' : ''}${i.name || ''}</li>`
    )
    .join('');

  const stepsHtml = (recipe.steps || []).map(s => `<li>${s}</li>`).join('');
  const favorited = isFavorited(recipe);

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <div>
        <h2>${recipe.title}</h2>
        <p class="muted">
          ${recipe.servings ? recipe.servings + ' servings • ' : ''}
          ${recipe.time_minutes ? recipe.time_minutes + ' mins' : ''}
        </p>
      </div>
      <div>
        <button id="fav-toggle-btn" class="btn ${
          favorited ? 'danger' : 'primary'
        }">
          ${favorited ? 'Remove from favorites' : 'Save to favorites'}
        </button>
      </div>
    </div>

    <h3>Ingredients</h3>
    <ul>${ingHtml}</ul>

    <h3>Steps</h3>
    <ol>${stepsHtml}</ol>

    ${recipe.notes ? `<h3>Notes</h3><p>${recipe.notes}</p>` : ''}
  `;

  recipeDetailEl.innerHTML = html;

  // Attach fav toggle
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

  // Nutrition
  renderNutrition(recipe);

  recipeDetailEl.scrollIntoView({ behavior: 'smooth' });
  window.currentRecipe = recipe;
}

// ----------------- Event bindings -----------------
generateBtn.addEventListener('click', generateRecipe);
if (toggleFavsBtn) toggleFavsBtn.addEventListener('click', toggleFavoritesPanel);
if (clearFavsBtn) clearFavsBtn.addEventListener('click', clearFavorites);
if (exportFavsBtn) exportFavsBtn.addEventListener('click', exportFavorites);

// Init
updateFavoritesCount();
renderFavoritesList();
