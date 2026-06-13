import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Initialization", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should initialize with default options", () => {
    expect(filterInstance.options.get("containerSelector")).toBe(".filter-container");
    expect(filterInstance.items.length).toBe(2);
  });
});
