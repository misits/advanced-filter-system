import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Event system", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should emit events on filtering", () => {
    const mockCallback = jest.fn();
    filterInstance.on("filterToggled", mockCallback);

    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: "category:fruit",
        activeFilters: expect.arrayContaining(["category:fruit"]),
      }),
    );
  });
});
