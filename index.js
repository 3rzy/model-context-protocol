/**
 * Model Context Protocol - Główny punkt wejściowy biblioteki
 * 
 * Ten plik eksportuje wszystkie publiczne elementy MCP.
 */

// Import komponentów rdzenia
const core = require('./src/core');

// Import narzędzi
const tools = require('./src/tools');

// Import funkcji pomocniczych do walidacji
const validation = require('./src/utils/validation');

// Eksport publicznego API
module.exports = {
  // Komponenty rdzenia
  MCPClient: core.MCPClient,
  MCPServer: core.MCPServer,
  MCPAgent: core.MCPAgent,
  
  // Narzędzia
  tools,
  
  // Funkcje pomocnicze
  validation,
  
  // Wersja protokołu
  version: '1.0'
};
