// api.js - the only file that talks to the JSON data.

let cache = null; // keeps the data so each page requests the file only once

// Loads every laptop from data/laptops.json.
// The path is relative to the HTML page that imports this module.
export async function fetchLaptops() {
  if (cache) return cache;

  try {
    const response = await fetch("data/laptops.json");
    if (!response.ok) {
      throw new Error(`Server answered with status ${response.status}`);
    }
    cache = await response.json();
    return cache;
  } catch (error) {
    // Re-throw with a readable message; each page decides how to show it.
    throw new Error(
      `Could not load the laptop data. Run the site from a local server (for example VS Code Live Server). ${error.message}`
    );
  }
}

// Finds one laptop by its numeric id, or returns undefined.
export const findLaptopById = (laptops, id) =>
  laptops.find((laptop) => laptop.id === Number(id));
