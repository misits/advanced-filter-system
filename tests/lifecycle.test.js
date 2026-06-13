import { AFS } from "../src/AFS";
import { createBasicAFS, cleanupEnv } from "./helpers";

/**
 * Regression coverage for the cleanup / correctness fixes:
 * - destroy() removes the exact listeners it added (no bind mismatch)
 * - MutationObserver is disconnected, event bus is cleared
 * - setupPagination() is idempotent (no duplicate pagination bar)
 * - options.set() rolls back invalid values and accepts time strings
 * - DateFilter parses YYYY-MM-DD as a local calendar date
 * - StyleManager normalizes animation durations to valid CSS time values
 */
describe("AFS — Lifecycle & cleanup", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    cleanupEnv();
  });

  test("destroy() removes the same window/document listeners it added", () => {
    const added = { resize: [], visibilitychange: [], popstate: [] };
    const removed = { resize: [], visibilitychange: [], popstate: [] };

    const realWinAdd = window.addEventListener.bind(window);
    const realWinRemove = window.removeEventListener.bind(window);
    const realDocAdd = document.addEventListener.bind(document);
    const realDocRemove = document.removeEventListener.bind(document);

    jest.spyOn(window, "addEventListener").mockImplementation((t, h, o) => {
      if (added[t]) added[t].push(h);
      return realWinAdd(t, h, o);
    });
    jest.spyOn(window, "removeEventListener").mockImplementation((t, h, o) => {
      if (removed[t]) removed[t].push(h);
      return realWinRemove(t, h, o);
    });
    jest.spyOn(document, "addEventListener").mockImplementation((t, h, o) => {
      if (added[t]) added[t].push(h);
      return realDocAdd(t, h, o);
    });
    jest.spyOn(document, "removeEventListener").mockImplementation((t, h, o) => {
      if (removed[t]) removed[t].push(h);
      return realDocRemove(t, h, o);
    });

    const afs = createBasicAFS({
      responsive: true,
      preserveState: true,
      observeDOM: true,
    });
    afs.destroy();

    // Each listener that was added must have been removed with the SAME reference
    for (const type of ["resize", "visibilitychange", "popstate"]) {
      expect(added[type].length).toBeGreaterThan(0);
      for (const handler of added[type]) {
        expect(removed[type]).toContain(handler);
      }
    }
  });

  test("destroy() disconnects the MutationObserver and clears the event bus", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <div class="filter-item" data-categories="category:a" data-title="A"></div>
        <div class="filter-item" data-categories="category:b" data-title="B"></div>
      </div>
      <div class="pagination-container"></div>
    `;
    const afs = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      hiddenClass: "hidden",
      observeDOM: true,
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 1,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    expect(afs.mutationObserver).toBeTruthy();
    expect(afs.events.size).toBeGreaterThan(0); // pagination subscribed to the bus

    afs.destroy();

    expect(afs.mutationObserver).toBeNull();
    expect(afs.events.size).toBe(0);
  });

  test("setupPagination() is idempotent — re-enabling does not duplicate the bar", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        ${Array.from({ length: 6 }, (_, i) =>
          `<div class="filter-item" data-categories="category:a" data-title="Item ${i}"></div>`
        ).join("")}
      </div>
      <div class="pagination-container"></div>
    `;
    const afs = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 2,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    const count = () =>
      document.querySelectorAll(".pagination-container > *").length;

    expect(count()).toBe(1);

    // Re-enable while already enabled (what the demo's settings-restore did)
    afs.pagination.setPaginationMode(true);
    afs.pagination.setPaginationMode(true);

    expect(count()).toBe(1);

    afs.destroy();
  });

  test("options.set() rolls back invalid values and accepts time strings", () => {
    const afs = createBasicAFS({ animation: { duration: 200 } });

    expect(() => afs.options.set("animation.duration", "not-a-time")).toThrow();
    // Value must be unchanged after a rejected set
    expect(afs.options.get("animation.duration")).toBe(200);

    // A valid CSS time string is now accepted (aligned with StyleManager)
    expect(() => afs.options.set("animation.duration", "300ms")).not.toThrow();
    expect(afs.options.get("animation.duration")).toBe("300ms");

    // A plain number is still accepted
    expect(() => afs.options.set("animation.duration", 500)).not.toThrow();
    expect(afs.options.get("animation.duration")).toBe(500);
  });

  test("DateFilter.parseLocalDate parses YYYY-MM-DD as local midnight", () => {
    const afs = createBasicAFS();
    const d = afs.dateFilter.parseLocalDate("2024-01-15");

    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(0); // January
    expect(d.getDate()).toBe(15); // not shifted to the 14th
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  test("StyleManager.normalizeDuration coerces to valid CSS time values", () => {
    const afs = createBasicAFS();
    const sm = afs.styleManager;

    expect(sm.normalizeDuration(250)).toBe("250ms");
    expect(sm.normalizeDuration("300ms")).toBe("300ms");
    expect(sm.normalizeDuration("0.3s")).toBe("0.3s");
    expect(sm.normalizeDuration("250")).toBe("250ms");
    expect(sm.normalizeDuration(null)).toBe("300ms");
    expect(sm.normalizeDuration("")).toBe("300ms");
  });

  test("DateFilter and InputRangeFilter expose destroy(); AFS.destroy() is clean", () => {
    const afs = createBasicAFS();
    expect(typeof afs.dateFilter.destroy).toBe("function");
    expect(typeof afs.inputRangeFilter.destroy).toBe("function");
    expect(typeof afs.urlManager.destroy).toBe("function");
    expect(() => afs.destroy()).not.toThrow();
  });
});
