/**
 * Model Context Protocol - Eksport klas rdzenia
 * 
 * Ten plik importuje i eksportuje wszystkie klasy rdzenia MCP.
 */

const MCPClient = require('./mcp-client');
const MCPServer = require('./mcp-server');
const MCPAgent = require('./mcp-agent');
const MCPSchema = require('./mcp-schema');

module.exports = {
  MCPClient,
  MCPServer,
  MCPAgent,
  MCPSchema
};
