// ui.js - shared interface helpers: header/footer, laptop card, skeletons, messages.
import { formatPrice } from "./compare.js";
import { getFavorites, isFavorite, toggleFavorite } from "./storage.js";
import { THEMES, restoreTheme, toggleTheme } from "./theme.js";

export { formatPrice };

// Escapes text before it goes into a template literal.
export const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Header, navigation, theme switch, footer ---------- */
const PAGES = [
  { id: "home", href: "index.html", label: "Home" },
  { id: "laptops", href: "laptops.html", label: "Laptops" },
  { id: "favorites", href: "favorites.html", label: "Favorites", badge: true },
  { id: "compare", href: "compare.html", label: "Compare" },
];

const navLink = (page, active) => `
  <a href="${page.href}" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent ${
    page.id === active ? "bg-accent/15 text-accent" : "text-ink"
  }" ${page.id === active ? 'aria-current="page"' : ""}>
    ${page.label}
    ${page.badge ? '<span class="fav-count rounded-full bg-accent px-2 text-xs font-bold text-accent-ink">0</span>' : ""}
  </a>`;

const themeButtonHtml = (name) =>
  `<span aria-hidden="true">${THEMES[name].icon}</span><span class="hidden sm:inline">${THEMES[name].label} Mode</span>`;

