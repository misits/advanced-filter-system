import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Animation", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should apply custom animation options", () => {
    filterInstance.options.set("animation.duration", 500);

    expect(filterInstance.options.get("animation.duration")).toBe(500);
  });

  test("Should handle animation states correctly", () => {
    const item = document.querySelector(".filter-item");

    // Test show animation
    filterInstance.showItem(item);
    jest.runAllTimers();

    // After all timers, item should not be hidden
    expect(item.classList.contains(filterInstance.options.get("hiddenClass"))).toBe(false);

    // Test hide animation
    filterInstance.hideItem(item);
    jest.runAllTimers();

    expect(item.classList.contains(filterInstance.options.get("hiddenClass"))).toBe(true);
  });
});
