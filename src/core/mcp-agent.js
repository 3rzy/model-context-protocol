/**
 * Model Context Protocol - Implementacja agenta z integracją Claude
 * 
 * Ten plik zawiera implementację agenta MCP, który koordynuje pracę
 * między modelem językowym Claude a narzędziami zewnętrznymi.
 */

const MCPClient = require('./mcp-client');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

/**
 * Klasa agenta MCP z integracją Claude
 */
class MCPAgent {
  /**
   * Tworzy nową instancję agenta MCP
   * @param {string} modelProvider - Identyfikator modelu Claude (np. 'claude-3-opus-20240229')
   * @param {MCPClient} mcpClient - Instancja klienta MCP
   * @param {object} options - Opcje konfiguracyjne
   * @param {boolean} options.debug - Czy włączyć tryb debugowania (domyślnie false)
   * @param {string} options.apiKey - Klucz API Anthropic (opcjonalnie, domyślnie z .env)
   */
  constructor(modelProvider, mcpClient, options = {}) {
    this.modelProvider = modelProvider || process.env.DEFAULT_CLAUDE_MODEL || 'claude-3-opus-20240229';
    this.mcpClient = mcpClient;
    this.debug = options.debug || (process.env.DEBUG === 'true');
    this.maxRetries = options.maxRetries || 3;
    
    // Inicjalizacja klienta Anthropic
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Brak klucza API Anthropic. Ustaw ANTHROPIC_API_KEY w zmiennych środowiskowych lub przekaż jako opcję.');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
    
    // Inicjalizacja kontekstu
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
      
      // Analiza zapytania użytkownika przy użyciu Claude
      const taskAnalysis = await this._analyzeUserQuery(userQuery);
      
      if (this.debug) {
        console.log('Analiza zapytania:', taskAnalysis);
      }
      
      // Generowanie planu działania przy użyciu Claude
      const plan = await this._generatePlan(taskAnalysis);
      
      if (this.debug) {
        console.log('Plan działania:', plan);
      }
      
      // Wykonanie planu
      const results = await this._executePlan(plan);
      
      if (this.debug) {
        console.log('Wyniki wykonania planu:', results);
      }
      
      // Generowanie odpowiedzi dla użytkownika przy użyciu Claude
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
   * Analizuje zapytanie użytkownika i określa intencje przy użyciu Claude
   * @param {string} query - Zapytanie użytkownika
   * @returns {Promise<object>} Analiza zapytania
   * @private
   */
  async _analyzeUserQuery(query) {
    const prompt = `Przeanalizuj poniższe zapytanie użytkownika i określ intencje.
    
Zapytanie: "${query}"

Twoim zadaniem jest określenie typu zadania i docelowej zawartości.
Typ zadania może być jednym z:
- analyze: analiza tekstu, danych lub informacji
- search: wyszukiwanie informacji
- generate: generowanie treści lub planu
- execute: wykonanie kodu lub operacji

Odpowiedz w formacie JSON:
{
  "type": "...",
  "targetContent": "..."
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelProvider,
        max_tokens: 1000,
        system: "Jesteś pomocnym asystentem, który analizuje zapytania użytkowników i określa ich intencje. Odpowiadaj tylko w formacie JSON zgodnie z instrukcją.",
        messages: [{ role: 'user', content: prompt }]
      });
      
      // Parsowanie odpowiedzi JSON
      const content = response.content[0].text;
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        // Jeśli nie można sparsować JSON, próbujemy wydobyć z tekstu
        const typeMatch = content.match(/"type":\s*"([^"]+)"/);
        const targetMatch = content.match(/"targetContent":\s*"([^"]+)"/);
        
        parsedResponse = {
          type: typeMatch ? typeMatch[1] : 'unknown',
          targetContent: targetMatch ? targetMatch[1] : query
        };
      }
      
      return {
        type: parsedResponse.type,
        targetContent: parsedResponse.targetContent,
        originalQuery: query
      };
    } catch (error) {
      console.error('Błąd podczas analizy zapytania:', error);
      
      // Fallback do prostej analizy w przypadku błędu
      const keywords = {
        analyze: ['analizuj', 'przeanalizuj', 'zbadaj', 'sprawdź'],
        search: ['znajdź', 'wyszukaj', 'poszukaj'],
        generate: ['wygeneruj', 'stwórz', 'utwórz', 'napisz'],
        execute: ['uruchom', 'wykonaj', 'odpal']
      };
      
      const queryLower = query.toLowerCase();
      let taskType = 'unknown';
      
      for (const [type, words] of Object.entries(keywords)) {
        if (words.some(word => queryLower.includes(word))) {
          taskType = type;
          break;
        }
      }
      
      return {
        type: taskType,
        targetContent: query,
        originalQuery: query
      };
    }
  }

  /**
   * Generuje plan działania na podstawie analizy zadania przy użyciu Claude
   * @param {object} taskAnalysis - Analiza zadania
   * @returns {Promise<object>} Plan działania
   * @private
   */
  async _generatePlan(taskAnalysis) {
    const { type, targetContent, originalQuery } = taskAnalysis;
    
    const prompt = `Na podstawie analizy zapytania użytkownika, opracuj plan działania z użyciem dostępnych narzędzi.

Zapytanie: "${originalQuery}"
Typ zadania: ${type}
Docelowa zawartość: ${targetContent}

Dostępne narzędzia:
- analyzeText: Analizuje tekst i zwraca statystyki
- extractEntities: Wyodrębnia encje z tekstu
- summarizeText: Generuje podsumowanie tekstu
- searchRepositories: Wyszukuje repozytoria GitHub
- searchWeb: Wyszukuje informacje w sieci
- generatePlan: Generuje plan implementacji zadania
- executeCode: Wykonuje kod JavaScript
- analyzeCode: Analizuje kod źródłowy

Odpowiedz w formacie JSON:
{
  "steps": [
    {
      "action": "nazwaAkcji",
      "parameters": {
        "param1": "wartość1",
        "param2": "wartość2"
      }
    }
  ]
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelProvider,
        max_tokens: 1500,
        system: "Jesteś pomocnym asystentem, który tworzy plany działania dla zapytań użytkowników. Odpowiadaj tylko w formacie JSON zgodnie z instrukcją.",
        messages: [{ role: 'user', content: prompt }]
      });
      
      // Parsowanie odpowiedzi JSON
      const content = response.content[0].text;
      let plan;
      
      try {
        // Usunięcie potencjalnych ogonków przed i po JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        plan = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Błąd parsowania planu:', parseError);
        
        // Fallback do prostego planu w przypadku błędu
        plan = { steps: [] };
        
        // Proste reguły w zależności od typu zadania
        switch (type) {
          case 'analyze':
            plan.steps.push({
              action: 'analyzeText',
              parameters: { text: targetContent }
            });
            break;
            
          case 'search':
            plan.steps.push({
              action: 'searchWeb',
              parameters: { query: targetContent }
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
              const codeMatch = targetContent.match(/```(?:javascript|js)?(.*?)```/s);
              const code = codeMatch ? codeMatch[1].trim() : targetContent;
              
              plan.steps.push({
                action: 'executeCode',
                parameters: { language: 'javascript', code }
              });
            }
            break;
            
          default:
            plan.steps.push({
              action: 'analyzeText',
              parameters: { text: targetContent }
            });
            break;
        }
      }
      
      return plan;
    } catch (error) {
      console.error('Błąd podczas generowania planu:', error);
      
      // Fallback do prostego planu w przypadku błędu
      const plan = { steps: [] };
      
      // Proste reguły w zależności od typu zadania (jak w bloku catch powyżej)
      switch (type) {
        case 'analyze':
          plan.steps.push({
            action: 'analyzeText',
            parameters: { text: targetContent }
          });
          break;
          
        case 'search':
          plan.steps.push({
            action: 'searchWeb',
            parameters: { query: targetContent }
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
            const codeMatch = targetContent.match(/```(?:javascript|js)?(.*?)```/s);
            const code = codeMatch ? codeMatch[1].trim() : targetContent;
            
            plan.steps.push({
              action: 'executeCode',
              parameters: { language: 'javascript', code }
            });
          }
          break;
          
        default:
          plan.steps.push({
            action: 'analyzeText',
            parameters: { text: targetContent }
          });
          break;
      }
      
      return plan;
    }
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
   * Generuje odpowiedź dla użytkownika na podstawie wyników wykonania planu przy użyciu Claude
   * @param {string} query - Oryginalne zapytanie użytkownika
   * @param {object[]} results - Wyniki wykonania planu
   * @returns {Promise<string>} Odpowiedź dla użytkownika
   * @private
   */
  async _generateUserResponse(query, results) {
    // Formatowanie wyników do tekstu
    let resultsText = '';
    
    for (const result of results) {
      resultsText += `### Wynik narzędzia: ${result.action}\n\n`;
      
      if (result.result && result.result.error) {
        resultsText += `Błąd: ${result.result.error}\n\n`;
      } else {
        resultsText += `Parametry: ${JSON.stringify(result.parameters, null, 2)}\n\n`;
        resultsText += `Wynik: ${JSON.stringify(result.result, null, 2)}\n\n`;
      }
    }
    
    const prompt = `Na podstawie zapytania użytkownika i wyników wykonanych narzędzi, wygeneruj przydatną odpowiedź.

Zapytanie użytkownika: "${query}"

Wyniki narzędzi:
${resultsText}

Wygeneruj kompletną, przydatną i dobrze sformatowaną odpowiedź, która:
1. Podsumowuje wykonane działania
2. Przedstawia kluczowe wnioski z wyników
3. Odpowiada bezpośrednio na zapytanie użytkownika
4. Jest napisana w języku polskim, w naturalnym, przyjaznym stylu
5. Używa formatowania markdown, aby poprawić czytelność

Użyj języka, który jest jasny i zwięzły, ale też szczegółowy tam, gdzie to ważne.`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelProvider,
        max_tokens: 2000,
        system: "Jesteś pomocnym asystentem, który generuje kompletne i przydatne odpowiedzi na podstawie wyników zapytań i działań narzędzi. Odpowiedzi powinny być jasne, dobrze sformatowane i odpowiadać na zapytanie użytkownika.",
        messages: [{ role: 'user', content: prompt }]
      });
      
      // Zwrócenie wygenerowanej odpowiedzi
      return response.content[0].text;
    } catch (error) {
      console.error('Błąd podczas generowania odpowiedzi:', error);
      
      // Fallback do prostej odpowiedzi w przypadku błędu
      let response = 'Oto wyniki:\n\n';
      
      for (const result of results) {
        response += `### ${result.action}:\n\n`;
        
        if (result.result && result.result.error) {
          response += `Wystąpił błąd: ${result.result.error}\n\n`;
        } else {
          // Proste formatowanie różnych typów wyników
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
