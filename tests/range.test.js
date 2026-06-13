import { AFS } from "../src/AFS";
import { cleanupEnv } from "./helpers";

const RANGE_DOM = `
  <div class="filter-container">
    <div class="filter-item" data-price="10" data-title="A"></div>
    <div class="filter-item" data-price="50" data-title="B"></div>
    <div class="filter-item" data-price="100" data-title="C"></div>
    <div class="filter-counter"></div>
  </div>
  <div id="price-slider"></div>
`;

function createRangeAFS() {
  document.body.innerHTML = RANGE_DOM;
  return new AFS({
    containerSelector: ".filter-container",
    itemSelector: ".filter-item",
    counterSelector: ".filter-counter",
    hiddenClass: "hidden",
    animation: { duration: 0 },
  });
}

describe("AFS — RangeFilter", () => {
  let afs;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanupEnv);

  test("Should filter items manually via show/hide by numeric range", () => {
    afs = createRangeAFS();

    afs.items.forEach((item) => {
      const price = parseFloat(item.dataset.price);
      if (price >= 0 && price <= 50) {
        afs.showItem(item);
      } else {
        afs.hideItem(item);
      }
    });
    jest.runAllTimers();

    const visible = Array.from(afs.state.getState().items.visible).map((i) => i.dataset.title);
    expect(visible.sort()).toEqual(["A", "B"]);
  });

  test("addRangeSlider builds slider DOM (track + two thumbs)", () => {
    afs = createRangeAFS();
    afs.rangeFilter.addRangeSlider({
      key: "price",
      container: document.getElementById("price-slider"),
      min: 0,
      max: 100,
      step: 5,
    });

    const slider = document.querySelector("#price-slider");
    expect(slider.querySelectorAll('[class*="thumb"]').length).toBe(2);
    expect(slider.querySelector('[class*="track"]')).toBeTruthy();
  });

  test("setRangeValues filters items within the selected range", () => {
    afs = createRangeAFS();
    afs.rangeFilter.addRangeSlider({
      key: "price",
      container: document.getElementById("price-slider"),
      min: 0,
      max: 100,
      step: 5,
    });

    afs.rangeFilter.setRangeValues("price", 0, 60);
    jest.runAllTimers();

    const visible = Array.from(afs.state.getState().items.visible).map((i) => i.dataset.title);
    expect(visible.sort()).toEqual(["A", "B"]); // 10 and 50, not 100

    expect(afs.rangeFilter.getRangeValues("price")).toMatchObject({ min: 0, max: 60 });
  });

  test("removeRangeSlider removes the DOM and unsubscribes the histogram listener", () => {
    afs = createRangeAFS();
    afs.rangeFilter.addRangeSlider({
      key: "price",
      container: document.getElementById("price-slider"),
      min: 0,
      max: 100,
      step: 5,
      ui: { showHistogram: true, bins: 4 },
    });

    // Histogram highlight subscribes to the "rangeFilter" event
    expect(afs.events.get("rangeFilter")?.size).toBe(1);
    expect(document.querySelector("#price-slider > *")).toBeTruthy();

    afs.rangeFilter.removeRangeSlider("price");

    expect(afs.events.get("rangeFilter")?.size || 0).toBe(0);
    expect(document.querySelector("#price-slider > *")).toBeNull();
    expect(afs.rangeFilter.getRangeValues("price")).toBeNull();
  });

  test("destroy() removes all sliders and does not throw", () => {
    afs = createRangeAFS();
    afs.rangeFilter.addRangeSlider({
      key: "price",
      container: document.getElementById("price-slider"),
      min: 0,
      max: 100,
      step: 5,
      ui: { showHistogram: true, bins: 4 },
    });

    expect(() => afs.rangeFilter.destroy()).not.toThrow();
    expect(afs.events.get("rangeFilter")?.size || 0).toBe(0);
    expect(document.querySelector("#price-slider > *")).toBeNull();
  });
});
