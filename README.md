# Student Laptop Finder

A responsive multi-page web app that helps students browse laptops, search and filter them,
read full specifications, save favorites and compare them side by side.
Built with vanilla JavaScript (ES modules) and Tailwind CSS 4.

GitHub repo: <https://github.com/Zaloma2020/laptop_finder_mohamed>

## Install and build

```bash
npm install          # installs tailwindcss, @tailwindcss/cli, forms and typography plugins
npm run build        # generates dist/output.css from src/input.css
npm run watch        # (optional) rebuild automatically while you edit
```

## Run

`fetch()` does not work on pages opened directly as files, so use a local server,
for example **VS Code Live Server** (right-click `index.html` -> *Open with Live Server*).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home page, live statistics, featured laptops |
| `laptops.html` | Catalogue with live search, filters and sorting |
| `details.html?id=7` | Full specifications of one laptop |
| `favorites.html` | Saved favorites, total and average price |
| `compare.html` | Side-by-side comparison of 2-4 favorites |

## JavaScript modules (`src/js`)

| File | Job |
| --- | --- |
| `api.js` | Loads `data/laptops.json` with `fetch()` + `async/await` + `try/catch` |
| `storage.js` | Favorites, comparison list and theme in `localStorage` |
| `theme.js` | Applies, restores and toggles the two themes |
| `ui.js` | Header/footer, laptop card, skeletons, error and toast helpers |
| `filters.js` | `filter()` and `sort()` helpers for the catalogue |
| `compare.js` | Specification rows and best-value calculation |
| `home.js`, `catalogue.js`, `details.js`, `favorites.js`, `comparePage.js` | One small file per page |

## Themes

* **Performance Mode** - dark background with an orange accent (default)
* **Battery Saver Mode** - light background with green accents

Colors are defined with `@theme` in `src/input.css`. The choice is saved in `localStorage`
and restored on every page.

## Notes

* The laptop data in `data/laptops.json` is sample data for the assignment.
* Laptop images in `assets/` are simple generated illustrations.
* Do not commit `node_modules`.
