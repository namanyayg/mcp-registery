# MCP Server Registry

## What is this?

Finding setup instructions and configuration details (like environment variables) for different Model Context Protocol (MCP) servers can be difficult. This project solves that.

It provides a central, simple list (`mcp-registry.json`) of quality MCP servers with:

*   Easy-to-find setup instructions.
*   Clear information on required variables.
*   Links to official documentation.

## Features

*   **Simple Data:** Server info is stored in `mcp-registry.json`.
*   **Web Page:** Open `index.html` locally to browse servers.
*   **NPM Package:** Use the data in your JavaScript/Node.js projects.

## Install via npm

```bash
npm install mcp-registery 
# or
yarn add mcp-registery
```

## How to Use (JavaScript / Node.js)

Once installed via npm, you can require the registry in your code:

```javascript
// Import the registry functions
const mcpRegistry = require('mcp-registery'); 

// --- Example 1: List all available MCP server names ---
const allMcps = mcpRegistry.listMcps();
console.log("Available MCPs:");
allMcps.forEach(mcp => console.log(`- ${mcp.name} (ID: ${mcp.id})`));
// Output:
// Available MCPs:
// - Prisma MCP Server (ID: prisma)
// - Puppeteer MCP Server (ID: puppeteer)
// - Slack MCP Server (ID: slack)
// - Supabase MCP Server (ID: supabase)

// --- Example 2: Get full details for a specific MCP ---
const puppeteerDetails = mcpRegistry.getMcp('puppeteer');
if (puppeteerDetails) {
    console.log("\nPuppeteer Details:", JSON.stringify(puppeteerDetails, null, 2));
}

// --- Example 3: Get required variables for Slack ---
const slackInfo = mcpRegistry.getInstallationInfo('slack');
if (slackInfo && slackInfo.variables) {
    console.log("\nSlack requires the following variables:");
    for (const [varName, details] of Object.entries(slackInfo.variables)) {
        console.log(`- ${varName}: ${details.description}`);
    }
}
// Output:
// Slack requires the following variables:
// - SLACK_BOT_TOKEN: Your Slack bot token (starts with xoxb-).
// - SLACK_TEAM_ID: Your Slack workspace Team ID (starts with T).
// - SLACK_CHANNEL_IDS: Comma-separated list of Slack channel IDs to monitor.


// --- Example 4: Generate the full install command for Supabase ---
// Imagine you have your token in an environment variable
const myToken = process.env.SUPABASE_ACCESS_TOKEN || 'your-token-placeholder';

const supabaseCommand = mcpRegistry.generateFullCommand('supabase', { 
    SUPABASE_ACCESS_TOKEN: myToken 
});

if (supabaseCommand) {
    console.log("\nTo run Supabase MCP Server:");
    console.log(supabaseCommand);
}
// Example Output:
// To run Supabase MCP Server:
// npx -y @supabase/mcp-server-supabase@latest --access-token "your-token-placeholder"

```

See `index.js` for all available functions.

## Web Interface

If you clone this repository, you can open the `index.html` file directly in your web browser. It loads data from `mcp-registry.json` and shows a card for each server with its details, install command, and required variables.

## Data Format (`mcp-registry.json`)

The registry is a JSON object. Each key is a server ID (like `"prisma"`). The value is an object describing the server:

```js
{
  "id": "string",         // Unique ID (same as key)
  "name": "string",       // Display name
  "description": "string", // What it does
  "official": "boolean",  // Is it official?
  "category": "string",   // e.g., "Database"
  "readmeUrl": "string | null", // Link to docs
  "brand": {
    "logoUrl": "string | null" // Logo image URL
  },
  "installation": {
    "type": "string",       // How to install (e.g., "npx")
    "command": "string",    // Base command (e.g., "npx")
    "args": ["string"],   // Command arguments (use <VAR_NAME> for placeholders)
    "variables": {        // Optional: Required variables
      "VAR_NAME": {
        "description": "string",
        "secret": "boolean",   // Is it sensitive?
        "placeholder": "string | null" // Example format
      }
    }
  }
}
```

## Contributing

Want to add or update a server?

1.  **Fork** this repository.
2.  **Edit** `mcp-registry.json` (add/update an entry, follow the format).
3.  **Create a Pull Request**.

Please ensure added servers are stable and have good documentation. 
