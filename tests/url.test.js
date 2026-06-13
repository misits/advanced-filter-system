import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — URL management", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should update URL when filters are applied", () => {
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    // Manually trigger URL update (normally async in Promise.then)
    filterInstance.urlManager.updateURL();

    const urlParams = new URLSearchParams(window.location.search);
    expect(urlParams.get("category")).toBe("fruit");
  });
});
