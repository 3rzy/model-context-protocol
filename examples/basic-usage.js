/**
 * Model Context Protocol - Podstawowy przykład użycia
 * 
 * Ten przykład pokazuje, jak utworzyć serwer MCP, zarejestrować narzędzia
 * i wywołać je za pomocą klienta MCP.
 */

const { MCPClient, MCPServer, tools } = require('../index');

// Funkcja główna
async function main() {
  try {
    console.log('Uruchamianie przykładu MCP...');
    
    // Utworzenie i konfiguracja serwera MCP
    const server = new MCPServer({ port: 3000 });
    
    // Rejestracja narzędzi
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
    
    // Uruchomienie serwera
    await server.start();
    console.log('Serwer MCP uruchomiony na porcie 3000');
    
    // Utworzenie klienta MCP
    const client = new MCPClient('http://localhost:3000');
    
    // Sprawdzenie czy serwer działa
    const pingResult = await client.ping();
    console.log('Ping serwera:', pingResult ? 'OK' : 'Błąd');
    
    // Przykładowy tekst do analizy
    const exampleText = `
    Model Context Protocol (MCP) to standard komunikacji pomiędzy modelami językowymi (LLM) 
    a kontekstem zewnętrznym. Protokół MCP umożliwia modelom efektywne wykorzystywanie narzędzi, 
    dostęp do danych oraz wykonywanie złożonych operacji w ustrukturyzowany sposób.
    
    Główne komponenty protokołu MCP to klient, serwer oraz agent. Klient odpowiada za wysyłanie 
    żądań do serwera, serwer za wykonywanie narzędzi, a agent za koordynację całego procesu.
    
    Protokół MCP może być wykorzystany w wielu zastosowaniach, takich jak agenty AI, asystenci 
    programistyczni, systemy analizy danych i chatboty z dostępem do zewnętrznych baz wiedzy.
    `;
    
    // Wywołanie narzędzia analyzeText
    console.log('\n--- Analiza tekstu ---');
    const analyzeResult = await client.callTool('analyzeText', { text: exampleText });
    console.log('Statystyki tekstu:');
    console.log(`- Liczba zdań: ${analyzeResult.statistics.sentenceCount}`);
    console.log(`- Liczba słów: ${analyzeResult.statistics.wordCount}`);
    console.log(`- Średnia długość słowa: ${analyzeResult.statistics.averageWordLength}`);
    console.log(`- Średnia długość zdania: ${analyzeResult.statistics.averageSentenceLength}`);
    
    console.log('\nNajczęściej występujące słowa:');
    analyzeResult.topWords.forEach(word => {
      console.log(`- "${word.word}": ${word.count} wystąpień`);
    });
    
    // Wywołanie narzędzia extractEntities
    console.log('\n--- Wyodrębnianie encji ---');
    const entitiesResult = await client.callTool('extractEntities', { text: exampleText });
    
    console.log('Technologie:');
    entitiesResult.entities.technologies.forEach(tech => {
      console.log(`- ${tech}`);
    });
    
    console.log('\nKoncepcje:');
    entitiesResult.entities.concepts.forEach(concept => {
      console.log(`- ${concept}`);
    });
    
    console.log('\nProcesy:');
    entitiesResult.entities.processes.forEach(process => {
      console.log(`- ${process}`);
    });
    
    // Wywołanie narzędzia summarizeText
    console.log('\n--- Podsumowanie tekstu ---');
    const summaryResult = await client.callTool('summarizeText', { 
      text: exampleText,
      maxLength: 150
    });
    
    console.log('Podsumowanie:');
    console.log(summaryResult.summary);
    console.log(`\nDługość: ${summaryResult.length} znaków`);
    console.log(`Stopień kompresji: ${summaryResult.compressionRatio}`);
    
    // Zatrzymanie serwera
    await server.stop();
    console.log('\nSerwer MCP zatrzymany');
    
  } catch (error) {
    console.error('Błąd:', error.message);
  }
}

// Uruchomienie przykładu
main();
