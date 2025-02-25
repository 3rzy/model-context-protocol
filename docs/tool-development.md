# Model Context Protocol - Przewodnik tworzenia narzędzi

## Wprowadzenie

Niniejszy dokument przedstawia przewodnik tworzenia narzędzi zgodnych z protokołem MCP.

Narzędzia MCP są podstawowymi blokami funkcjonalnymi, które modele AI mogą wykorzystywać do wykonywania określonych zadań. Dobrze zaprojektowane narzędzie powinno być modułowe, łatwe w użyciu i zgodne ze standardem protokołu MCP.

## Struktura narzędzia MCP

Każde narzędzie MCP składa się z następujących elementów:

1. **Nazwa** - Unikalna nazwa narzędzia.
2. **Handler (funkcja obsługująca)** - Funkcja wykonująca zadanie.
3. **Opis** - Krótki opis funkcjonalności narzędzia.
4. **Schemat** - Definicja parametrów wejściowych i formatu wyniku.

## Krok po kroku: Tworzenie narzędzia MCP

### 1. Zdefiniuj funkcję obsługującą

Funkcja obsługująca to główna część narzędzia, która wykonuje faktyczne zadanie. Powinna przyjmować obiekt z parametrami i zwracać obiekt z wynikiem.

```javascript
async function myTool(params) {
  // Walidacja parametrów
  const { param1, param2 } = params;
  if (!param1) throw new Error("Brak wymaganego parametru 'param1'");
  
  // Wykonanie zadania
  const result = doSomething(param1, param2);
  
  // Zwrócenie wyniku
  return {
    output1: result.value1,
    output2: result.value2
  };
}
```

### 2. Zdefiniuj schemat narzędzia

Schemat opisuje parametry wejściowe i format wyniku narzędzia.

```javascript
const myToolSchema = {
  parameters: {
    type: "object",
    properties: {
      param1: { type: "string", description: "Pierwszy parametr" },
      param2: { type: "number", description: "Drugi parametr (opcjonalny)" }
    },
    required: ["param1"]
  },
  returns: {
    type: "object",
    properties: {
      output1: { type: "string", description: "Pierwszy wynik" },
      output2: { type: "number", description: "Drugi wynik" }
    }
  }
};
```

### 3. Zarejestruj narzędzie na serwerze MCP

```javascript
const server = new MCPServer();

server.registerTool(
  "myTool",          // Nazwa narzędzia
  myTool,             // Funkcja obsługująca
  "Opis narzędzia",  // Opis
  myToolSchema        // Schemat
);
```

## Najlepsze praktyki

### Nazewnictwo

- Używaj jasnych, opisowych nazw dla narzędzi (np. `analyzeText`, `searchRepositories`).
- Używaj camelCase dla nazw narzędzi i parametrów.

### Obsługa błędów

- Zawsze waliduj parametry wejściowe przed wykonaniem zadania.
- Zwracaj jasne i opisowe komunikaty błędów.
- Obsługuj wyjątki wewnątrz funkcji obsługującej.

```javascript
async function myTool(params) {
  try {
    // Walidacja parametrów
    const { param1 } = params;
    if (!param1) throw new Error("Brak wymaganego parametru 'param1'");
    
    // Wykonanie zadania
    const result = await doSomething(param1);
    
    return { output: result };
  } catch (error) {
    throw new Error(`Błąd w narzędziu 'myTool': ${error.message}`);
  }
}
```

### Dokumentacja

- Dodawaj szczegółowe komentarze JSDoc do funkcji obsługującej.
- Opisuj każdy parametr i wartość zwracaną.

```javascript
/**
 * Wykonuje określone zadanie.
 * 
 * @param {Object} params - Parametry narzędzia.
 * @param {string} params.param1 - Pierwszy parametr.
 * @param {number} [params.param2] - Drugi parametr (opcjonalny).
 * @returns {Object} Wynik zadania.
 * @returns {string} result.output1 - Pierwszy wynik.
 * @returns {number} result.output2 - Drugi wynik.
 */
async function myTool(params) {
  // Implementacja...
}
```

### Testowanie

- Testuj narzędzie z różnymi kombinacjami parametrów.
- Testuj przypadki graniczne i błędne.

```javascript
async function testMyTool() {
  const server = new MCPServer();
  server.registerTool("myTool", myTool, "Opis", myToolSchema);
  
  // Test 1: Poprawne parametry
  const response1 = await server.handleRequest({
    version: "1.0",
    action: {
      name: "myTool",
      parameters: { param1: "test", param2: 42 }
    }
  });
  console.log("Test 1:", response1);
  
  // Test 2: Brak wymaganego parametru
  const response2 = await server.handleRequest({
    version: "1.0",
    action: {
      name: "myTool",
      parameters: { param2: 42 }
    }
  });
  console.log("Test 2:", response2);
}
```

## Przykłady narzędzi

### Przykład 1: Analiza tekstu

```javascript
async function analyzeText(params) {
  const { text } = params;
  if (!text) throw new Error("Brak parametru 'text'");
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    statistics: {
      sentenceCount: sentences.length,
      wordCount: words.length,
      averageWordLength: (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2),
      averageSentenceLength: (words.length / sentences.length).toFixed(2)
    }
  };
}

server.registerTool(
  "analyzeText",
  analyzeText,
  "Analizuje tekst i zwraca statystyki",
  {
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Tekst do analizy" }
      },
      required: ["text"]
    }
  }
);
```

### Przykład 2: Wyszukiwanie repozytoriów

```javascript
async function searchRepositories(params) {
  const { query, perPage = 3 } = params;
  if (!query) throw new Error("Brak parametru 'query'");
  
  // W rzeczywistej implementacji, byłoby to wywołanie API GitHub
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}`,
    { headers: { 'Accept': 'application/vnd.github.v3+json' } }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    totalCount: data.total_count,
    items: data.items.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count
    }))
  };
}

server.registerTool(
  "searchRepositories",
  searchRepositories,
  "Wyszukuje repozytoria GitHub",
  {
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Zapytanie wyszukiwania" },
        perPage: { type: "number", description: "Liczba wyników na stronę" }
      },
      required: ["query"]
    }
  }
);
```

## Podsumowanie

Tworzenie narzędzi MCP to prosty proces, który wymaga zdefiniowania funkcji obsługującej, schematu i rejestracji narzędzia na serwerze MCP. Przestrzegając najlepszych praktyk, możesz tworzyć narzędzia, które są łatwe w użyciu, niezawodne i zgodne ze standardem protokołu MCP.