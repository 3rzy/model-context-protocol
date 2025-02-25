# Model Context Protocol - Przewodnik tworzenia narzędzi

## Wprowadzenie

Narzędzia MCP (Model Context Protocol) są kluczowym elementem umożliwiającym modelom językowym interakcję z systemami zewnętrznymi. Niniejszy przewodnik opisuje, jak tworzyć i implementować nowe narzędzia zgodne z protokołem MCP.

## Anatomia narzędzia MCP

Każde narzędzie MCP składa się z następujących elementów:

1. **Nazwa** - unikalna nazwa narzędzia, używana do identyfikacji w żądaniach MCP
2. **Handler** - funkcja obsługująca wywołanie narzędzia
3. **Opis** - krótki opis funkcjonalności narzędzia
4. **Schemat** - definicja parametrów wejściowych i formatu wyniku

## Tworzenie nowego narzędzia

### Krok 1: Zdefiniowanie funkcji handlera

Handler narzędzia to funkcja, która wykonuje faktyczną pracę narzędzia. Powinna przyjmować obiekt parametrów i zwracać wynik (lub promise z wynikiem).

```javascript
async function myTool(params) {
  // Walidacja parametrów
  const { requiredParam, optionalParam = 'domyślna wartość' } = params;
  if (!requiredParam) {
    throw new Error("Brak wymaganego parametru 'requiredParam'");
  }
  
  // Wykonanie logiki narzędzia
  const result = await performSomeOperation(requiredParam, optionalParam);
  
  // Zwrócenie wyniku
  return {
    output1: result.someProperty,
    output2: result.anotherProperty
  };
}
```

### Krok 2: Zdefiniowanie schematu narzędzia

Schema narzędzia opisuje parametry wejściowe i format wyniku. Jest używany do walidacji żądań i dokumentacji narzędzia.

```javascript
const myToolSchema = {
  parameters: {
    type: "object",
    properties: {
      requiredParam: { 
        type: "string", 
        description: "Opis parametru wymaganego" 
      },
      optionalParam: { 
        type: "string", 
        description: "Opis parametru opcjonalnego" 
      }
    },
    required: ["requiredParam"]
  },
  returns: {
    type: "object",
    properties: {
      output1: { 
        type: "string", 
        description: "Opis wyniku 1" 
      },
      output2: { 
        type: "number", 
        description: "Opis wyniku 2" 
      }
    }
  }
};
```

### Krok 3: Rejestracja narzędzia w serwerze MCP

Po zdefiniowaniu handlera i schematu, narzędzie należy zarejestrować w serwerze MCP.

```javascript
const server = new MCPServer();

server.registerTool(
  "myTool", // Nazwa narzędzia
  myTool,   // Handler narzędzia
  "Opis mojego narzędzia", // Opis narzędzia
  myToolSchema // Schemat narzędzia
);
```

## Najlepsze praktyki

### Walidacja parametrów

Zawsze waliduj parametry wejściowe na początku funkcji handlera. Zwracaj znaczące komunikaty błędów w przypadku problemów.

```javascript
function validateParams(params, requiredParams) {
  for (const param of requiredParams) {
    if (params[param] === undefined) {
      throw new Error(`Brak wymaganego parametru '${param}'`);
    }
  }
}

async function myTool(params) {
  validateParams(params, ['requiredParam']);
  // reszta kodu...
}
```

### Obsługa błędów

Zapewnij odpowiednią obsługę błędów w narzędziu. Łap wyjątki i zwracaj znaczące komunikaty błędów.

```javascript
async function myTool(params) {
  try {
    // Wykonanie logiki narzędzia
    const result = await performSomeOperation(params);
    return result;
  } catch (error) {
    // Logowanie błędu
    console.error(`Błąd w narzędziu myTool: ${error.message}`);
    
    // Rzucenie znaczącego błędu dla klienta
    throw new Error(`Nie udało się wykonać operacji: ${error.message}`);
  }
}
```

### Dokumentacja

Zapewnij szczegółową dokumentację narzędzia, w tym:

- Opis funkcjonalności
- Opis parametrów wejściowych
- Opis formatu wyniku
- Przykłady użycia

```javascript
/**
 * Przetwarza dane zgodnie z określonymi parametrami.
 * 
 * @param {Object} params - Parametry operacji
 * @param {string} params.requiredParam - Wymagany parametr
 * @param {string} [params.optionalParam] - Opcjonalny parametr
 * @returns {Object} Wynik operacji
 * @returns {string} result.output1 - Pierwszy wynik
 * @returns {number} result.output2 - Drugi wynik
 * 
 * @example
 * // Przykład użycia
 * const result = await myTool({
 *   requiredParam: 'wartość',
 *   optionalParam: 'opcjonalna wartość'
 * });
 */
async function myTool(params) {
  // Implementacja...
}
```

