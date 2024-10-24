/**
 * Item grid generator for Advanced Filter System
 */
const createItemGrid = (config = {}) => {
    // Default configuration
    const defaultConfig = {
        items: [
            {
                title: 'Smartphone Pro',
                category: 'tech',
                price: 999,
                categoryLabel: 'Technology'
            },
            {
                title: 'Laptop Ultra',
                category: 'tech',
                price: 1299,
                categoryLabel: 'Technology'
            },
            {
                title: 'Designer Jeans',
                category: 'fashion',
                price: 89,
                categoryLabel: 'Fashion'
            },
            {
                title: 'Casual Shirt',
                category: 'fashion',
                price: 59,
                categoryLabel: 'Fashion'
            },
            {
                title: 'Gourmet Pizza',
                category: 'food',
                price: 25,
                categoryLabel: 'Food'
            },
            {
                title: 'Organic Salad',
                category: 'food',
                price: 15,
                categoryLabel: 'Food'
            }
        ],
        containerId: 'item-grid',
        gridClasses: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
        formatPrice: (price) => `$${price}`,
        customItemClasses: '',
        animate: true
    };

    // Merge provided config with defaults
    const finalConfig = { ...defaultConfig, ...config };

    // Create single item card
    const createItemCard = (item) => {
        const {
            title,
            category,
            price,
            categoryLabel,
            tags = [],
            customAttributes = {}
        } = item;

        // Build data attributes string
        const dataAttributes = {
            'data-categories': `category:${category}`,
            'data-price': price,
            'data-title': title,
            ...customAttributes
        };
        
        const dataAttributesString = Object.entries(dataAttributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        // Build card HTML
        return `
            <div class="card filter-item p-6 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${finalConfig.customItemClasses}"
                ${dataAttributesString}>
                <div class="card-content">
                    <h3 class="card-title mb-2 text-lg font-semibold">${title}</h3>
                    <div class="card-category text-gray-500 text-sm">${categoryLabel}</div>
                    <div class="card-price mt-2 text-gray-500 font-bold">${finalConfig.formatPrice(price)}</div>
                    ${tags.length ? `
                        <div class="flex flex-wrap gap-1 mt-2">
                            ${tags.map(tag => `
                                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    // Create grid container
    const createGrid = (items) => `
        <div class="${finalConfig.gridClasses}">
            ${items.map(createItemCard).join('')}
        </div>
    `;

    // Insert grid into DOM
    const insertGrid = () => {
        const container = document.getElementById(finalConfig.containerId);
        if (!container) {
            console.warn(`Container with id "${finalConfig.containerId}" not found`);
            return;
        }

        container.innerHTML = createGrid(finalConfig.items);

        // Add animation if enabled
        if (finalConfig.animate) {
            const items = container.querySelectorAll('.filter-item');
            items.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }
    };

    // Initialize
    insertGrid();

    // Return public methods
    return {
        refresh: () => insertGrid(),
        updateItems: (newItems) => {
            finalConfig.items = newItems;
            insertGrid();
        }
    };
};

export { createItemGrid };