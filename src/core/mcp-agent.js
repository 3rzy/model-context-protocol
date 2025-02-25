/**
 * Model Context Protocol - Implementacja agenta
 * 
 * Ten plik zawiera implementację agenta MCP, który koordynuje pracę
 * między modelem językowym a narzędziami zewnętrznymi.
 */

const MCPClient = require('./mcp-client');

/**
 * Klasa agenta MCP
 */
class MCPAgent {
  /**
   * Tworzy nową instancję agenta MCP
   * @param {string} modelProvider - Identyfikator modelu językowego (np. 'GPT-4', 'Claude')
   * @param {MCPClient} mcpClient - Instancja klienta MCP
   * @param {object} options - Opcje konfiguracyjne
   * @param {boolean} options.debug - Czy włączyć tryb debugowania (domyślnie false)
   */
  constructor(modelProvider, mcpClient, options = {}) {
    this.modelProvider = modelProvider;
    this.mcpClient = mcpClient;
    this.debug = options.debug || false;
    this.maxRetries = options.maxRetries || 3;
    this.context = {
      conversations: [],
      tools: []
    };
  }

  /**
   * Przetwarza zapytanie użytkownika i generuje odpowiedź
   * @param {string} userQuery - Zapytanie użytkownika
   * @returns {Promise<string>} Odpowiedź dla użytkownika
   */
  async processUserQuery(userQuery) {
    try {
      // Dodanie zapytania do kontekstu
      this._addToConversation('user', userQuery);
      
      // Analiza zapytania użytkownika
      const taskAnalysis = await this._analyzeUserQuery(userQuery);
      
      if (this.debug) {
        console.log('Analiza zapytania:', taskAnalysis);
      }
      
      // Generowanie planu działania
      const plan = await this._generatePlan(taskAnalysis);
      
      if (this.debug) {
        console.log('Plan działania:', plan);
      }
      
      // Wykonanie planu
      const results = await this._executePlan(plan);
      
      if (this.debug) {
        console.log('Wyniki wykonania planu:', results);
      }
      
      // Generowanie odpowiedzi dla użytkownika
      const response = await this._generateUserResponse(userQuery, results);
      
      // Dodanie odpowiedzi do kontekstu
      this._addToConversation('assistant', response);
      
      return response;
    } catch (error) {
      const errorMessage = `Wystąpił błąd podczas przetwarzania zapytania: ${error.message}`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Analizuje zapytanie użytkownika i określa intencje
   * @param {string} query - Zapytanie użytkownika
   * @returns {Promise<object>} Analiza zapytania
   * @private
   */
  async _analyzeUserQuery(query) {
    // W rzeczywistej implementacji, byłoby to zapytanie do modelu językowego
    // Tutaj symulujemy prostą analizę
    
    const keywords = {
      analyze: ['analizuj', 'przeanalizuj', 'zbadaj', 'sprawdź'],
      search: ['znajdź', 'wyszukaj', 'poszukaj'],
      generate: ['wygeneruj', 'stwórz', 'utwórz', 'napisz'],
      execute: ['uruchom', 'wykonaj', 'odpal']
    };
    
    const queryLower = query.toLowerCase();
    let taskType = 'unknown';
    
    // Określenie typu zadania na podstawie słów kluczowych
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => queryLower.includes(word))) {
        taskType = type;
        break;
      }
    }
    
    // Wyodrębnienie potencjalnych parametrów
    let targetContent = query;
    if (taskType !== 'unknown') {
      for (const word of keywords[taskType]) {
        targetContent = targetContent.replace(new RegExp(word, 'i'), '');
      }
      targetContent = targetContent.trim();
    }
    