### Testowanie

Twórz testy jednostkowe dla narzędzi, aby upewnić się, że działają zgodnie z oczekiwaniami.

```javascript
const assert = require('assert');

// Test narzędzia
async function testMyTool() {
  // Test z prawidłowymi parametrami
  const result1 = await myTool({ requiredParam: 'test' });
  assert(result1.output1 !== undefined, 'Wynik powinien zawierać output1');
  assert(result1.output2 !== undefined, 'Wynik powinien zawierać output2');
  
  // Test z nieprawidłowymi parametrami
  try {
    await myTool({});
    assert(false, 'Powinien rzucić błąd');
  } catch (error) {
    assert(error.message.includes('requiredParam'), 'Powinien zgłosić brak wymaganego parametru');
  }
  
  console.log('Testy zakończone pomyślnie');
}

testMyTool().catch(console.error);
```

## Przykłady narzędzi

### Narzędzie do analizy tekstu

```javascript
async function analyzeText(params) {
  const { text } = params;
  if (!text) throw new Error("Brak parametru 'text'");
  
  // Analiza tekstu
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Analiza częstotliwości słów
  const wordFrequency = {};
  words.forEach(word => {
    const normalized = word.toLowerCase().replace(/[.,;:?!()]/g, '');
    if (normalized.length > 3) {
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    }
  });
  
  // Sortowanie słów według częstotliwości
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
  
  return {
    statistics: {
      sentenceCount: sentences.length,
      wordCount: words.length,
      averageWordLength: (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2),
      averageSentenceLength: (words.length / sentences.length).toFixed(2)
    },
    topWords
  };
}
```

### Narzędzie do wyszukiwania

```javascript
async function searchWeb(params) {
  const { query } = params;
  if (!query) throw new Error("Brak parametru 'query'");
  
  // W rzeczywistej implementacji, byłoby to wywołanie API wyszukiwarki
  // Tutaj symulujemy wyniki
  return {
    query,
    totalResults: 42,
    results: [
      {
        title: "Przykładowy wynik 1",
        url: "https://example.com/result1",
        snippet: "Fragment tekstu z wyniku wyszukiwania..."
      },
      {
        title: "Przykładowy wynik 2",
        url: "https://example.com/result2",
        snippet: "Inny fragment tekstu z wyniku wyszukiwania..."
      }
    ]
  };
}
```

## Integracja z zewnętrznymi API

Wiele narzędzi wymaga integracji z zewnętrznymi API. Oto zalecane podejście:

1. **Użyj bibliotek klienckich** - jeśli istnieją oficjalne biblioteki klienckie dla API, użyj ich
2. **Obsłuż uwierzytelnianie** - zapewnij bezpieczne przechowywanie i używanie kluczy API
3. **Zaimplementuj obsługę limitów** - uwzględnij limity zapytań i zaimplementuj mechanizmy ponownych prób
4. **Zaimplementuj cache** - przechowuj wyniki częstych zapytań w pamięci podręcznej

```javascript
const apiClient = new ExternalAPIClient({
  apiKey: process.env.API_KEY,
  maxRetries: 3,
  cacheEnabled: true
});

async function callExternalAPI(params) {
  const { query } = params;
  if (!query) throw new Error("Brak parametru 'query'");
  
  try {
    const result = await apiClient.search(query);
    return result;
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      throw new Error("Limit zapytań do API został przekroczony. Spróbuj ponownie później.");
    }
    throw new Error(`Błąd podczas wywoływania zewnętrznego API: ${error.message}`);
  }
}
```

## Zaawansowane funkcje

### Narzędzia z kontekstem

Niektóre narzędzia mogą wymagać utrzymania kontekstu między wywołaniami. Można to zaimplementować używając unikalnych identyfikatorów sesji.

```javascript
// Przechowywanie kontekstu
const sessions = new Map();

async function contextAwareTool(params) {
  const { sessionId, action, data } = params;
  if (!sessionId) throw new Error("Brak parametru 'sessionId'");
  
  // Pobranie lub utworzenie sesji
  let session = sessions.get(sessionId);
  if (!session) {
    session = { createdAt: Date.now(), data: {} };
    sessions.set(sessionId, session);
  }
  
  // Wykonanie akcji
  switch (action) {
    case 'set':
      session.data = { ...session.data, ...data };
      return { success: true, message: 'Dane zapisane' };
    
    case 'get':
      return { success: true, data: session.data };
    
    case 'clear':
      sessions.delete(sessionId);
      return { success: true, message: 'Sesja wyczyszczona' };
    
    default:
      throw new Error(`Nieznana akcja: ${action}`);
  }
}
```

### Narzędzia strumieniowe