// Builds header + footer on every page, restores the theme and wires the toggles.
export function renderLayout(activePage) {
  const themeName = restoreTheme();

  document.getElementById("site-header").innerHTML = `
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <a href="index.html" class="text-lg font-extrabold tracking-tight">Laptop<span class="text-accent">Finder</span></a>
      <nav class="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        ${PAGES.map((p) => navLink(p, activePage)).join("")}
      </nav>
      <div class="flex items-center gap-2">
        <button id="theme-toggle" type="button" class="btn-ghost" aria-label="Switch theme">${themeButtonHtml(themeName)}</button>
        <button id="menu-toggle" type="button" class="btn-ghost md:hidden" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle menu">☰</button>
      </div>
    </div>
    <nav id="mobile-menu" class="hidden flex-col gap-1 border-t border-line px-4 py-2 sm:px-6 md:hidden" aria-label="Mobile navigation">
      ${PAGES.map((p) => navLink(p, activePage)).join("")}
    </nav>`;

  document.getElementById("site-footer").innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-6 text-sm text-muted sm:px-6 lg:px-8">
      Student Laptop Finder &middot; Sample data for a JavaScript &amp; Tailwind CSS assignment
    </div>`;

  // Collapsing menu on small screens
  const menu = document.getElementById("mobile-menu");
  const menuToggle = document.getElementById("menu-toggle");
  menuToggle.addEventListener("click", () => {
    const open = menu.classList.toggle("hidden") === false;
    menu.classList.toggle("flex", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  // Theme switch
  document.getElementById("theme-toggle").addEventListener("click", (event) => {
    event.currentTarget.innerHTML = themeButtonHtml(toggleTheme());
  });

  // Favorites badge follows changes on this page and in other tabs
  updateFavBadge();
  window.addEventListener("favorites-changed", updateFavBadge);
  window.addEventListener("storage", updateFavBadge);
}

export const updateFavBadge = () => {
  const count = getFavorites().length;
  document.querySelectorAll(".fav-count").forEach((el) => (el.textContent = count));
};

/* ---------- Laptop card (reused on home, catalogue and favorites) ---------- */
const favLabel = (saved, removable) => (removable ? "✕ Remove" : saved ? "♥ Saved" : "♡ Save");

export const favButtonHtml = (id, saved, removable = false) => `
  <button type="button" class="btn-ghost" data-action="favorite" data-id="${id}"
    data-removable="${removable}" aria-pressed="${saved}">${favLabel(saved, removable)}</button>`;

export const createLaptopCard = (laptop, { removable = false } = {}) => `
  <article class="laptop-card" data-card-id="${laptop.id}">
    <a href="details.html?id=${laptop.id}" class="block aspect-[4/3] overflow-hidden bg-page" tabindex="-1" aria-hidden="true">
      <img src="${laptop.image}" alt="" loading="lazy" class="h-full w-full object-cover transition duration-300 hover:scale-105">
    </a>
    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm font-semibold text-accent">${escapeHtml(laptop.brand)}</p>
          <h3 class="text-lg font-bold leading-tight">
            <a href="details.html?id=${laptop.id}" class="transition duration-200 hover:text-accent focus-visible:text-accent">${escapeHtml(laptop.name)}</a>
          </h3>
        </div>
        <span class="badge">${escapeHtml(laptop.category)}</span>
      </div>
      <p class="text-2xl font-extrabold">${formatPrice(laptop.price)}</p>
      <ul class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-muted">
        <li class="col-span-2 truncate" title="${escapeHtml(laptop.cpu)}">${escapeHtml(laptop.cpu)}</li>
        <li><span class="font-semibold text-ink">${laptop.ramGB} GB</span> RAM</li>
        <li><span class="font-semibold text-ink">${laptop.storageGB} GB</span> SSD</li>
        <li><span class="font-semibold text-ink">${laptop.batteryHours} h</span> battery</li>
        <li><span class="font-semibold text-ink">${laptop.weightKg} kg</span></li>
      </ul>
      <div class="mt-auto grid grid-cols-2 gap-2 pt-2">
        <a href="details.html?id=${laptop.id}" class="btn-action">Details</a>
        ${favButtonHtml(laptop.id, isFavorite(laptop.id), removable)}
      </div>
    </div>
  </article>`;

// Click handling for every favorite button inside a container (event delegation).
// onChange(id, saved) lets a page react, e.g. re-render the favorites list.
export function bindFavoriteButtons(container, onChange = () => {}) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="favorite"]');
    if (!button) return;

    const saved = toggleFavorite(button.dataset.id);
    const removable = button.dataset.removable === "true";
    button.setAttribute("aria-pressed", String(saved));
    button.textContent = favLabel(saved, removable);
    showToast(saved ? "Added to favorites" : "Removed from favorites");
    onChange(Number(button.dataset.id), saved);
  });
}

/* ---------- Loading, error and empty states ---------- */
export const skeletonCard = () => `
  <div class="laptop-card animate-pulse" aria-hidden="true">
    <div class="aspect-[4/3] bg-line"></div>
    <div class="flex flex-col gap-3 p-4">
      <div class="h-3 w-1/4 rounded bg-line"></div>
      <div class="h-5 w-3/4 rounded bg-line"></div>
      <div class="h-7 w-1/3 rounded bg-line"></div>
      <div class="grid grid-cols-2 gap-2">
        <div class="h-3 rounded bg-line"></div><div class="h-3 rounded bg-line"></div>
        <div class="h-3 rounded bg-line"></div><div class="h-3 rounded bg-line"></div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2">
        <div class="h-9 rounded-lg bg-line"></div><div class="h-9 rounded-lg bg-line"></div>
      </div>
    </div>
  </div>`;

export const renderSkeletons = (container, count = 6) => {
  container.innerHTML = Array.from({ length: count }, skeletonCard).join("");
};

export const renderError = (container, message, onRetry) => {
  container.innerHTML = `
    <div role="alert" class="col-span-full rounded-2xl border border-accent bg-card p-6 text-center">
      <p class="text-lg font-bold">Something went wrong</p>
      <p class="mx-auto mt-2 max-w-xl text-muted">${escapeHtml(message)}</p>
      ${onRetry ? '<button type="button" id="retry-button" class="btn-action mt-4">Try again</button>' : ""}
    </div>`;
  if (onRetry) document.getElementById("retry-button").addEventListener("click", onRetry);
};

export const renderEmpty = (container, title, text, linkHref, linkLabel) => {
  container.innerHTML = `
    <div class="col-span-full rounded-2xl border border-dashed border-line p-8 text-center">
      <p class="text-lg font-bold">${title}</p>
      <p class="mx-auto mt-2 max-w-md text-muted">${text}</p>
      ${linkHref ? `<a href="${linkHref}" class="btn-action mt-4">${linkLabel}</a>` : ""}
    </div>`;
};

/* ---------- Small confirmation message ---------- */
export function showToast(message) {
  document.getElementById("toast")?.remove();
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.setAttribute("role", "status");
  toast.className =
    "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-lg";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2200);
}
