// compare.js - specification rows (shared by details and compare pages) and best values.

export const formatPrice = (value) => `$${value.toLocaleString("en-US")}`;

// best: "min" = lowest wins, "max" = highest wins, null = no highlight
export const SPEC_ROWS = [
  { key: "brand", label: "Brand", best: null, format: (v) => v },
  { key: "category", label: "Category", best: null, format: (v) => v },
  { key: "cpu", label: "Processor", best: null, format: (v) => v },
  { key: "price", label: "Price", best: "min", format: formatPrice },
  { key: "ramGB", label: "RAM", best: "max", format: (v) => `${v} GB` },
  {
    key: "storageGB",
    label: "Storage",
    best: "max",
    format: (v) => (v >= 1000 ? `${v / 1000} TB` : `${v} GB`),
  },
  { key: "batteryHours", label: "Battery life", best: "max", format: (v) => `${v} hours` },
  { key: "weightKg", label: "Weight", best: "min", format: (v) => `${v} kg` },
  { key: "screenInches", label: "Screen size", best: null, format: (v) => `${v} in` },
];

// Picking the best value: for every numeric row, reduce() collects the winning number
// (lowest price and weight, highest RAM, storage and battery) from the compared laptops.
export const getBestValues = (laptops) =>
  SPEC_ROWS.filter((row) => row.best).reduce((best, row) => {
    const values = laptops.map((laptop) => laptop[row.key]);
    best[row.key] = row.best === "min" ? Math.min(...values) : Math.max(...values);
    return best;
  }, {});

// Builds the comparison table: one column per laptop, same rows for all of them.
export function buildCompareTable(laptops) {
  const best = getBestValues(laptops);

  const headCells = laptops
    .map(
      (l) => `
      <th scope="col" class="min-w-44 p-3 text-left align-top">
        <img src="${l.image}" alt="" class="mb-2 aspect-[4/3] w-full rounded-lg object-cover">
        <a href="details.html?id=${l.id}" class="font-bold hover:text-accent focus-visible:text-accent">${l.name}</a>
      </th>`
    )
    .join("");

  const bodyRows = SPEC_ROWS.map((row) => {
    const cells = laptops
      .map((l) => {
        const isBest = row.best && l[row.key] === best[row.key];
        const classes = isBest
          ? "bg-accent/20 font-bold text-ink ring-1 ring-inset ring-accent"
          : "text-ink";
        const mark = isBest ? `<span class="ml-1 text-accent" title="Best value">★</span>` : "";
        return `<td class="p-3 ${classes}">${row.format(l[row.key])}${mark}</td>`;
      })
      .join("");
    return `
      <tr class="border-t border-line">
        <th scope="row" class="sticky left-0 z-10 bg-card p-3 text-left text-sm font-semibold text-muted">${row.label}</th>
        ${cells}
      </tr>`;
  }).join("");

  return `
    <table class="w-full min-w-[40rem] border-collapse text-sm">
      <thead>
        <tr><th scope="col" class="sticky left-0 z-10 bg-card p-3 text-left text-sm text-muted">Specification</th>${headCells}</tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
}
