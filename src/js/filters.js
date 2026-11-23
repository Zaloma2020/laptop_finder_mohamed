// filters.js - pure functions used by the catalogue (no DOM code here).

// filter(): search by name or brand + category + max price + min RAM + min battery, all together.
export const filterLaptops = (laptops, f) => {
  const query = f.search.trim().toLowerCase();

  return laptops.filter((l) => {
    const matchesSearch =
      !query || l.name.toLowerCase().includes(query) || l.brand.toLowerCase().includes(query);
    const matchesCategory = f.category === "all" || l.category === f.category;
    const matchesPrice = l.price <= f.maxPrice;
    const matchesRam = l.ramGB >= f.minRam;
    const matchesBattery = l.batteryHours >= f.minBattery;
    return matchesSearch && matchesCategory && matchesPrice && matchesRam && matchesBattery;
  });
};

// [field, direction] for every sort option (1 = low to high, -1 = high to low)
const SORTS = {
  "price-asc": ["price", 1],
  "price-desc": ["price", -1],
  "battery-desc": ["batteryHours", -1],
  "battery-asc": ["batteryHours", 1],
  "weight-asc": ["weightKg", 1],
  "weight-desc": ["weightKg", -1],
};

// sort() on a COPY ([...laptops]) so the original array keeps its order.
export const sortLaptops = (laptops, sortKey) => {
  const copy = [...laptops];
  const rule = SORTS[sortKey];
  if (!rule) return copy;
  const [field, direction] = rule;
  return copy.sort((a, b) => (a[field] - b[field]) * direction);
};
