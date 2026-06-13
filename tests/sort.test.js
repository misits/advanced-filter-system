import { AFS } from "../src/AFS";
import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Sorting", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should sort items based on multiple criteria", () => {
    filterInstance.sort.sortMultiple([{ key: "title", direction: "asc" }]);

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Apple");
  });

  test("Should sort with custom comparator function", () => {
    filterInstance.sort.sortWithComparator("title", (a, b) => b.localeCompare(a));

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Carrot");
  });

  test("Should sort with the declared direction on first click, then toggle", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-sort" data-sort-key="price" data-sort-direction="asc">Price</button>
        <div class="filter-item" data-title="B" data-price="200"></div>
        <div class="filter-item" data-title="A" data-price="100"></div>
        <div class="filter-item" data-title="C" data-price="300"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      sortButtonSelector: ".btn-sort",
      hiddenClass: "hidden",
      animation: { duration: 0 },
    });

    const button = document.querySelector(".btn-sort");
    const prices = () =>
      Array.from(document.querySelectorAll(".filter-item")).map((i) => i.dataset.price);

    // First click: ascending (as declared)
    button.click();
    jest.runAllTimers();
    expect(prices()).toEqual(["100", "200", "300"]);

    // Second click: toggles to descending
    button.click();
    jest.runAllTimers();
    expect(prices()).toEqual(["300", "200", "100"]);
  });
});
