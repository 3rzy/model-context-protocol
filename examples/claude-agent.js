/**
 * Model Context Protocol - Przykład agenta zintegrowanego z Claude
 * 
 * Ten przykład pokazuje, jak użyć agenta MCP zintegrowanego z Claude
 * do przetwarzania zapytań użytkownika, planowania i wykonywania złożonych operacji.
 */

const { MCPClient, MCPServer, MCPAgent, tools } = require('../index');
const readline = require('readline');
require('dotenv').config();

// Utworzenie interfejsu readline do interakcji z użytkownikiem
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funkcja do zadawania pytań użytkownikowi
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Funkcja główna
async function main() {
  try {
    console.log('Uruchamianie agenta MCP zintegrowanego z Claude...');
    
    // Sprawdzenie czy klucz API jest dostępny
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Brak klucza API Anthropic! Utwórz plik .env z kluczem ANTHROPIC_API_KEY.');
      return;
    }
    
    // Pobranie portu z konfiguracji .env lub wartości domyślnej
    const port = process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT) : 3001;
    
    // Utworzenie i konfiguracja serwera MCP
    const server = new MCPServer({ port });
    
    // Rejestracja wszystkich dostępnych narzędzi
    server.registerTool(
      'analyzeText',
      tools.analyzeText,
      'Analizuje tekst i zwraca statystyki'
    );
    
    server.registerTool(
      'extractEntities',
      tools.extractEntities,
      'Wyodrębnia encje z tekstu'
    );
    
    server.registerTool(
      'summarizeText',
      tools.summarizeText,
      'Generuje podsumowanie tekstu'
    );
    
    server.registerTool(
      'searchRepositories',
      tools.searchRepositories,
      'Wyszukuje repozytoria GitHub'
    );
    
    server.registerTool(
      'generatePlan',
      tools.generatePlan,
      'Generuje plan implementacji zadania'
    );
    
    server.registerTool(
      'executeCode',
      tools.executeCode,
      'Wykonuje kod i zwraca wynik'
    );
    
    server.registerTool(
      'analyzeCode',
      tools.analyzeCode,
      'Analizuje kod źródłowy'
    );
    
    // Uruchomienie serwera
    await server.start();
    console.log(`Serwer MCP uruchomiony na porcie ${port}`);
    
    // Utworzenie klienta MCP
    const client = new MCPClient(`http://localhost:${port}`);
    
    // Sprawdzenie połączenia z serwerem
    const pingResult = await client.ping();
    if (!pingResult) {
      throw new Error('Nie można połączyć się z serwerem MCP');
    }
    
    // Pobranie modelu Claude do użycia
    const claudeModel = process.env.DEFAULT_CLAUDE_MODEL || 'claude-3-opus-20240229';
    console.log(`Używanie modelu Claude: ${claudeModel}`);
    
    // Utworzenie agenta MCP z integracją Claude
    const agent = new MCPAgent(claudeModel, client, { 
      debug: process.env.DEBUG === 'true', 
      apiKey: process.env.ANTHROPIC_API_KEY 
    });
    
    // Pobranie dostępnych narzędzi
    await agent.loadAvailableTools();
    
    console.log('\n=== Claude MCP Agent ===');
    console.log('Agent Claude jest gotowy do przetwarzania zapytań.');
    console.log('Wpisz "exit" aby zakończyć.');
    console.log('Przykłady zapytań:');
    console.log('- "Przeanalizuj ten tekst: Model Context Protocol to standard komunikacji..."');
    console.log('- "Wyszukaj repozytoria na temat AI agents"');
    console.log('- "Wygeneruj plan implementacji chatbota"');
    console.log('- "Wykonaj ten kod JavaScript: console.log(\'Hello MCP!\')"');
    
    // Główna pętla interakcji
    let userQuery = '';
    do {
      console.log('\n');
      userQuery = await askQuestion('> ');
      
      if (userQuery.toLowerCase() === 'exit') {
        break;
      }
      
      console.log('\nPrzetwarzanie zapytania przez Claude...');
      console.log('(To może zająć chwilę w zależności od złożoności zapytania)\n');
      
      try {
        // Przetwarzanie zapytania przez agenta Claude
        const startTime = Date.now();
        const response = await agent.processUserQuery(userQuery);
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        console.log('\nOdpowiedź Claude MCP Agent:');
        console.log(response);
        console.log(`\n(Czas przetwarzania: ${elapsedTime.toFixed(2)}s)`);
      } catch (error) {
        console.error('Błąd podczas przetwarzania zapytania:', error.message);
      }
      
    } while (userQuery.toLowerCase() !== 'exit');
    
    // Zamknięcie interfejsu readline
    rl.close();
    
    // Zatrzymanie serwera
    await server.stop();
    console.log('Serwer MCP zatrzymany');
    
  } catch (error) {
    console.error('Błąd:', error.message);
    rl.close();
  }
}

// Uruchomienie przykładu
main().catch(error => {
  console.error('Nieobsłużony błąd:', error);
  process.exit(1);
});
