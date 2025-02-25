/**
 * Model Context Protocol - Implementacja serwera
 * 
 * Ten plik zawiera implementację serwera MCP, który obsługuje żądania
 * i wykonuje narzędzia zarejestrowane w systemie.
 */

const express = require('express');
const { validateRequest, createSuccessResponse, createErrorResponse } = require('./mcp-schema');

/**
 * Klasa serwera MCP
 */
class MCPServer {
  /**
   * Tworzy nową instancję serwera MCP
   * @param {object} options - Opcje konfiguracyjne
   * @param {number} options.port - Port nasłuchu (domyślnie 3000)
   * @param {boolean} options.enableLogging - Czy włączyć logowanie (domyślnie true)
   */
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.enableLogging = options.enableLogging !== false;
    this.tools = new Map();
    this.toolSchemas = new Map();
    this.toolDescriptions = new Map();
    this.app = express();
    
    // Rejestracja wbudowanych narzędzi systemowych
    this._registerSystemTools();
    
    // Konfiguracja middleware Express
    this.app.use(express.json());
    this._setupRoutes();
  }
  
  /**
   * Rejestruje narzędzie w serwerze MCP
   * @param {string} name - Nazwa narzędzia
   * @param {Function} handler - Funkcja obsługująca wywołanie narzędzia
   * @param {string} description - Opis narzędzia
   * @param {object} schema - Schemat parametrów narzędzia (opcjonalny)
   */
  registerTool(name, handler, description, schema = null) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Nazwa narzędzia musi być niepustym ciągiem znaków');
    }
    
    if (typeof handler !== 'function') {
      throw new Error('Handler narzędzia musi być funkcją');
    }
    
    if (typeof description !== 'string') {
      throw new Error('Opis narzędzia musi być ciągiem znaków');
    }
    
    // Sprawdzenie czy narzędzie nie jest już zarejestrowane
    if (this.tools.has(name)) {
      throw new Error(`Narzędzie o nazwie "${name}" jest już zarejestrowane`);
    }
    
    // Rejestracja narzędzia
    this.tools.set(name, handler);
    this.toolDescriptions.set(name, description);
    
    if (schema) {
      this.toolSchemas.set(name, schema);
    }
    
    if (this.enableLogging) {
      console.log(`Zarejestrowano narzędzie: ${name}`);
    }
  }
  
  /**
   * Uruchamia serwer MCP
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        if (this.enableLogging) {
          console.log(`Serwer MCP uruchomiony na porcie ${this.port}`);
        }
        resolve();
      });
    });
  }
  
  /**
   * Zatrzymuje serwer MCP
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          if (this.enableLogging) {
            console.log('Serwer MCP zatrzymany');
          }
          resolve();
        }
      });
    });
  }
  
  /**
   * Obsługuje żądanie MCP
   * @param {object} request - Żądanie MCP
   * @returns {Promise<object>} Odpowiedź MCP
   */
  async handleRequest(request) {
    try {
      // Walidacja żądania
      const validationResult = validateRequest(request);
      if (validationResult !== true) {
        return createErrorResponse(`Nieprawidłowe żądanie: ${validationResult}`);
      }
      
      const { name, parameters } = request.action;
      
      // Sprawdzenie czy narzędzie istnieje
      if (!this.tools.has(name)) {
        return createErrorResponse(`Nieznane narzędzie: ${name}`);
      }
      
      // Pobranie handlera narzędzia
      const toolHandler = this.tools.get(name);
      
      try {
        // Wykonanie narzędzia
        const result = await toolHandler(parameters);
        return createSuccessResponse(result);
      } catch (toolError) {
        return createErrorResponse(`Błąd podczas wykonywania narzędzia: ${toolError.message}`);
      }
    } catch (error) {
      return createErrorResponse(`Nieoczekiwany błąd: ${error.message}`);
    }
  }
  
  /**
   * Konfiguruje trasy Express
   * @private
   */
  _setupRoutes() {
    // Endpoint do przetwarzania żądań MCP
    this.app.post('/', async (req, res) => {
      const mcpResponse = await this.handleRequest(req.body);
      res.json(mcpResponse);
    });
    
    // Endpoint do sprawdzenia statusu serwera
    this.app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    // Endpoint do pobierania dostępnych narzędzi
    this.app.get('/tools', (req, res) => {
      const tools = Array.from(this.tools.keys()).map(name => ({
        name,
        description: this.toolDescriptions.get(name),
        schema: this.toolSchemas.get(name) || null
      }));
      
      res.json({ tools });
    });
  }
  
  /**
   * Rejestruje wbudowane narzędzia systemowe
   * @private
   */
  _registerSystemTools() {
    // Narzędzie do pobierania listy dostępnych narzędzi
    this.registerTool(
      'system.getTools',
      async () => {
        const tools = Array.from(this.tools.keys())
          .filter(name => !name.startsWith('system.'))
          .map(name => ({
            name,
            description: this.toolDescriptions.get(name),
            schema: this.toolSchemas.get(name) || null
          }));
        
        return { tools };
      },
      'Pobiera listę dostępnych narzędzi'
    );
    
    // Narzędzie do sprawdzania statusu serwera
    this.registerTool(
      'system.ping',
      async () => {
        return {
          timestamp: Date.now(),
          status: 'active',
          version: '1.0'
        };
      },
      'Sprawdza status serwera'
    );
  }
}

module.exports = MCPServer;
