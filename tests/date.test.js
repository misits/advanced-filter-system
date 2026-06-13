import { AFS } from "../src/AFS";
import { cleanupEnv } from "./helpers";

const DATE_DOM = `
  <div class="filter-container">
    <div class="filter-item" data-date="2024-01-10" data-title="A"></div>
    <div class="filter-item" data-date="2024-01-15" data-title="B"></div>
    <div class="filter-item" data-date="2024-01-20" data-title="C"></div>
    <div class="filter-counter"></div>
  </div>
  <div id="date-range"></div>
`;

function createDateAFS() {
  document.body.innerHTML = DATE_DOM;
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

describe("AFS — DateFilter", () => {
  let afs;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanupEnv);

  test("addDateRange builds start and end inputs", () => {
    afs = createDateAFS();
    afs.dateFilter.addDateRange({
      key: "date",
      container: document.getElementById("date-range"),
    });

    expect(document.querySelectorAll("#date-range input").length).toBeGreaterThanOrEqual(2);
    expect(afs.dateFilter.getDateRange("date")).not.toBeNull();
  });

  test("setDateRange filters items strictly within the range", () => {
    afs = createDateAFS();
    const df = afs.dateFilter;
    df.addDateRange({ key: "date", container: document.getElementById("date-range") });

    df.setDateRange("date", df.parseLocalDate("2024-01-12"), df.parseLocalDate("2024-01-18"));
    jest.runAllTimers();

    expect(visibleTitles(afs)).toEqual(["B"]); // only 2024-01-15
  });

  test("Range boundaries are inclusive (no off-by-one)", () => {
    afs = createDateAFS();
    const df = afs.dateFilter;
    df.addDateRange({ key: "date", container: document.getElementById("date-range") });

    // Exact start and end dates must be included
    df.setDateRange("date", df.parseLocalDate("2024-01-10"), df.parseLocalDate("2024-01-15"));
    jest.runAllTimers();

    expect(visibleTitles(afs)).toEqual(["A", "B"]);
  });

  test("Items with an invalid date are hidden when filtering", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <div class="filter-item" data-date="2024-01-15" data-title="Valid"></div>
        <div class="filter-item" data-date="not-a-date" data-title="Invalid"></div>
        <div class="filter-counter"></div>
      </div>
      <div id="date-range"></div>
    `;
    afs = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      counterSelector: ".filter-counter",
      hiddenClass: "hidden",
      animation: { duration: 0 },
    });
    const df = afs.dateFilter;
    df.addDateRange({ key: "date", container: document.getElementById("date-range") });

    df.setDateRange("date", df.parseLocalDate("2024-01-01"), df.parseLocalDate("2024-12-31"));
    jest.runAllTimers();

    expect(visibleTitles(afs)).toEqual(["Valid"]);
  });

  test("removeDateRange detaches input listeners and clears the range", () => {
    afs = createDateAFS();
    const df = afs.dateFilter;
    df.addDateRange({ key: "date", container: document.getElementById("date-range") });

    const { startInput, endInput } = df.activeDateRanges.get("date").elements;
    const startRemove = jest.spyOn(startInput, "removeEventListener");
    const endRemove = jest.spyOn(endInput, "removeEventListener");

    df.removeDateRange("date");

    expect(startRemove).toHaveBeenCalledWith("change", expect.any(Function));
    expect(endRemove).toHaveBeenCalledWith("change", expect.any(Function));
    expect(df.getDateRange("date")).toBeNull();
    expect(document.querySelector("#date-range > *")).toBeNull();
  });

  test("destroy() clears all date ranges without throwing", () => {
    afs = createDateAFS();
    afs.dateFilter.addDateRange({ key: "date", container: document.getElementById("date-range") });

    expect(() => afs.dateFilter.destroy()).not.toThrow();
    expect(afs.dateFilter.activeDateRanges.size).toBe(0);
  });
});
