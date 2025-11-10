import { showRecipeDetail } from './recipeDetail.js';

const LOCAL_KEY = 'spicesync_favorites_v1';

const favoritesPanel = document.getElementById('favorites-panel');
const toggleFavsBtn = document.getElementById('toggle-favorites');
const closeFavsBtn = document.getElementById('close-favorites');
const favoritesListEl = document.getElementById('favorites-list');
const noFavsEl = document.getElementById('no-favs');
const clearFavsBtn = document.getElementById('clear-favs');
const exportFavsBtn = document.getElementById('export-favs');
const favCountEl = document.getElementById('fav-count');

// ----------------- Favorite Utilities -----------------
export function recipeId(recipe) {
  const ingNames = JSON.stringify(
    (recipe.ingredients || []).map(i => typeof i === 'string' ? i : (i.name || ''))
  );
  return `${(recipe.title || '').trim()}|${ingNames}`;
}

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

export function saveFavorites(arr) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
    updateFavoritesCount();
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

export function isFavorited(recipe) {
  const id = recipeId(recipe);
  return loadFavorites().some(r => recipeId(r) === id);
}

export function addFavorite(recipe) {
  const favorites = loadFavorites();
  const id = recipeId(recipe);
  if (favorites.some(r => recipeId(r) === id)) return false;
  favorites.unshift(recipe);
  saveFavorites(favorites);
  renderFavoritesList();
  return true;
}

export function removeFavorite(recipe) {
  const favorites = loadFavorites();
  const id = recipeId(recipe);
  saveFavorites(favorites.filter(r => recipeId(r) !== id));
  renderFavoritesList();
}

export function clearFavorites() {
  if (!confirm('Clear all favorites?')) return;
  saveFavorites([]);
  renderFavoritesList();
}

export function exportFavorites() {
  const favorites = loadFavorites();
  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spicesync_favorites.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function updateFavoritesCount() {
  favCountEl.textContent = loadFavorites().length;
}

export function renderFavoritesList() {
  const favorites = loadFavorites();
  favoritesListEl.innerHTML = '';
  updateFavoritesCount();

  if (!favorites.length) {
    noFavsEl.style.display = 'block';
    return;
  } else {
    noFavsEl.style.display = 'none';
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
      hideFavoritesPanel(); // close panel when viewing
    });

    item.querySelector('.remove').addEventListener('click', () => removeFavorite(fav));

    favoritesListEl.appendChild(item);
  });
}

// ----------------- Toggle Favorites Panel -----------------
export function showFavoritesPanel() {
  favoritesPanel.classList.add('visible');
  renderFavoritesList();
}

export function hideFavoritesPanel() {
  favoritesPanel.classList.remove('visible');
}

// ----------------- Event Listeners -----------------
if (toggleFavsBtn) toggleFavsBtn.addEventListener('click', showFavoritesPanel);
if (closeFavsBtn) closeFavsBtn.addEventListener('click', hideFavoritesPanel);
if (clearFavsBtn) clearFavsBtn.addEventListener('click', clearFavorites);
if (exportFavsBtn) exportFavsBtn.addEventListener('click', exportFavorites);

// Initial render
renderFavoritesList();
updateFavoritesCount();
