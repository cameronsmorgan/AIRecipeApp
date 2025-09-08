// public/script.js
const generateBtn = document.getElementById('generate');
const ingredientsInput = document.getElementById('ingredients');
const cuisineSelect = document.getElementById('cuisine');

const titleEl = document.getElementById('recipe-title');
const metaEl = document.getElementById('recipe-meta');
const ingList = document.getElementById('ingredients-list');
const stepsList = document.getElementById('steps-list');
const rawOutput = document.getElementById('raw-output');

async function generateRecipe() {
  const ingredients = ingredientsInput.value.trim();
  const cuisine = cuisineSelect.value || 'any';
  if (!ingredients) {
    alert('Please enter at least one ingredient');
    return;
  }

  // UI: disable button
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
      titleEl.textContent = 'Error generating recipe';
      metaEl.textContent = (json?.error || JSON.stringify(json));
      rawOutput.style.display = 'block';
      rawOutput.textContent = JSON.stringify(json, null, 2);
      return;
    }

    const out = json.output;
    rawOutput.style.display = 'none';
    // If we get a raw string (fallback), show it
    if (out?.raw) {
      titleEl.textContent = 'Generated (raw text)';
      metaEl.textContent = '';
      ingList.innerHTML = '';
      stepsList.innerHTML = '';
      rawOutput.style.display = 'block';
      rawOutput.textContent = out.raw;
      return;
    }

    // Normal structured object
    titleEl.textContent = out.title || 'Untitled recipe';
    metaEl.textContent = `${out.servings ? out.servings + ' servings' : ''} ${out.time_minutes ? ' • ' + out.time_minutes + ' mins' : ''}`;

    // ingredients
    ingList.innerHTML = '';
    if (Array.isArray(out.ingredients)) {
      out.ingredients.forEach(i => {
        const li = document.createElement('li');
        if (typeof i === 'string') li.textContent = i;
        else {
          li.textContent = (i.quantity ? i.quantity + ' ' : '') + (i.name || '');
        }
        ingList.appendChild(li);
      });
    }

    // steps
    stepsList.innerHTML = '';
    if (Array.isArray(out.steps)) {
      out.steps.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        stepsList.appendChild(li);
      });
    }

  } catch (err) {
    console.error('Network error', err);
    titleEl.textContent = 'Network error';
    metaEl.textContent = err.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Recipe';
  }
}

generateBtn.addEventListener('click', generateRecipe);