    return {
      type: taskType,
      targetContent,
      originalQuery: query
    };
  }

  /**
   * Generuje plan działania na podstawie analizy zadania
   * @param {object} taskAnalysis - Analiza zadania
   * @returns {Promise<object>} Plan działania
   * @private
   */
  async _generatePlan(taskAnalysis) {
    // W rzeczywistej implementacji, byłoby to zapytanie do modelu językowego
    // Tutaj implementujemy prostą logikę generowania planu
    
    const { type, targetContent } = taskAnalysis;
    const plan = {
      steps: []
    };
    
    switch (type) {
      case 'analyze':
        plan.steps.push({
          action: 'analyzeText',
          parameters: { text: targetContent }
        });
        plan.steps.push({
          action: 'extractEntities',
          parameters: { text: targetContent }
        });
        break;
        
      case 'search':
        plan.steps.push({
          action: 'searchRepositories',
          parameters: { query: targetContent, perPage: 5 }
        });
        break;
        
      case 'generate':
        plan.steps.push({
          action: 'generatePlan',
          parameters: { task: targetContent, requirements: [] }
        });
        break;
        
      case 'execute':
        if (targetContent.includes('javascript') || targetContent.includes('js')) {
          // Wyodrębnij kod do wykonania
          const codeMatch = targetContent.match(/```(?:javascript|js)?(.*?)```/s);
          const code = codeMatch ? codeMatch[1].trim() : targetContent;
          
          plan.steps.push({
            action: 'executeCode',
            parameters: { language: 'javascript', code }
          });
        }
        break;
        
      default:
        // Domyślnie analizujemy tekst
        plan.steps.push({
          action: 'analyzeText',
          parameters: { text: targetContent }
        });
        break;
    }
    
    return plan;
  }

  /**
   * Wykonuje plan działania
   * @param {object} plan - Plan działania
   * @returns {Promise<object[]>} Wyniki wykonania planu
   * @private
   */
  async _executePlan(plan) {
    const results = [];
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      
      if (this.debug) {
        console.log(`Wykonywanie kroku ${i + 1}/${plan.steps.length}: ${step.action}`);
      }
      
      let retries = 0;
      let success = false;
      let stepResult;
      
      while (!success && retries < this.maxRetries) {
        try {
          stepResult = await this.mcpClient.callTool(step.action, step.parameters);
          success = true;
        } catch (error) {
          retries++;
          if (retries >= this.maxRetries) {
            stepResult = { error: error.message };
          } else {
            // Poczekaj przed kolejną próbą
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      results.push({
        action: step.action,
        parameters: step.parameters,
        result: stepResult
      });
    }
    
    return results;
  }

  /**
   * Generuje odpowiedź dla użytkownika na podstawie wyników wykonania planu
   * @param {string} query - Oryginalne zapytanie użytkownika
   * @param {object[]} results - Wyniki wykonania planu
   * @returns {Promise<string>} Odpowiedź dla użytkownika
   * @private
   */
  async _generateUserResponse(query, results) {
    // W rzeczywistej implementacji, byłoby to zapytanie do modelu językowego
    // Tutaj implementujemy prostą logikę generowania odpowiedzi
    
    let response = 'Oto wyniki:\n\n';
    
    for (const result of results) {
      response += `### ${result.action}:\n\n`;
      
      if (result.result && result.result.error) {
        response += `Wystąpił błąd: ${result.result.error}\n\n`;
      } else {
        if (result.action === 'analyzeText' && result.result.statistics) {
          const stats = result.result.statistics;
          response += `Statystyki tekstu:\n`;
          response += `- Liczba zdań: ${stats.sentenceCount}\n`;
          response += `- Liczba słów: ${stats.wordCount}\n`;
          response += `- Średnia długość słowa: ${stats.averageWordLength}\n`;
          response += `- Średnia długość zdania: ${stats.averageSentenceLength}\n\n`;
          
          if (result.result.topWords) {
            response += `Najczęściej występujące słowa:\n`;
            result.result.topWords.forEach(word => {
              response += `- "${word.word}": ${word.count} wystąpień\n`;
            });
            response += '\n';
          }
        } else if (result.action === 'extractEntities' && result.result.entities) {
          const entities = result.result.entities;
          
          if (entities.technologies && entities.technologies.length > 0) {
            response += `Technologie: ${entities.technologies.join(', ')}\n`;
          }
          
          if (entities.concepts && entities.concepts.length > 0) {
            response += `Koncepcje: ${entities.concepts.join(', ')}\n`;
          }
          
          if (entities.processes && entities.processes.length > 0) {
            response += `Procesy: ${entities.processes.join(', ')}\n`;
          }
          
          response += '\n';
        } else if (result.action === 'searchRepositories' && result.result.items) {
          response += `Znalezione repozytoria:\n\n`;
          
          result.result.items.forEach((repo, index) => {
            response += `${index + 1}. **${repo.name}** (${repo.fullName})\n`;
            response += `   ${repo.description || 'Brak opisu'}\n`;
            response += `   ⭐ ${repo.stars} | ${repo.url}\n\n`;
          });
        } else if (result.action === 'generatePlan' && result.result.plan) {
          response += `Plan:\n\n`;
          
          result.result.plan.forEach((step, index) => {
            response += `${index + 1}. ${step.action}: ${step.description}\n`;
          });
          
          response += '\n';
        } else if (result.action === 'executeCode') {
          response += `Wynik wykonania kodu:\n\`\`\`\n${JSON.stringify(result.result, null, 2)}\n\`\`\`\n\n`;
        } else {
          response += `Wynik: ${JSON.stringify(result.result, null, 2)}\n\n`;
        }
      }
    }
    
    return response;
  }
  
  /**
   * Dodaje wiadomość do historii konwersacji
   * @param {string} role - Rola ('user' lub 'assistant')
   * @param {string} content - Treść wiadomości
   * @private
   */
  _addToConversation(role, content) {
    this.context.conversations.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Ograniczenie długości historii konwersacji
    if (this.context.conversations.length > 20) {
      this.context.conversations.shift();
    }
  }
  
  /**
   * Pobiera dostępne narzędzia z serwera MCP
   * @returns {Promise<void>}
   */
  async loadAvailableTools() {
    try {
      const tools = await this.mcpClient.getAvailableTools();
      this.context.tools = tools;
      
      if (this.debug) {
        console.log(`Załadowano ${tools.length} narzędzi`);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania narzędzi:', error.message);
    }
  }
  
  /**
   * Resetuje kontekst konwersacji
   */
  resetContext() {
    this.context.conversations = [];
    
    if (this.debug) {
      console.log('Kontekst konwersacji zresetowany');
    }
  }
}

module.exports = MCPAgent;
