// comparePage.js - compare.html: pick 2-4 favorites and compare them side by side.
import { fetchLaptops } from "./api.js";
import { buildCompareTable } from "./compare.js";
import { MAX_COMPARE, getCompareIds, getFavorites, toggleCompare } from "./storage.js";
import { escapeHtml, formatPrice, renderError, renderLayout } from "./ui.js";

renderLayout("compare");

const picker = document.getElementById("picker");
const message = document.getElementById("compare-message");
const result = document.getElementById("compare-result");

let favorites = [];

const pickerItem = (laptop, checked) => `
  <label class="laptop-card flex cursor-pointer flex-row items-center gap-3 p-3">
    <input type="checkbox" class="h-5 w-5 rounded text-accent" value="${laptop.id}" ${checked ? "checked" : ""}>
    <img src="${laptop.image}" alt="" class="h-12 w-16 rounded object-cover">
    <span class="min-w-0">
      <span class="block truncate font-semibold">${escapeHtml(laptop.name)}</span>
      <span class="text-sm text-muted">${formatPrice(laptop.price)}</span>
    </span>
  </label>`;

// Redraws the checkbox list and the comparison table from the saved selection.
function render() {
  const selectedIds = getCompareIds();
  picker.innerHTML = favorites.map((l) => pickerItem(l, selectedIds.includes(l.id))).join("");

  const selected = favorites.filter((l) => selectedIds.includes(l.id));
  if (selected.length < 2) {
    result.innerHTML = `
      <div class="rounded-2xl border border-dashed border-line p-8 text-center">
        <p class="text-lg font-bold">Select at least two laptops</p>
        <p class="mx-auto mt-2 max-w-md text-muted">Tick two to ${MAX_COMPARE} favorites above to see them side by side.</p>
      </div>`;
    return;
  }
  result.innerHTML = `<div class="overflow-x-auto rounded-2xl border border-line bg-card">${buildCompareTable(selected)}</div>
    <p class="mt-3 text-sm text-muted">★ marks the best value in each row: lowest price and weight, highest RAM, storage and battery life.</p>`;
}

picker.addEventListener("change", (event) => {
  const checkbox = event.target;
  const outcome = toggleCompare(checkbox.value);

  if (!outcome.ok) {
    // A fifth laptop is blocked.
    checkbox.checked = false;
    message.textContent = `You can compare at most ${MAX_COMPARE} laptops. Untick one to add another.`;
    return;
  }
  message.textContent = "";
  render();
});

async function init() {
  try {
    const laptops = await fetchLaptops();
    const ids = getFavorites();
    favorites = laptops.filter((l) => ids.includes(l.id));

    if (favorites.length === 0) {
      picker.innerHTML = `
        <div class="col-span-full rounded-2xl border border-dashed border-line p-8 text-center">
          <p class="text-lg font-bold">You have no favorites to compare</p>
          <p class="mx-auto mt-2 max-w-md text-muted">Save at least two laptops first, then come back here.</p>
          <a href="laptops.html" class="btn-action mt-4">Browse laptops</a>
        </div>`;
      result.innerHTML = "";
      return;
    }
    render();
  } catch (error) {
    renderError(picker, error.message, init);
  }
}

init();
