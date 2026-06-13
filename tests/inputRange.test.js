import { AFS } from "../src/AFS";
import { cleanupEnv } from "./helpers";

const INPUT_RANGE_DOM = `
  <div class="filter-container">
    <div class="filter-item" data-rating="2" data-title="A"></div>
    <div class="filter-item" data-rating="3.5" data-title="B"></div>
    <div class="filter-item" data-rating="5" data-title="C"></div>
    <div class="filter-counter"></div>
  </div>
  <div id="rating-range"></div>
`;

function createInputRangeAFS() {
  document.body.innerHTML = INPUT_RANGE_DOM;
  return new AFS({
    containerSelector: ".filter-container",
    itemSelector: ".filter-item",
    counterSelector: ".filter-counter",
    hiddenClass: "hidden",
    animation: { duration: 0 },
  });
}

const visibleTitles = (afs) =>
  Array.from(afs.state.getState().items.visible)
    .map((i) => i.dataset.title)
    .sort();

describe("AFS — InputRangeFilter", () => {
  let afs;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanupEnv);

  test("addInputRange builds min and max inputs", () => {
    afs = createInputRangeAFS();
    afs.inputRangeFilter.addInputRange({
      key: "rating",
      container: document.getElementById("rating-range"),
      min: 0,
      max: 5,
      step: 0.5,
    });

    expect(document.querySelectorAll("#rating-range input").length).toBeGreaterThanOrEqual(2);
    expect(afs.inputRangeFilter.getRange("rating")).not.toBeNull();
  });

  test("setRange filters items within the range", () => {
    afs = createInputRangeAFS();
    afs.inputRangeFilter.addInputRange({
      key: "rating",
      container: document.getElementById("rating-range"),
      min: 0,
      max: 5,
      step: 0.5,
    });

    afs.inputRangeFilter.setRange("rating", 3, 5);
    jest.runAllTimers();

    expect(visibleTitles(afs)).toEqual(["B", "C"]); // 3.5 and 5, not 2
    expect(afs.inputRangeFilter.getRange("rating")).toMatchObject({ min: 3, max: 5 });
  });

  test("removeInputRange detaches input listeners and clears the range", () => {
    afs = createInputRangeAFS();
    const irf = afs.inputRangeFilter;
    irf.addInputRange({
      key: "rating",
      container: document.getElementById("rating-range"),
      min: 0,
      max: 5,
      step: 0.5,
    });

    const { minInput, maxInput } = irf.activeRanges.get("rating").elements;
    const minRemove = jest.spyOn(minInput, "removeEventListener");
    const maxRemove = jest.spyOn(maxInput, "removeEventListener");

    irf.removeInputRange("rating");

    expect(minRemove).toHaveBeenCalledWith("input", expect.any(Function));
    expect(maxRemove).toHaveBeenCalledWith("input", expect.any(Function));
    expect(irf.getRange("rating")).toBeNull();
    expect(document.querySelector("#rating-range > *")).toBeNull();
  });

  test("destroy() clears all input ranges without throwing", () => {
    afs = createInputRangeAFS();
    afs.inputRangeFilter.addInputRange({
      key: "rating",
      container: document.getElementById("rating-range"),
      min: 0,
      max: 5,
      step: 0.5,
    });

    expect(() => afs.inputRangeFilter.destroy()).not.toThrow();
    expect(afs.inputRangeFilter.activeRanges.size).toBe(0);
  });
});
