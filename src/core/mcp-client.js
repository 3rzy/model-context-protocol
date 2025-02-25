/**
 * Model Context Protocol - Implementacja klienta
 * 
 * Ten plik zawiera implementację klienta MCP, który służy do
 * komunikacji z serwerem MCP i wykonywania wywołań narzędzi.
 */

const axios = require('axios');
const { createRequest, validateResponse } = require('./mcp-schema');

/**
 * Klasa klienta MCP
 */
class MCPClient {
  /**
   * Tworzy nową instancję klienta MCP
   * @param {string} serverUrl - URL serwera MCP
   * @param {object} options - Opcje konfiguracyjne
   * @param {number} options.timeout - Limit czasu w ms (domyślnie 30000)
   * @param {object} options.headers - Dodatkowe nagłówki HTTP
   */
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl;
    this.timeout = options.timeout || 30000;
    this.headers = options.headers || {};
  }

  /**
   * Wywołuje narzędzie na serwerze MCP
   * @param {string} actionName - Nazwa narzędzia do wywołania
   * @param {object} parameters - Parametry narzędzia
   * @returns {Promise<object>} Wynik wywołania narzędzia
   * @throws {Error} Gdy wystąpi błąd podczas wywołania
   */
  async callTool(actionName, parameters = {}) {
    try {
      // Tworzenie żądania MCP
      const request = createRequest(actionName, parameters);
      
      // Konfiguracja zapytania HTTP
      const config = {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        }
      };
      
      // Wykonanie zapytania HTTP do serwera MCP
      const response = await axios.post(this.serverUrl, request, config);
      
      // Pobranie odpowiedzi
      const mcpResponse = response.data;
      
      // Walidacja odpowiedzi
      const validationResult = validateResponse(mcpResponse);
      if (validationResult !== true) {
        throw new Error(`Nieprawidłowa odpowiedź MCP: ${validationResult}`);
      }
      
      // Obsługa błędu zwróconego przez serwer
      if (mcpResponse.status === 'error') {
        throw new Error(`Błąd serwera MCP: ${mcpResponse.error}`);
      }
      
      // Zwrócenie wyniku
      return mcpResponse.result;
    } catch (error) {
      // Obsługa błędów zapytania HTTP
      if (error.response) {
        // Serwer zwrócił status błędu (4xx, 5xx)
        throw new Error(`Błąd HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Brak odpowiedzi serwera
        throw new Error(`Brak odpowiedzi serwera: ${error.message}`);
      } else {
        // Inny błąd
        throw error;
      }
    }
  }
  
  /**
   * Sprawdza dostępność serwera MCP
   * @returns {Promise<boolean>} True jeśli serwer jest dostępny
   */
  async ping() {
    try {
      const response = await axios.get(`${this.serverUrl}/ping`, {
        timeout: this.timeout,
        headers: this.headers
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Pobiera listę dostępnych narzędzi z serwera MCP
   * @returns {Promise<object[]>} Lista dostępnych narzędzi
   */
  async getAvailableTools() {
    try {
      const result = await this.callTool('system.getTools', {});
      return result.tools || [];
    } catch (error) {
      throw new Error(`Nie udało się pobrać listy narzędzi: ${error.message}`);
    }
  }
}

module.exports = MCPClient;
