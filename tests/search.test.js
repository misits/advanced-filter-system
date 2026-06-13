import { AFS } from "../src/AFS";
import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Search", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should filter items based on search input", () => {
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));

    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  test("Should combine text search and category filter correctly", () => {
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();
    jest.runAllTimers();

    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));

    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  test("Should handle complex filter combinations", () => {
    // Apply category filter
    filterInstance.filter.addFilter("category:fruit");

    // Apply search filter
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));
    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });
});

describe("AFS — Search (edge cases)", () => {
  let filterInstance;

  afterEach(cleanupEnv);

  test("Should debounce rapid input into a single search", () => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS({ debounceTime: 200 });
    const searchSpy = jest.spyOn(filterInstance.search, "search");

    const input = document.querySelector(".filter-search");
    ["A", "Ap", "App"].forEach((v) => {
      input.value = v;
      input.dispatchEvent(new Event("input"));
    });

    // Nothing should have fired yet (still within the debounce window)
    expect(searchSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

    // Only the last keystroke triggers one actual search
    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenLastCalledWith("App");
  });

  test("Should ignore queries shorter than minSearchLength", () => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS({ minSearchLength: 3, debounceTime: 0 });

    const input = document.querySelector(".filter-search");
    input.value = "ap"; // length 2 < 3
    input.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    // Too short → no filtering applied, all items remain visible
    expect(filterInstance.state.getState().items.visible.size).toBe(2);
  });

  test("Should clear search and show all items when query is emptied", () => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();

    const input = document.querySelector(".filter-search");
    input.value = "Apple";
    input.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    input.value = "";
    input.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(filterInstance.state.getState().items.visible.size).toBe(2);
  });

  test("Should require all words to be present (multi-word AND matching)", () => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div class="filter-container">
        <input class="filter-search" />
        <div class="filter-item" data-title="red apple"></div>
        <div class="filter-item" data-title="green apple"></div>
        <div class="filter-item" data-title="red berry"></div>
      </div>
    `;
    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      searchInputSelector: ".filter-search",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      searchKeys: ["title"],
      debounceTime: 0,
    });

    const input = document.querySelector(".filter-search");
    input.value = "red apple";
    input.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    const visible = Array.from(filterInstance.state.getState().items.visible);
    expect(visible.length).toBe(1);
    expect(visible[0].dataset.title).toBe("red apple");
  });

  test("Should not throw on special regex characters in the query", () => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();

    const input = document.querySelector(".filter-search");
    input.value = "a+b(["; // would be invalid regex if not escaped
    expect(() => {
      input.dispatchEvent(new Event("input"));
      jest.runAllTimers();
    }).not.toThrow();
  });

  test("Should search across multiple searchKeys", () => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div class="filter-container">
        <input class="filter-search" />
        <div class="filter-item" data-title="Apple" data-desc="a crunchy fruit"></div>
        <div class="filter-item" data-title="Carrot" data-desc="an orange vegetable"></div>
      </div>
    `;
    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      searchInputSelector: ".filter-search",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      searchKeys: ["title", "desc"],
      debounceTime: 0,
    });

    const input = document.querySelector(".filter-search");
    input.value = "orange"; // only present in Carrot's desc
    input.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    const visible = Array.from(filterInstance.state.getState().items.visible);
    expect(visible.length).toBe(1);
    expect(visible[0].dataset.title).toBe("Carrot");
  });
});
