/**
 * Feature section generator
 */
const createFeatureSection = (features, containerId = 'features') => {
    // Feature data
    const featureItems = features || [
        {
          emoji: '🔍',
          title: 'Multiple Typed Filters',
          description: 'Support for category, price, and custom filter types'
        },
        {
          emoji: '🔎',
          title: 'Text Search',
          description: 'Debounced search with multiple key support'
        },
        {
          emoji: '📊',
          title: 'Multi-criteria Sorting',
          description: 'Sort items by multiple criteria simultaneously'
        },
        {
          emoji: '🔗',
          title: 'URL State Management',
          description: 'Filter state persists in URL for sharing'
        },
        {
          emoji: '✨',
          title: 'Smooth Animations',
          description: 'Fluid transitions between filter states'
        },
        {
          emoji: '🔢',
          title: 'Results Counter',
          description: 'Live count of filtered items displayed'
        },
        {
          emoji: '📱',
          title: 'Responsive',
          description: 'Fully adaptive to all screen sizes'
        },
        {
          emoji: '⚡',
          title: 'High Performance',
          description: 'Optimized for large datasets'
        },
        {
          emoji: '↕️',
          title: 'Flexible Sorting',
          description: 'Multi-column sort with custom comparators'
        },
        {
          emoji: '📄',
          title: 'Smart Pagination',
          description: 'Dynamic page size with custom controls'
        },
        {
          emoji: '💾',
          title: 'State Management',
          description: 'Centralized state with import/export support'
        },
        {
          emoji: '🎯',
          title: 'Event System',
          description: 'Rich event API with debugging support'
        }
      ];

    // Create feature card HTML
    const createFeatureCard = ({ emoji, title, description }) => `
        <div class="p-6 bg-white rounded-lg border border-gray-200">
            <div class="text-2xl mb-4">${emoji}</div>
            <h3 class="font-bold mb-2">${title}</h3>
            <p class="text-gray-600">${description}</p>
        </div>
    `;

    // Create section HTML
    const createSection = (items) => `
        <section id="${containerId}" class="container mx-auto px-4 sm:px-6 mb-16">
            <h2 class="text-3xl font-bold mb-8">Features</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${items.map(createFeatureCard).join('')}
            </div>
        </section>
    `;

    // Create and insert the section
    const insertFeatures = () => {
        const container = document.getElementById(containerId);
        if (container) {
            container.outerHTML = createSection(featureItems);
        } else {
            document.write(createSection(featureItems));
        }
    };

    // Initialize
    insertFeatures();
};

// Export for module usage
export { createFeatureSection };