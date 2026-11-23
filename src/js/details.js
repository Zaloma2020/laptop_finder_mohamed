// details.js - details.html?id=7 : full specifications of one laptop.
import { fetchLaptops, findLaptopById } from "./api.js";
import { SPEC_ROWS } from "./compare.js";
import { MAX_COMPARE, isFavorite, isInCompare, toggleCompare, toggleFavorite } from "./storage.js";
import { escapeHtml, formatPrice, renderError, renderLayout, showToast } from "./ui.js";

renderLayout("laptops");

const app = document.getElementById("details");

const skeleton = () => {
  app.innerHTML = `
    <div class="grid animate-pulse gap-8 md:grid-cols-2" aria-hidden="true">
      <div class="aspect-[4/3] rounded-2xl bg-line"></div>
      <div class="space-y-4">
        <div class="h-4 w-1/4 rounded bg-line"></div>
        <div class="h-8 w-3/4 rounded bg-line"></div>
        <div class="h-8 w-1/3 rounded bg-line"></div>
        <div class="h-24 rounded bg-line"></div>
      </div>
    </div>`;
};

const messageBox = (title, text) => {
  app.innerHTML = `
    <div class="rounded-2xl border border-dashed border-line p-8 text-center">
      <p class="text-lg font-bold">${title}</p>
      <p class="mx-auto mt-2 max-w-md text-muted">${text}</p>
      <a href="laptops.html" class="btn-action mt-4">Browse all laptops</a>
    </div>`;
};

const favoriteLabel = (id) => (isFavorite(id) ? "♥ Saved to favorites" : "♡ Add to favorites");
const compareLabel = (id) => (isInCompare(id) ? "✕ Remove from comparison" : "⇄ Add to comparison");

function renderLaptop(laptop) {
  // Every field of the laptop becomes a table row (map).
  const rows = [...SPEC_ROWS, { label: "Laptop ID", key: "id", format: (v) => `#${v}` }]
    .map(
      (row) => `
      <tr class="border-t border-line">
        <th scope="row" class="w-2/5 p-3 text-left text-sm font-semibold text-muted">${row.label}</th>
        <td class="p-3 ${row.key === "category" ? "capitalize" : ""}">${escapeHtml(row.format(laptop[row.key]))}</td>
      </tr>`
    )
    .join("");

  app.innerHTML = `
    <a href="laptops.html" class="text-sm font-semibold text-accent hover:underline">&larr; Back to laptops</a>
    <div class="mt-4 grid gap-8 md:grid-cols-2">
      <img src="${laptop.image}" alt="${escapeHtml(laptop.name)}" class="aspect-[4/3] w-full rounded-2xl border border-line object-cover">
      <div>
        <p class="font-semibold text-accent">${escapeHtml(laptop.brand)} <span class="badge ml-2">${escapeHtml(laptop.category)}</span></p>
        <h1 class="mt-1 text-3xl font-extrabold sm:text-4xl">${escapeHtml(laptop.name)}</h1>
        <p class="mt-3 text-4xl font-extrabold">${formatPrice(laptop.price)}</p>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" id="fav-button" class="btn-action" aria-pressed="${isFavorite(laptop.id)}">${favoriteLabel(laptop.id)}</button>
          <button type="button" id="compare-button" class="btn-ghost">${compareLabel(laptop.id)}</button>
        </div>
        <p id="compare-note" class="mt-3 min-h-6 text-sm text-muted" role="status"></p>
        <div class="prose mt-4 max-w-none">
          <h2>About this laptop</h2>
          <p>${escapeHtml(laptop.description)}</p>
          <ul>
            <li>Up to ${laptop.batteryHours} hours of battery life</li>
            <li>${laptop.weightKg} kg with a ${laptop.screenInches}-inch screen</li>
            <li>${laptop.ramGB} GB RAM and ${laptop.storageGB} GB storage</li>
          </ul>
        </div>
      </div>
    </div>
    <section class="mt-10" aria-labelledby="specs-title">
      <h2 id="specs-title" class="mb-3 text-2xl font-bold">Full specifications</h2>
      <div class="overflow-x-auto rounded-2xl border border-line bg-card">
        <table class="w-full text-sm"><tbody>${rows}</tbody></table>
      </div>
    </section>`;

  const favButton = document.getElementById("fav-button");
  const compareButton = document.getElementById("compare-button");
  const note = document.getElementById("compare-note");

  favButton.addEventListener("click", () => {
    toggleFavorite(laptop.id);
    favButton.textContent = favoriteLabel(laptop.id);
    favButton.setAttribute("aria-pressed", String(isFavorite(laptop.id)));
    compareButton.textContent = compareLabel(laptop.id);
    showToast(isFavorite(laptop.id) ? "Added to favorites" : "Removed from favorites");
  });

  compareButton.addEventListener("click", () => {
    const result = toggleCompare(laptop.id);
    if (!result.ok) {
      note.textContent = `You can compare up to ${MAX_COMPARE} laptops. Remove one on the compare page first.`;
      return;
    }
    note.innerHTML = result.inCompare
      ? 'Added to the comparison. <a class="font-semibold text-accent hover:underline" href="compare.html">Open compare page</a>'
      : "Removed from the comparison.";
    compareButton.textContent = compareLabel(laptop.id);
    favButton.textContent = favoriteLabel(laptop.id);
    favButton.setAttribute("aria-pressed", String(isFavorite(laptop.id)));
  });
}

async function init() {
  // URLSearchParams reads ?id=7 from the address bar.
  const id = new URLSearchParams(window.location.search).get("id");
  if (id === null || id.trim() === "" || Number.isNaN(Number(id))) {
    messageBox("No laptop selected", "Open a laptop from the catalogue to see its specifications.");
    return;
  }

  skeleton();
  try {
    const laptop = findLaptopById(await fetchLaptops(), id);
    if (!laptop) {
      messageBox("Laptop not found", `There is no laptop with the id "${escapeHtml(id)}".`);
      return;
    }
    document.title = `${laptop.name} - Student Laptop Finder`;
    renderLaptop(laptop);
  } catch (error) {
    renderError(app, error.message, init);
  }
}

init();
