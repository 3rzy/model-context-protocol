# Model Context Protocol (MCP)

![MCP Banner](https://via.placeholder.com/1200x400/1A1A2E/FFFFFF?text=Model+Context+Protocol)

## 📋 O projekcie

Model Context Protocol (MCP) to standard komunikacji pomiędzy modelami językowymi (LLM) a kontekstem zewnętrznym, umożliwiający modelom efektywne wykorzystywanie narzędzi, dostęp do danych oraz wykonywanie złożonych operacji w ustrukturyzowany sposób.

Projekt ten zawiera referencyjną implementację protokołu MCP w JavaScript, którą możesz wykorzystać jako podstawę do tworzenia zaawansowanych agentów AI.

## 🌟 Kluczowe cechy MCP

- Standardowy format komunikatów (żądania i odpowiedzi)
- Ustrukturyzowana definicja narzędzi i ich parametrów
- Obsługa wywołań funkcji i narzędzi zewnętrznych
- System planowania i sekwencjonowania zadań
- Mechanizm walidacji parametrów i wyników
- Zarządzanie kontekstem wykonania

## 📦 Struktura repozytorium

```
model-context-protocol/
├── src/
│   ├── core/
│   │   ├── mcp-schema.js        # Definicja schematu protokołu MCP
│   │   ├── mcp-client.js        # Implementacja klienta MCP
│   │   ├── mcp-server.js        # Implementacja serwera MCP
│   │   └── mcp-agent.js         # Implementacja agenta MCP
│   │
│   ├── tools/
│   │   ├── text-tools.js        # Narzędzia do analizy tekstu
│   │   ├── search-tools.js      # Narzędzia wyszukiwania
│   │   └── code-tools.js        # Narzędzia do pracy z kodem
│   │
│   └── utils/
│       └── validation.js        # Funkcje pomocnicze do walidacji
│
├── examples/
│   ├── basic-usage.js           # Podstawowy przykład użycia MCP
│   └── advanced-agent.js        # Zaawansowany agent z MCP
│
├── docs/
│   ├── protocol-spec.md         # Specyfikacja protokołu
│   ├── architecture.md          # Architektura systemu
│   └── tool-development.md      # Przewodnik tworzenia narzędzi
│
├── index.js                     # Punkt wejściowy biblioteki
├── package.json                 # Plik konfiguracyjny npm
└── README.md                    # Ten plik
```

## 🚀 Szybki start

### Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/3rzy/model-context-protocol.git
cd model-context-protocol

# Zainstaluj zależności
npm install
```

### Podstawowe użycie

```javascript
const { MCPClient, MCPServer, MCPAgent } = require('./src/core');

// Utwórz serwer MCP
const server = new MCPServer();

// Zarejestruj narzędzie
server.registerTool(
  "analyzeText",
  async (params) => {
    const { text } = params;
    // Implementacja analizy tekstu...
    return { result: "Wynik analizy..." };
  },
  "Analizuje tekst i zwraca statystyki"
);

// Utwórz klienta MCP
const client = new MCPClient("https://mcp-server.example.com");

// Wywołaj narzędzie
const result = await client.callTool("analyzeText", { text: "Przykładowy tekst" });
console.log(result);
```

### Tworzenie agenta AI z MCP

```javascript
// Utwórz agenta MCP
const agent = new MCPAgent("GPT-4", mcpClient);

// Przetwórz zapytanie użytkownika
const response = await agent.processUserQuery(
  "Przeanalizuj ten tekst o MCP: Model Context Protocol to standard komunikacji..."
);

console.log(response);
```

## 🔧 Format protokołu MCP

### Żądanie MCP

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

### Odpowiedź MCP

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

W przypadku błędu:

```json
{
  "version": "1.0",
  "status": "error",
  "error": "Komunikat błędu"
}
```

## 🛠️ Dostępne narzędzia

Repozytorium zawiera implementacje następujących narzędzi:

1. **analyzeText** - Analizuje tekst i zwraca statystyki
   - Parametry: `{ "text": "Tekst do analizy" }`
   - Zwraca: Statystyki tekstu i najczęściej występujące słowa

2. **extractEntities** - Wyodrębnia encje z tekstu
   - Parametry: `{ "text": "Tekst do analizy" }`
   - Zwraca: Listy znalezionych technologii, koncepcji i procesów

3. **generatePlan** - Generuje plan wykonania zadania
   - Parametry: `{ "task": "Zadanie do wykonania", "requirements": ["Wymaganie 1", "Wymaganie 2"] }`
   - Zwraca: Plan kroków do wykonania

4. **searchRepositories** - Wyszukuje repozytoria GitHub
   - Parametry: `{ "query": "Zapytanie wyszukiwania", "perPage": 5 }`
   - Zwraca: Listę znalezionych repozytoriów

5. **executeCode** - Wykonuje kod i zwraca wynik
   - Parametry: `{ "language": "javascript", "code": "console.log('Hello world');" }`
   - Zwraca: Wynik wykonania kodu

## 🌐 Zastosowania

Model Context Protocol może być wykorzystany w wielu zastosowaniach, takich jak:

- Agenty AI wykonujące złożone zadania w wielu domenach
- Asystenci programistyczni z dostępem do repozytoriów kodu
- Systemy analizy danych z możliwością wywoływania algorytmów
- Chatboty z dostępem do zewnętrznych baz wiedzy i systemów
- Automatyzacja procesów biznesowych z wykorzystaniem AI

## 💡 Korzyści z używania MCP

- Standardyzacja komunikacji między modelami AI a narzędziami zewnętrznymi
- Zwiększenie możliwości modeli poprzez dostęp do specjalizowanych narzędzi
- Łatwiejsza integracja modeli AI z istniejącymi systemami
- Poprawa weryfikowalności i debugowania interakcji modeli z narzędziami
- Możliwość rozszerzania funkcjonalności modeli bez konieczności ich ponownego trenowania

## 📚 Dokumentacja

Pełna dokumentacja protokołu MCP jest dostępna w folderze `docs/`:

- [Specyfikacja protokołu](docs/protocol-spec.md)
- [Architektura systemu](docs/architecture.md)
- [Przewodnik tworzenia narzędzi](docs/tool-development.md)

## 🤝 Wkład i współpraca

Zachęcamy do wnoszenia wkładu w rozwój projektu Model Context Protocol! 

1. Sklonuj repozytorium
2. Utwórz nową gałąź (`git checkout -b feature/twoja-funkcja`)
3. Zatwierdź zmiany (`git commit -m 'Dodanie nowej funkcji'`)
4. Wypchnij zmiany do repozytorium (`git push origin feature/twoja-funkcja`)
5. Utwórz Pull Request

## 📄 Licencja

Ten projekt jest udostępniany na licencji MIT. Szczegółowe informacje znajdziesz w pliku [LICENSE](LICENSE).

## 📧 Kontakt

W przypadku pytań lub sugestii, proszę o kontakt poprzez Issues na GitHubie.