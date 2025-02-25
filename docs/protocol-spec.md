# Model Context Protocol - Specyfikacja

## Wprowadzenie

Model Context Protocol (MCP) to standard komunikacji pomiędzy modelami językowymi (LLM) a kontekstem zewnętrznym, umożliwiający modelom efektywne wykorzystywanie narzędzi zewnętrznych, dostęp do danych oraz wykonywanie złożonych operacji w ustrukturyzowany sposób.

Niniejszy dokument definiuje format żądań i odpowiedzi protokołu MCP w wersji 1.0.

## Format żądania MCP

Żądanie MCP jest obiektem JSON o następującej strukturze:

```json
{
  "version": "1.0",
  "action": {
    "name": "nazwaAkcji",
    "parameters": {
      "param1": "wartość1",
      "param2": "wartość2"
    }
  }
}
```

### Właściwości żądania

- `version` (string, wymagane): Wersja protokołu MCP, obecnie "1.0".
- `action` (object, wymagane): Obiekt zawierający informacje o akcji do wykonania.
  - `name` (string, wymagane): Nazwa akcji (narzędzia) do wykonania.
  - `parameters` (object, opcjonalne): Parametry akcji, specyficzne dla danego narzędzia.

## Format odpowiedzi MCP

Odpowiedź MCP jest obiektem JSON o następującej strukturze:

### Sukces

```json
{
  "version": "1.0",
  "status": "success",
  "result": {
    "output1": "wartość1",
    "output2": "wartość2"
  }
}
```

### Błąd

```json
{
  "version": "1.0",
  "status": "error",
  "error": "Komunikat błędu"
}
```

### Właściwości odpowiedzi

- `version` (string, wymagane): Wersja protokołu MCP, obecnie "1.0".
- `status` (string, wymagane): Status wykonania akcji, jedno z: "success", "error".
- `result` (object, wymagane dla status="success"): Wynik wykonania akcji, specyficzny dla danego narzędzia.
- `error` (string, wymagane dla status="error"): Komunikat błędu.

## Rejestracja narzędzi

Narzędzia MCP powinny być rejestrowane wraz z metadanymi opisującymi ich funkcjonalność, parametry oraz format wyników. Schemat rejestracji narzędzia:

```javascript
registerTool(
  "nazwaAkcji",
  handler,
  "Opis narzędzia",
  {
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Opis parametru 1" },
        param2: { type: "number", description: "Opis parametru 2" }
      },
      required: ["param1"]
    }
  }
);
```

## Standardowe narzędzia

Protokół MCP definiuje kilka standardowych narzędzi, które powinny być zaimplementowane przez każdy zgodny serwer:

### 1. analyzeText

Analizuje tekst i zwraca statystyki.

**Parametry:**
```json
{
  "text": "Tekst do analizy"
}
```

**Wynik:**
```json
{
  "statistics": {
    "sentenceCount": 5,
    "wordCount": 42,
    "averageWordLength": 5.2,
    "averageSentenceLength": 8.4
  },
  "topWords": [
    { "word": "example", "count": 3 },
    { "word": "protocol", "count": 2 }
  ]
}
```

### 2. summarizeText

Generuje podsumowanie tekstu.

**Parametry:**
```json
{
  "text": "Tekst do podsumowania",
  "maxLength": 200
}
```

**Wynik:**
```json
{
  "summary": "Wygenerowane podsumowanie...",
  "length": 42,
  "compressionRatio": "25.0%"
}
```

### 3. extractEntities

Wyodrębnia encje z tekstu.

**Parametry:**
```json
{
  "text": "Tekst do analizy"
}
```

**Wynik:**
```json
{
  "entities": {
    "technologies": ["Model Context Protocol"],
    "concepts": ["Narzędzia", "Funkcje"],
    "processes": ["Komunikacja"]
  }
}
```

### 4. searchRepositories

Wyszukuje repozytoria GitHub.

**Parametry:**
```json
{
  "query": "Zapytanie wyszukiwania",
  "perPage": 5
}
```

**Wynik:**
```json
{
  "totalCount": 42,
  "items": [
    {
      "name": "repo-name",
      "fullName": "owner/repo-name",
      "description": "Opis repozytorium",
      "url": "https://github.com/owner/repo-name",
      "stars": 123
    }
  ]
}
```

### 5. generatePlan

Generuje plan implementacji.

**Parametry:**
```json
{
  "task": "Zadanie do zaplanowania",
  "requirements": ["Wymaganie 1", "Wymaganie 2"]
}
```

**Wynik:**
```json
{
  "plan": [
    { "id": 1, "action": "analyzeProblem", "description": "Analiza problemu" },
    { "id": 2, "action": "implementSolution", "description": "Implementacja rozwiązania" }
  ]
}
```

## Bezpieczeństwo

Implementacje protokołu MCP powinny uwzględniać następujące aspekty bezpieczeństwa:

1. **Walidacja parametrów** - Wszystkie parametry żądań powinny być walidowane przed wykonaniem narzędzia.
2. **Izolacja wykonania** - Narzędzia powinny być wykonywane w izolowanym środowisku, aby zapobiec nieautoryzowanemu dostępowi do zasobów.
3. **Uwierzytelnianie i autoryzacja** - Dostęp do serwera MCP powinien być kontrolowany przez mechanizmy uwierzytelniania i autoryzacji.
4. **Bezpieczne przekazywanie danych** - Komunikacja między klientem a serwerem powinna być szyfrowana.

## Rozszerzenia

Protokół MCP może być rozszerzony o dodatkowe funkcjonalności w przyszłych wersjach, np. wsparcie dla równoległego wykonywania narzędzi, strumieniowania wyników, sesji kontekstowych itp.