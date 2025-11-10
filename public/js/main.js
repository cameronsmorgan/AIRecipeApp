import { generateRecipe } from './api.js';
import { showFavoritesPanel, clearFavorites, exportFavorites, updateFavoritesCount, renderFavoritesList } from './favorites.js';
import { initOptions } from './options.js';

initOptions();

// ----------------- DOM Elements -----------------
const generateBtn = document.getElementById('generate');
const toggleFavsBtn = document.getElementById('toggle-favorites');
const clearFavsBtn = document.getElementById('clear-favs');
const exportFavsBtn = document.getElementById('export-favs');

// ----------------- Event Bindings -----------------
if (generateBtn) generateBtn.addEventListener('click', generateRecipe);
if (clearFavsBtn) clearFavsBtn.addEventListener('click', clearFavorites);
if (exportFavsBtn) exportFavsBtn.addEventListener('click', exportFavorites);
if (toggleFavsBtn) {
  toggleFavsBtn.addEventListener('click', showFavoritesPanel);
}

// The toggle button is now handled inside favorites.js
// So no need to bind toggleFavoritesPanel here

// Attach click events to all option cards
document.getElementById('generate').addEventListener('click', generateRecipe);



document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    if (typeof window.selectOptionCard === 'function') {
      window.selectOptionCard(card);
    }
  });
});

// ----------------- Init -----------------
updateFavoritesCount();
renderFavoritesList();