Dla narzędzi, które generują wyniki w czasie rzeczywistym, można zaimplementować obsługę strumieni.

```javascript
async function streamingTool(params, onProgress) {
  const { query, timeout = 10000 } = params;
  if (!query) throw new Error("Brak parametru 'query'");
  
  // Symulacja generowania wyników w czasie rzeczywistym
  const startTime = Date.now();
  const results = [];
  
  while (Date.now() - startTime < timeout) {
    // Symulacja opóźnienia przetwarzania
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generowanie nowego wyniku
    const newResult = {
      timestamp: Date.now(),
      data: `Wynik dla "${query}" - ${results.length + 1}`
    };
    
    // Dodanie wyniku do listy
    results.push(newResult);
    
    // Wywołanie callbacku postępu
    if (onProgress) {
      onProgress({
        progress: Math.min((Date.now() - startTime) / timeout, 0.99),
        results,
        latestResult: newResult
      });
    }
    
    // Symulacja zakończenia przetwarzania
    if (results.length >= 5) break;
  }
  
  // Zwrócenie końcowego wyniku
  return {
    query,
    totalResults: results.length,
    executionTime: `${Date.now() - startTime}ms`,
    results
  };
}
```

## Optymalizacja wydajności

### Cachowanie wyników

Jeśli narzędzie wykonuje kosztowne obliczenia lub zapytania do zewnętrznych API, warto zaimplementować mechanizm cachowania wyników.

```javascript
// Prosty cache w pamięci
class SimpleCache {
  constructor(maxSize = 100, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl; // Czas życia wpisu w cache (ms)
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Sprawdzenie czy wpis nie wygasł
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key, value) {
    // Usunięcie najstarszego wpisu, jeśli cache jest pełny
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}

// Cache dla narzędzia
const toolCache = new SimpleCache();

async function cachedTool(params) {
  const { query } = params;
  if (!query) throw new Error("Brak parametru 'query'");
  
  // Generowanie klucza cache
  const cacheKey = `${query}`;
  
  // Sprawdzenie czy wynik jest w cache
  const cachedResult = toolCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Wykonanie operacji
  const result = await performExpensiveOperation(query);
  
  // Zapisanie wyniku w cache
  toolCache.set(cacheKey, result);
  
  return result;
}
```

### Przetwarzanie równoległe

Jeśli narzędzie wykonuje wiele niezależnych operacji, warto rozważyć przetwarzanie równoległe.

```javascript
async function parallelProcessingTool(params) {
  const { queries } = params;
  if (!queries || !Array.isArray(queries) || queries.length === 0) {
    throw new Error("Brak parametru 'queries' lub nieprawidłowy format");
  }
  
  // Wykonanie zapytań równolegle
  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        return await performOperation(query);
      } catch (error) {
        return { error: error.message, query };
      }
    })
  );
  
  return {
    totalQueries: queries.length,
    successCount: results.filter(r => !r.error).length,
    errorCount: results.filter(r => r.error).length,
    results
  };
}
```

## Zabezpieczenia

### Walidacja wejścia

Zawsze waliduj dane wejściowe, aby zapobiec atakom wstrzykiwania kodu i innym zagrożeniom bezpieczeństwa.

```javascript
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Usunięcie potencjalnie niebezpiecznych znaków
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

async function secureTool(params) {
  // Sanityzacja wszystkich parametrów
  const sanitizedParams = {};
  for (const [key, value] of Object.entries(params)) {
    sanitizedParams[key] = sanitizeInput(value);
  }
  
  // Wykonanie operacji z sanityzowanymi parametrami
  return await performOperation(sanitizedParams);
}
```

### Ograniczenie dostępu

Implementuj mechanizmy kontroli dostępu, aby ograniczyć dostęp do wrażliwych narzędzi.

```javascript
async function restrictedTool(params, context) {
  // Sprawdzenie uprawnień
  if (!context.user || !context.user.roles.includes('admin')) {
    throw new Error("Brak uprawnień do użycia tego narzędzia");
  }
  
  // Wykonanie operacji
  return await performOperation(params);
}
```

## Podsumowanie

Tworzenie narzędzi MCP wymaga starannego projektowania, implementacji i testowania. Postępując zgodnie z najlepszymi praktykami, można tworzyć narzędzia, które są bezpieczne, wydajne i łatwe w użyciu dla modeli językowych.

Pamiętaj o:

1. Dokładnej walidacji parametrów wejściowych
2. Odpowiedniej obsłudze błędów
3. Szczegółowej dokumentacji
4. Optymalizacji wydajności
5. Zapewnieniu bezpieczeństwa

Przez tworzenie wysokiej jakości narzędzi MCP, przyczyniasz się do rozszerzenia możliwości modeli językowych i tworzenia bardziej zaawansowanych agentów AI.
