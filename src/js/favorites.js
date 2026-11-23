// favorites.js - favorites.html: saved laptops, remove, clear all, total and average price.
import { fetchLaptops } from "./api.js";
import { clearFavorites, getFavorites } from "./storage.js";
import {
  bindFavoriteButtons,
  createLaptopCard,
  formatPrice,
  renderEmpty,
  renderError,
  renderLayout,
  renderSkeletons,
  showToast,
} from "./ui.js";

renderLayout("favorites");

const grid = document.getElementById("favorites-grid");
const summary = document.getElementById("summary");
const clearButton = document.getElementById("clear-favorites");
const compareLink = document.getElementById("go-compare");

let allLaptops = [];

const summaryCard = (label, value) => `
  <div class="laptop-card p-5">
    <p class="text-sm text-muted">${label}</p>
    <p class="mt-1 text-3xl font-extrabold text-accent">${value}</p>
  </div>`;

function render() {
  // Favorites are stored as ids; filter() turns them back into laptop objects.
  const ids = getFavorites();
  const saved = allLaptops.filter((laptop) => ids.includes(laptop.id));

  clearButton.disabled = saved.length === 0;
  clearButton.classList.toggle("opacity-50", saved.length === 0);
  compareLink.classList.toggle("hidden", saved.length < 2);

  if (saved.length === 0) {
    summary.innerHTML = "";
    renderEmpty(
      grid,
      "You have not saved any laptops yet",
      "Tap the heart on any laptop to keep it here and compare it later.",
      "laptops.html",
      "Browse laptops"
    );
    return;
  }

  // reduce() adds up the prices; the average is total / number of laptops.
  const total = saved.reduce((sum, laptop) => sum + laptop.price, 0);
  const average = Math.round(total / saved.length);
  summary.innerHTML = [
    summaryCard("Saved laptops", saved.length),
    summaryCard("Total price", formatPrice(total)),
    summaryCard("Average price", formatPrice(average)),
  ].join("");

  grid.innerHTML = saved.map((laptop) => createLaptopCard(laptop, { removable: true })).join("");
}

async function init() {
  renderSkeletons(grid, 3);
  try {
    allLaptops = await fetchLaptops();
    render();
  } catch (error) {
    renderError(grid, error.message, init);
  }
}

// Removing a card re-renders the list so the totals stay correct.
bindFavoriteButtons(grid, () => allLaptops.length && render());

clearButton.addEventListener("click", () => {
  if (getFavorites().length && window.confirm("Remove all saved laptops?")) {
    clearFavorites();
    render();
    showToast("Favorites cleared");
  }
});

init();
