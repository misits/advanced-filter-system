/**
 * Shared test helpers for the AFS feature suites.
 * Each feature lives in its own *.test.js file; these helpers keep the common
 * DOM fixture and instance factory in one place.
 */
import { AFS } from "../src/AFS";

/** The standard 2-item fruit/vegetable fixture used by most feature suites. */
export const BASIC_DOM = `
  <div class="filter-container">
    <button class="btn-filter" data-filter="category:fruit">Fruit</button>
    <button class="btn-filter" data-filter="category:vegetable">Vegetable</button>
    <input class="filter-search" />
    <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
    <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
    <div class="filter-counter"></div>
  </div>
`;

/** Default options matching the original suite's configuration. */
export const BASIC_OPTIONS = {
  containerSelector: ".filter-container",
  itemSelector: ".filter-item",
  filterButtonSelector: ".btn-filter",
  searchInputSelector: ".filter-search",
  counterSelector: ".filter-counter",
  activeClass: "active",
  hiddenClass: "hidden",
  animation: { duration: 0 },
  filterMode: "OR",
  searchKeys: ["title"],
  debounceTime: 0,
};

/**
 * Mount the basic fixture and create an AFS instance.
 * @param {Object} [overrides] - Option overrides merged over BASIC_OPTIONS
 * @returns {AFS}
 */
export function createBasicAFS(overrides = {}) {
  document.body.innerHTML = BASIC_DOM;
  return new AFS({ ...BASIC_OPTIONS, ...overrides });
}

/** Standard per-test teardown: real timers, clear storage/URL, empty DOM. */
export function cleanupEnv() {
  jest.useRealTimers();
  localStorage.clear();
  window.history.replaceState({}, "", window.location.pathname);
  document.body.innerHTML = "";
}
