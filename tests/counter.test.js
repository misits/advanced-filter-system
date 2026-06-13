import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Counter", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should update the counter correctly", () => {
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    // Verify filter state is correct (set synchronously in applyFilters)
    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    // Update counter based on current state
    filterInstance.updateCounter();

    const counter = document.querySelector(".filter-counter");
    expect(counter.textContent).toBe("Showing 1 of 2 (1 filtered)");
  });
});
