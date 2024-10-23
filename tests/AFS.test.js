// Import the Filter class
import { AFS } from '../src/AFS';

// Mocking the DOM for testing
document.body.innerHTML = `
  <div class="filter-container">
    <button class="btn-filter" data-filter="category:fruit">Fruit</button>
    <button class="btn-filter" data-filter="category:vegetable">Vegetable</button>
    <input class="filter-search" />
    <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
    <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
    <div class="filter-counter"></div>
  </div>
`;

describe('Filter Class', () => {
  let filterInstance;

  beforeEach(() => {
    filterInstance = new AFS({
      containerSelector: '.filter-container',
      itemSelector: '.filter-item',
      filterButtonSelector: '.btn-filter',
      searchInputSelector: '.filter-search',
      counterSelector: '.filter-counter',
      activeClass: 'active',
      hiddenClass: 'hidden',
      animationDuration: 300,
      filterMode: 'OR',
      searchKeys: ['title'],
      debounceTime: 300,
    });
  });

  test('Initializes with default options', () => {
    expect(filterInstance.options.containerSelector).toBe('.filter-container');
    expect(filterInstance.options.filterMode).toBe('OR');
    expect(filterInstance.items.length).toBe(2); // 2 items in the DOM
  });

  test('Should filter items based on selected filter button', () => {
    // Simulate clicking the "Fruit" filter button
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    // After filtering, only the item with "Apple" should be visible
    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe('Apple');
  });

  test('Should reset filters when "All" button is clicked', () => {
    // Simulate clicking the "All" button (filterValue="*")
    filterInstance.resetFilters();

    // All items should be visible
    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(2);
  });

  test('Should filter items based on search input', () => {
    // Simulate typing in the search input (debounced)
    const searchInput = document.querySelector('.filter-search');
    searchInput.value = 'Apple';
    searchInput.dispatchEvent(new Event('input'));

    setTimeout(() => {
      const visibleItems = Array.from(filterInstance.visibleItems);
      expect(visibleItems.length).toBe(1);
      expect(visibleItems[0].dataset.title).toBe('Apple');
    }, 400); // Adjust the delay if needed to match debounce time
  });

  test('Should update the counter correctly', () => {
    // Simulate filtering by category "fruit"
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    // Counter should display the correct number of visible items
    const counter = document.querySelector('.filter-counter');
    expect(counter.textContent).toBe('Showing 1 of 2');
  });

  test('Should sort items based on multiple criteria', () => {
    // Sort by title ascending
    filterInstance.sortMultiple([{ key: 'title', direction: 'asc' }]);

    const firstItem = document.querySelectorAll('.filter-item')[0];
    expect(firstItem.dataset.title).toBe('Apple'); // Apple should be the first
  });
});