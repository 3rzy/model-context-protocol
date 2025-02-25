/**
 * Model Context Protocol - Zaawansowany przykład z agentem
 * 
 * Ten przykład pokazuje, jak użyć agenta MCP do przetwarzania zapytań użytkownika,
 * planowania i wykonywania złożonych operacji.
 */

const { MCPClient, MCPServer, MCPAgent, tools } = require('../index');
const readline = require('readline');

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
    console.log('Uruchamianie zaawansowanego przykładu MCP z agentem...');
    
    // Utworzenie i konfiguracja serwera MCP
    const server = new MCPServer({ port: 3001 });
    
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
    console.log('Serwer MCP uruchomiony na porcie 3001');
    
    // Utworzenie klienta MCP
    const client = new MCPClient('http://localhost:3001');
    
    // Utworzenie agenta MCP
    const agent = new MCPAgent('GPT-4', client, { debug: true });
    
    // Pobranie dostępnych narzędzi
    await agent.loadAvailableTools();
    
    console.log('\n=== MCP Agent ===');
    console.log('Agent jest gotowy do przetwarzania zapytań.');
    console.log('Wpisz "exit" aby zakończyć.');
    
    // Główna pętla interakcji
    let userQuery = '';
    do {
      console.log('\n');
      userQuery = await askQuestion('> ');
      
      if (userQuery.toLowerCase() === 'exit') {
        break;
      }
      
      console.log('\nPrzetwarzanie zapytania...');
      
      // Przetwarzanie zapytania przez agenta
      const response = await agent.processUserQuery(userQuery);
      
      console.log('\nOdpowiedź agenta:');
      console.log(response);
      
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
main();
