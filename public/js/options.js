import { setSelectedCuisine, setSelectedLanguage } from './api.js';

export function initOptions() {
  document.addEventListener('click', (ev) => {
    const card = ev.target.closest('.option-card');
    if (!card) return;

    const type = card.dataset.type;
    if (!type) return;

    // Deselect all cards of the same type
    document.querySelectorAll(`.option-card[data-type="${type}"]`).forEach(c => c.classList.remove('selected'));

    // Select the clicked card
    card.classList.add('selected');

    // Update state in api.js
    if (type === 'cuisine') setSelectedCuisine(card.dataset.value);
    if (type === 'language') setSelectedLanguage(card.dataset.value);

    // Optional: dispatch an event if other parts of your app need to react
    window.dispatchEvent(new CustomEvent('options:changed', {
      detail: { type, value: card.dataset.value }
    }));
  });
}
