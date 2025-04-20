document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mcp-list-container');
    if (!container) {
        console.error('MCP list container (#mcp-list-container) not found!');
        return;
    }

    // Fetches the registry data and populates the page
    async function loadRegistryData() {
        console.log('Attempting to fetch registry data...');
        try {
            const response = await fetch('mcpverse.json');
            console.log('Fetch response received:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const registry = await response.json();
            console.log('Registry data parsed successfully:', registry);
            displayMcps(registry);
        } catch (error) {
            console.error('Error loading MCP registry:', error);
            container.innerHTML = '<p class="text-red-500 text-center">Error loading MCP registry. Please check the console for details.</p>'; // Added basic error styling
        }
    }

    // Generates the HTML for the list of MCPs
    function displayMcps(registry) {
        console.log('Displaying MCPs...');
        // Clear loading message or previous content
        container.innerHTML = '';

        // Sort MCPs alphabetically by name for consistent display
        const sortedMcps = Object.values(registry).sort((a, b) => a.name.localeCompare(b.name));

        if (sortedMcps.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No MCPs found in the registry.</p>';
            return;
        }

        console.log(`Found ${sortedMcps.length} MCPs to display.`);
        sortedMcps.forEach((mcp, index) => {
            console.log(`Creating card for MCP ${index + 1}: ${mcp.name}`);
            try {
                const card = createMcpCard(mcp);
                container.appendChild(card);
            } catch(cardError) {
                console.error(`Error creating card for ${mcp.name}:`, cardError);
                // Optionally display an error card or skip
            }
        });
        console.log('Finished displaying MCPs.');
    }

    // Creates a single card element for an MCP using Tailwind classes
    function createMcpCard(mcp) {
        const card = document.createElement('div');
        // Refined Tailwind classes for card styling
        card.className = 'bg-white border border-gray-200 shadow-lg rounded-xl p-6 mb-8 transition-shadow duration-300 hover:shadow-xl';

        const name = mcp.name || 'Unnamed MCP';
        const description = mcp.description || 'No description available.';
        const category = mcp.category || 'Uncategorized';
        const isOfficial = mcp.official === true;
        const readmeUrl = mcp.readmeUrl;
        const installation = mcp.installation;

        // --- Meta information (Category, Official badge) with Icons ---
        // Category Icon (Example: Tag)
        const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8.414V5a2 2 0 012-2h2z" /></svg>`;
        let metaHtml = `<span class="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">${categoryIcon} ${escapeHtml(category)}</span>`;
        
        // Official Icon (Example: Checkmark)
        if (isOfficial) {
            const officialIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
            metaHtml += `<span class="inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">${officialIcon} Official</span>`;
        }

        // --- Installation section --- 
        let installHtml = '<p class="text-gray-500 italic text-sm">No installation information available.</p>'; // Adjusted text color/size
        if (installation) {
            const command = installation.command;
            const args = installation.args || [];
            const commandString = escapeHtml([command, ...args].join(' '));
            const variables = installation.variables || {};
            const hasVariables = Object.keys(variables).length > 0;

            installHtml = `
                <h3 class="text-lg font-semibold mt-5 mb-2 border-b pb-1 text-gray-700">Installation <span class="text-base font-normal text-gray-500">(${escapeHtml(installation.type || 'N/A')})</span></h3>
                <p class="text-sm text-gray-600 mb-2">Run the following command:</p>
                <pre class="bg-gray-100 text-gray-800 p-3 rounded-md text-sm overflow-x-auto mb-4 border border-gray-200"><code class="font-mono">${commandString}</code></pre>
            `;

            if (hasVariables) {
                installHtml += `
                    <h4 class="text-md font-semibold mb-2 text-gray-700">Required Variables:</h4>
                    <ul class="list-none pl-0 space-y-2 text-sm"> <!-- Changed list style -->
                        ${Object.entries(variables).map(([key, val]) => `
                            <li class="flex flex-col sm:flex-row sm:items-start">
                                <code class="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-mono mr-2 mb-1 sm:mb-0 whitespace-nowrap">${escapeHtml(key)}</code>
                                <span class="text-gray-600">
                                    ${escapeHtml(val.description || 'No description')}
                                    ${val.placeholder ? `<span class="text-gray-400 italic block sm:inline sm:ml-1">(e.g., <code class="bg-gray-100 text-gray-800 px-1 rounded text-xs font-mono">${escapeHtml(val.placeholder)}</code>)</span>` : ''}
                                    ${val.secret ? '<span class="text-red-500 font-medium ml-1">(Secret)</span>' : ''}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        }

        // --- Card inner HTML using Refined Tailwind --- 
        card.innerHTML = `
            <h2 class="text-2xl font-bold mb-2 text-gray-800">${escapeHtml(name)}</h2>
            <div class="mb-4 flex flex-wrap items-center">${metaHtml}</div>
            <p class="text-gray-700 mb-4">${escapeHtml(description)}</p>
            ${readmeUrl ? `<div class="mb-4"><a href="${escapeHtml(readmeUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>View README</a></div>` : ''}
            <div class="mt-4">${installHtml}</div>
        `;

        return card;
    }

    // Simple HTML escaping function to prevent XSS
    function escapeHtml(unsafe) {
      if (unsafe === null || unsafe === undefined) return '';
      const str = String(unsafe);
      return str
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
   }

    // Load the data when the script runs
    loadRegistryData();
}); 