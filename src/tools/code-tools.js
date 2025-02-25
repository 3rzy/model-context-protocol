/**
 * Model Context Protocol - Narzędzia do pracy z kodem
 * 
 * Ten plik zawiera implementacje narzędzi do pracy z kodem.
 */

/**
 * Funkcja pomocnicza do bezpiecznego wykonania kodu JavaScript
 * @param {string} code - Kod do wykonania
 * @returns {Promise<object>} Rezultat wykonania
 */
async function safeEval(code) {
  // W środowisku Node.js można użyć vm lub child_process
  // Tutaj dla uproszczenia używamy eval, ale w produkcji
  // należy użyć bezpieczniejszego podejścia
  try {
    // Przygotowanie kontekstu wykonania
    const context = {
      result: null,
      logs: [],
      errors: []
    };
    
    // Funkcja do przechwytywania console.log
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      context.logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
    
    // Wykonanie kodu
    try {
      context.result = eval(code);
      
      // Obsługa Promise
      if (context.result instanceof Promise) {
        context.result = await context.result;
      }
    } catch (error) {
      context.errors.push(error.message);
    }
    
    // Przywrócenie oryginalnego console.log
    console.log = originalConsoleLog;
    
    return {
      result: context.result,
      logs: context.logs,
      errors: context.errors
    };
  } catch (error) {
    return {
      result: null,
      logs: [],
      errors: [error.message]
    };
  }
}

/**
 * Wykonuje kod i zwraca wynik
 * @param {object} params - Parametry
 * @param {string} params.language - Język programowania
 * @param {string} params.code - Kod do wykonania
 * @returns {Promise<object>} Wynik wykonania kodu
 */
async function executeCode(params) {
  const { language, code } = params;
  
  if (!language) {
    throw new Error("Brak wymaganego parametru 'language'");
  }
  
  if (!code) {
    throw new Error("Brak wymaganego parametru 'code'");
  }
  
  // Obecnie wspieramy tylko JavaScript
  if (language.toLowerCase() !== 'javascript' && language.toLowerCase() !== 'js') {
    throw new Error(`Nieobsługiwany język: ${language}. Obecnie obsługujemy tylko JavaScript.`);
  }
  
  const result = await safeEval(code);
  
  return {
    language,
    output: result.logs.length > 0 ? result.logs.join('\n') : null,
    errors: result.errors.length > 0 ? result.errors : null,
    result: result.result !== undefined ? result.result : null
  };
}

/**
 * Generuje plan implementacji zadania
 * @param {object} params - Parametry
 * @param {string} params.task - Zadanie do zaplanowania
 * @param {string[]} params.requirements - Wymagania (opcjonalnie)
 * @returns {Promise<object>} Plan implementacji
 */
async function generatePlan(params) {
  const { task, requirements = [] } = params;
  
  if (!task) {
    throw new Error("Brak wymaganego parametru 'task'");
  }
  
  // W rzeczywistej implementacji użylibyśmy modelu języka
  // Tutaj generujemy plan na podstawie prostych reguł
  
  // Przykładowe kroki typowe dla większości zadań programistycznych
  let planSteps = [
    {
      id: 1,
      action: "analyzeProblem",
      description: "Analiza problemu i wymagań"
    },
    {
      id: 2,
      action: "createSolution",
      description: "Zaprojektowanie rozwiązania"
    },
    {
      id: 3,
      action: "implementSolution",
      description: "Implementacja rozwiązania"
    },
    {
      id: 4,
      action: "testSolution",
      description: "Testowanie rozwiązania"
    },
    {
      id: 5,
      action: "refineAndDeploy",
      description: "Optymalizacja i wdrożenie"
    }
  ];
  
  // Dodatkowe kroki na podstawie wymagań
  if (requirements.length > 0) {
    planSteps.splice(2, 0, {
      id: 2.5,
      action: "validateRequirements",
      description: "Walidacja zgodności z wymaganiami: " + requirements.join(', ')
    });
  }
  
  // Dodatkowe kroki na podstawie zadania
  const taskLower = task.toLowerCase();
  
  if (taskLower.includes('api') || taskLower.includes('rest') || taskLower.includes('http')) {
    planSteps.splice(3, 0, {
      id: 3.5,
      action: "designAPI",
      description: "Projektowanie interfejsu API"
    });
  }
  
  if (taskLower.includes('database') || taskLower.includes('db') || taskLower.includes('baza danych')) {
    planSteps.splice(3, 0, {
      id: 3.5,
      action: "designDatabaseSchema",
      description: "Projektowanie schematu bazy danych"
    });
  }
  
  if (taskLower.includes('security') || taskLower.includes('bezpieczeństwo')) {
    planSteps.splice(4, 0, {
      id: 4.5,
      action: "securityAudit",
      description: "Audyt bezpieczeństwa"
    });
  }
  
  // Poprawienie indeksów
  planSteps = planSteps.map((step, index) => ({
    ...step,
    id: index + 1
  }));
  
  return {
    task,
    requirements,
    plan: planSteps
  };
}

/**
 * Analizuje kod źródłowy
 * @param {object} params - Parametry
 * @param {string} params.code - Kod do analizy
 * @param {string} params.language - Język programowania (opcjonalnie)
 * @returns {Promise<object>} Wynik analizy
 */
async function analyzeCode(params) {
  const { code, language = 'javascript' } = params;
  
  if (!code) {
    throw new Error("Brak wymaganego parametru 'code'");
  }
  
  // Prosta analiza kodu
  const lines = code.split('\n');
  const linesOfCode = lines.filter(line => line.trim().length > 0).length;
  const comments = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
  }).length;
  
  // Wykrywanie funkcji (bardzo uproszczone)
  const functionPattern = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
  const arrowFunctionPattern = /const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g;
  
  let match;
  const functions = [];
  
  while ((match = functionPattern.exec(code)) !== null) {
    functions.push({ name: match[1], type: 'function' });
  }
  
  while ((match = arrowFunctionPattern.exec(code)) !== null) {
    functions.push({ name: match[1], type: 'arrow-function' });
  }
  
  // Wykrywanie klas (bardzo uproszczone)
  const classPattern = /class\s+([a-zA-Z0-9_]+)/g;
  const classes = [];
  
  while ((match = classPattern.exec(code)) !== null) {
    classes.push({ name: match[1] });
  }
  
  // Wykrywanie importów (bardzo uproszczone)
  const importPattern = /import\s+(?:{([^}]+)}|\s*([a-zA-Z0-9_]+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  
  while ((match = importPattern.exec(code)) !== null) {
    const importedItems = match[1] ? match[1].split(',').map(item => item.trim()) : [];
    const defaultImport = match[2];
    const source = match[3];
    
    imports.push({
      source,
      defaultImport: defaultImport || null,
      namedImports: importedItems
    });
  }
  
  return {
    language,
    metrics: {
      linesOfCode,
      comments,
      commentRatio: comments / linesOfCode,
      functionCount: functions.length,
      classCount: classes.length,
      importCount: imports.length
    },
    functions,
    classes,
    imports
  };
}

module.exports = {
  executeCode,
  generatePlan,
  analyzeCode
};
