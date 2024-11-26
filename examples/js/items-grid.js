/**
 * Item grid generator
 */
const createItemGrid = (items, containerId = 'item-grid') => {
    // Default items if none provided
    const gridItems = items || [
        {
            category: 'tech',
            categoryLabel: 'Mobile',
            title: 'Smartphone Pro',
            price: 999,
            date: '2024-11-26',
            rating: 4.5,
            sales: 1250,
            color: 'black',
            canton: 'valais'
        },
        {
            category: 'tech',
            categoryLabel: 'Laptop',
            title: 'Laptop Ultra',
            price: 1299,
            date: '2024-02-20',
            rating: 4.8,
            sales: 890,
            color: 'black',
            date: '2024-11-27',
            canton: 'valais'
        },
        {
            category: 'fashion',
            categoryLabel: 'Pants',
            title: 'Designer Jeans',
            price: 89,
            date: '2024-03-01',
            rating: 4.2,
            sales: 567,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        },
        {
            category: 'fashion',
            categoryLabel: 'Shirts',
            title: 'Casual Shirt',
            price: 59,
            date: '2024-03-10',
            rating: 4.0,
            sales: 432,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        },
        {
            category: 'food',
            categoryLabel: 'Frozen Food',
            title: 'Gourmet Pizza',
            price: 25,
            date: '2024-03-18',
            rating: 4.7,
            sales: 789,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        },
        {
            category: 'food',
            categoryLabel: 'Vegetables',
            title: 'Organic Salad',
            price: 15,
            date: '2024-03-17',
            rating: 4.3,
            sales: 345,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        },
        {
            category: 'book',
            categoryLabel: 'Fiction',
            title: 'Sci-Fi Novel',
            price: 19,
            date: '2024-03-05',
            rating: 4.6,
            sales: 678,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        },
        {
            category: 'book',
            categoryLabel: 'Non-Fiction',
            title: 'Self-Help Book',
            price: 29,
            date: '2024-03-12',
            rating: 4.1,
            sales: 456,
            color: 'black',
            date: '2024-11-28',
            canton: 'vaud'
        }
    ];

    // Format functions
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatPrice = (price) => `$${price}`;
    
    const formatRating = (rating, color) => {
        const fullStars = '★'.repeat(Math.floor(rating));
        return `<div class="flex items-center gap-1 text-${color}-500">
            ${fullStars}
            <span class="ml-1 text-sm text-${color}-600">(${rating})</span>
        </div>`;
    };

    // Create item card HTML
    const createItemCard = ({ category, categoryLabel, title, price, date, rating, sales, color, canton }) => `
        <div class="card filter-item afs-transition p-6 bg-white rounded-lg border border-${color}-200 overflow-hidden hover:shadow-md"
             data-categories="category:${category} date:${date} canton:${canton}" 
             data-category="${category}" 
             data-price="${price}"
             data-title="${title}" 
             data-date="${date}" 
             data-rating="${rating}" 
             data-sales="${sales}">
            <div class="card-content">
                <h3 class="card-title mb-2 text-lg font-semibold text-${color}-700">
                    ${title}
                </h3>
                <div class="flex justify-between items-center mb-2">
                    <div class="card-category text-${color}-500 text-sm">${categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)}</div>
                    <div class="card-date text-${color}-400 text-sm">${formatDate(date)}</div>
                </div>
                <div class="card-rating mb-2">
                    ${formatRating(rating, color)}
                </div>
                <div class="flex justify-between items-center">
                    <div class="card-price text-${color}-700 font-bold">${formatPrice(price)}</div>
                    <div class="card-sales text-${color}-500 text-sm">${sales} sold</div>
                </div>
            </div>
        </div>
    `;

    // Create grid section HTML
    const createGrid = (items) => `
        <div id="${containerId}">
            <div class="filter-container">
                <div class="items-grid-section grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${items.map(createItemCard).join('')}
                </div>
            </div>
        </div>
    `;

    // Create and insert the grid
    const insertGrid = () => {
        const container = document.getElementById(containerId);
        if (container) {
            container.outerHTML = createGrid(gridItems);
        } else {
            document.write(createGrid(gridItems));
        }
    };

    // Initialize
    insertGrid();
};

// Export for module usage
export { createItemGrid };