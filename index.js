const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'mcp-registry.json');

let registryData = null;

/**
 * Lazily loads the registry data from the JSON file.
 * @returns {object} The parsed registry data.
 * @throws {Error} If the registry file cannot be read or parsed.
 */
function loadRegistry() {
    if (registryData === null) {
        try {
            const rawData = fs.readFileSync(REGISTRY_PATH, 'utf8');
            registryData = JSON.parse(rawData);
        } catch (error) {
            console.error(`Error loading MCP registry from ${REGISTRY_PATH}:`, error);
            throw new Error(`Failed to load MCP registry: ${error.message}`);
        }
    }
    return registryData;
}

/**
 * Lists all MCP entries in the registry.
 * @returns {object[]} An array of all MCP objects.
 */
function listMcps() {
    const data = loadRegistry();
    return Object.values(data);
}

/**
 * Gets a specific MCP entry by its ID.
 * @param {string} id The ID of the MCP (e.g., "prisma", "supabase").
 * @returns {object | undefined} The MCP object if found, otherwise undefined.
 */
function getMcp(id) {
    const data = loadRegistry();
    return data[id];
}

/**
 * Gets installation information for an MCP, interpolating variables.
 * It replaces placeholders like <VAR_NAME> in args with values from envValues.
 *
 * @param {string} id The ID of the MCP.
 * @param {object} [envValues={}] An object containing environment variable values (e.g., { "SUPABASE_ACCESS_TOKEN": "your_token" }).
 * @returns {{ command: string, args: string[], variables: object } | null} An object with the command, interpolated args, and variable definitions, or null if MCP not found.
 */
function getInstallationInfo(id, envValues = {}) {
    const mcp = getMcp(id);
    if (!mcp || !mcp.installation) {
        return null;
    }

    const { command, args = [], variables = {} } = mcp.installation;

    // Interpolate args
    const interpolatedArgs = args.map(arg => {
        const match = arg.match(/^<([A-Z_]+)>$/); // Match placeholders like <VAR_NAME>
        if (match) {
            const varName = match[1];
            // Use provided value or the original placeholder if not provided
            return envValues[varName] !== undefined ? envValues[varName] : arg;
        }
        return arg;
    });

    return {
        command: command,
        args: interpolatedArgs,
        variables: variables
    };
}

/**
 * Generates the full, ready-to-run command string for an MCP installation.
 *
 * @param {string} id The ID of the MCP.
 * @param {object} [envValues={}] An object containing environment variable values for interpolation.
 * @returns {string | null} The full command string or null if MCP not found or info is incomplete.
 */
function generateFullCommand(id, envValues = {}) {
    const installInfo = getInstallationInfo(id, envValues);
    if (!installInfo) {
        return null;
    }

    // Basic shell quoting heuristic (can be improved for complex cases)
    const quoteArg = (arg) => {
      const argStr = String(arg); // Ensure arg is a string
      if (/[\s"'<>|&;]/.test(argStr)) {
        // If arg contains spaces or special chars, wrap in double quotes
        // Escape existing double quotes and backslashes within
        return `"${argStr.replace(/\/g, '\\').replace(/"/g, '\"')}"`;
      }
      return argStr;
    };

    const commandParts = [installInfo.command, ...installInfo.args.map(quoteArg)];
    return commandParts.join(' ');
}

module.exports = {
    listMcps,
    getMcp,
    getInstallationInfo,
    generateFullCommand,
    // Expose loadRegistry mainly for potential testing or direct access if needed
    loadRegistry
};

// --- Basic Usage Example ---
/*
console.log("--- All MCPs ---");
console.log(listMcps().map(m => m.name));

console.log("\n--- Get Supabase ---");
const supabase = getMcp('supabase');
console.log(supabase);

console.log("\n--- Supabase Installation Info (Interpolated) ---");
const supabaseInstall = getInstallationInfo('supabase', { SUPABASE_ACCESS_TOKEN: 'YOUR_ACTUAL_TOKEN' });
console.log(supabaseInstall);

console.log("\n--- Supabase Full Command (Interpolated) ---");
const supabaseCommand = generateFullCommand('supabase', { SUPABASE_ACCESS_TOKEN: 'YOUR_ACTUAL_TOKEN' });
console.log(supabaseCommand);

console.log("\n--- Supabase Full Command (Not Interpolated) ---");
const supabaseCommandUninterpolated = generateFullCommand('supabase');
console.log(supabaseCommandUninterpolated);

console.log("\n--- Slack Variables ---");
const slackInstall = getInstallationInfo('slack');
console.log("Required Slack Variables:", slackInstall ? slackInstall.variables : 'Not found');
*/ 