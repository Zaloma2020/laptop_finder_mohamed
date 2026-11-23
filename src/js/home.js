// home.js - live statistics and featured laptops for index.html.
import { fetchLaptops } from "./api.js";
import { getFavorites } from "./storage.js";
import {
  bindFavoriteButtons,
  createLaptopCard,
  formatPrice,
  renderError,
  renderLayout,
  renderSkeletons,
} from "./ui.js";

renderLayout("home");

const statsEl = document.getElementById("stats");
const featuredEl = document.getElementById("featured");

// reduce() calculates every statistic in one pass over the data.
const calculateStats = (laptops) =>
  laptops.reduce(
    (stats, l) => ({
      count: stats.count + 1,
      lowestPrice: Math.min(stats.lowestPrice, l.price),
      batteryTotal: stats.batteryTotal + l.batteryHours,
    }),
    { count: 0, lowestPrice: Infinity, batteryTotal: 0 }
  );

const statCard = (label, value, id = "") => `
  <div class="laptop-card p-5">
    <p class="text-sm text-muted">${label}</p>
    <p ${id ? `id="${id}"` : ""} class="mt-1 text-3xl font-extrabold text-accent">${value}</p>
  </div>`;

const updateFavoritesStat = () => {
  const el = document.getElementById("stat-favorites");
  if (el) el.textContent = getFavorites().length;
};

async function init() {
  renderSkeletons(featuredEl, 3);
  try {
    const laptops = await fetchLaptops();
    const stats = calculateStats(laptops);
    const averageBattery = (stats.batteryTotal / stats.count).toFixed(1);

    statsEl.innerHTML = [
      statCard("Laptops in the catalogue", stats.count),
      statCard("Lowest price", formatPrice(stats.lowestPrice)),
      statCard("Average battery life", `${averageBattery} h`),
      statCard("Saved favorites", getFavorites().length, "stat-favorites"),
    ].join("");

    // Three longest-lasting laptops, sorted on a copy of the array.
    const featured = [...laptops].sort((a, b) => b.batteryHours - a.batteryHours).slice(0, 3);
    featuredEl.innerHTML = featured.map((l) => createLaptopCard(l)).join("");
  } catch (error) {
    statsEl.innerHTML = "";
    renderError(featuredEl, error.message, init);
  }
}

bindFavoriteButtons(featuredEl);
window.addEventListener("favorites-changed", updateFavoritesStat);
init();
