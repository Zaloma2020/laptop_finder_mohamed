// catalogue.js - laptops.html: live search, filters, sorting and result count.
import { fetchLaptops } from "./api.js";
import { filterLaptops, sortLaptops } from "./filters.js";
import {
  bindFavoriteButtons,
  createLaptopCard,
  formatPrice,
  renderEmpty,
  renderError,
  renderLayout,
  renderSkeletons,
} from "./ui.js";

renderLayout("laptops");

const grid = document.getElementById("laptop-grid");
const resultCount = document.getElementById("result-count");
const controls = {
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  maxPrice: document.getElementById("max-price"),
  minRam: document.getElementById("min-ram"),
  minBattery: document.getElementById("min-battery"),
  sort: document.getElementById("sort"),
  reset: document.getElementById("reset-filters"),
};
const priceLabel = document.getElementById("price-label");

let allLaptops = [];
let priceCeiling = 0;

// Reads the current value of every control.
const readFilters = () => ({
  search: controls.search.value,
  category: controls.category.value,
  maxPrice: Number(controls.maxPrice.value),
  minRam: Number(controls.minRam.value),
  minBattery: Number(controls.minBattery.value),
});

// Applies filter() then sort() and redraws the cards and the count.
function render() {
  const filters = readFilters();
  priceLabel.textContent = formatPrice(filters.maxPrice);

  const results = sortLaptops(filterLaptops(allLaptops, filters), controls.sort.value);
  resultCount.textContent = `Showing ${results.length} of ${allLaptops.length} laptops`;

  if (results.length === 0) {
    renderEmpty(
      grid,
      "No laptop matches your filters",
      "Try a different brand, raise the maximum price or lower the minimum RAM and battery life."
    );
    return;
  }
  grid.innerHTML = results.map((laptop) => createLaptopCard(laptop)).join("");
}

function resetFilters() {
  controls.search.value = "";
  controls.category.value = "all";
  controls.maxPrice.value = priceCeiling;
  controls.minRam.value = "0";
  controls.minBattery.value = "0";
  controls.sort.value = "default";
  render();
}

async function init() {
  renderSkeletons(grid, 6);
  resultCount.textContent = "Loading laptops...";
  try {
    allLaptops = await fetchLaptops();

    // The price slider range comes from the data itself.
    priceCeiling = Math.ceil(Math.max(...allLaptops.map((l) => l.price)) / 100) * 100;
    controls.maxPrice.max = priceCeiling;
    controls.maxPrice.value = priceCeiling;
    render();
  } catch (error) {
    resultCount.textContent = "Laptops could not be loaded";
    renderError(grid, error.message, init);
  }
}

// "input" fires on every keystroke, so search updates while typing.
["search", "category", "maxPrice", "minRam", "minBattery", "sort"].forEach((name) => {
  const eventName = controls[name].tagName === "SELECT" ? "change" : "input";
  controls[name].addEventListener(eventName, () => allLaptops.length && render());
});
// Pressing Enter in the search box must not reload the page.
document.getElementById("filters").addEventListener("submit", (event) => event.preventDefault());
controls.reset.addEventListener("click", () => allLaptops.length && resetFilters());
bindFavoriteButtons(grid);
init();
