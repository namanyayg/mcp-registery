document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mcp-list-container');
    if (!container) {
        console.error('MCP list container not found!');
        return;
    }

    // Fetches the registry data and populates the page
    async function loadRegistryData() {
        try {
            const response = await fetch('mcp-registry.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const registry = await response.json();
            displayMcps(registry);
        } catch (error) {
            console.error('Error loading MCP registry:', error);
            container.innerHTML = '<p>Error loading MCP registry. Please check the console.</p>';
        }
    }

    // Generates the HTML for the list of MCPs
    function displayMcps(registry) {
        // Clear loading message
        container.innerHTML = '';

        // Sort MCPs alphabetically by name for consistent display
        const sortedMcps = Object.values(registry).sort((a, b) => a.name.localeCompare(b.name));

        if (sortedMcps.length === 0) {
            container.innerHTML = '<p>No MCPs found in the registry.</p>';
            return;
        }

        sortedMcps.forEach(mcp => {
            const card = createMcpCard(mcp);
            container.appendChild(card);
        });
    }

    // Creates a single card element for an MCP
    function createMcpCard(mcp) {
        const card = document.createElement('div');
        card.className = 'mcp-card';

        const name = mcp.name || 'Unnamed MCP';
        const description = mcp.description || 'No description available.';
        const category = mcp.category || 'Uncategorized';
        const isOfficial = mcp.official === true;
        const readmeUrl = mcp.readmeUrl;
        const installation = mcp.installation;

        let metaHtml = `<span class="category">Category: ${escapeHtml(category)}</span>`;
        if (isOfficial) {
            metaHtml += `<span class="official">Official</span>`;
        }

        let installHtml = '<p>No installation information available.</p>';
        if (installation) {
            const command = installation.command;
            const args = installation.args || [];
            // Basic command string generation for display (no complex quoting needed here)
            const commandString = escapeHtml([command, ...args].join(' '));
            const variables = installation.variables || {};
            const hasVariables = Object.keys(variables).length > 0;

            installHtml = `
                <h3>Installation (${escapeHtml(installation.type || 'N/A')})</h3>
                <p>Run the following command:</p>
                <pre><code>${commandString}</code></pre>
            `;

            if (hasVariables) {
                installHtml += `
                    <h4>Required Variables:</h4>
                    <ul>
                        ${Object.entries(variables).map(([key, val]) => `
                            <li>
                                <strong><code>${escapeHtml(key)}</code>:</strong> 
                                ${escapeHtml(val.description || 'No description')}
                                ${val.placeholder ? `(e.g., <code>${escapeHtml(val.placeholder)}</code>)` : ''}
                                ${val.secret ? '<span style="color: red;">(Secret)</span>' : ''}
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        }

        card.innerHTML = `
            <h2>${escapeHtml(name)}</h2>
            <div class="meta">${metaHtml}</div>
            <p>${escapeHtml(description)}</p>
            ${readmeUrl ? `<p><a href="${escapeHtml(readmeUrl)}" target="_blank" rel="noopener noreferrer">View README</a></p>` : ''}
            ${installHtml}
        `;

        return card;
    }

    // Simple HTML escaping function to prevent XSS
    function escapeHtml(unsafe) {
      if (!unsafe) return '';
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
   }

    // Load the data when the script runs
    loadRegistryData();
}); 