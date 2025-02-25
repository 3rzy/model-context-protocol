/**
 * Model Context Protocol - Narzędzia do analizy tekstu
 * 
 * Ten plik zawiera implementacje narzędzi do analizy tekstu.
 */

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();

/**
 * Analizuje tekst i zwraca statystyki
 * @param {object} params - Parametry
 * @param {string} params.text - Tekst do analizy
 * @returns {Promise<object>} Statystyki tekstu
 */
async function analyzeText(params) {
  const { text } = params;
  
  if (!text) {
    throw new Error("Brak wymaganego parametru 'text'");
  }
  
  // Tokenizacja tekstu
  const words = tokenizer.tokenize(text);
  const sentences = sentenceTokenizer.tokenize(text);
  
  // Analiza częstotliwości słów
  const wordFrequency = {};
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'w', 'na', 'i', 'z', 'o', 'do', 'to'];
  
  words.forEach(word => {
    const normalized = word.toLowerCase();
    if (normalized.length > 2 && !stopWords.includes(normalized)) {
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    }
  });
  
  // Sortowanie słów według częstotliwości
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  // Obliczanie statystyk
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalChars = text.length;
  const averageWordLength = totalWords > 0 ? (words.join('').length / totalWords).toFixed(2) : 0;
  const averageSentenceLength = totalSentences > 0 ? (totalWords / totalSentences).toFixed(2) : 0;
  
  return {
    statistics: {
      sentenceCount: totalSentences,
      wordCount: totalWords,
      characterCount: totalChars,
      averageWordLength: parseFloat(averageWordLength),
      averageSentenceLength: parseFloat(averageSentenceLength)
    },
    topWords
  };
}

/**
 * Generuje podsumowanie tekstu
 * @param {object} params - Parametry
 * @param {string} params.text - Tekst do podsumowania
 * @param {number} params.maxLength - Maksymalna długość podsumowania (opcjonalnie)
 * @returns {Promise<object>} Podsumowanie tekstu
 */
async function summarizeText(params) {
  const { text, maxLength = 200 } = params;
  
  if (!text) {
    throw new Error("Brak wymaganego parametru 'text'");
  }
  
  // Tokenizacja tekstu na zdania
  const sentences = sentenceTokenizer.tokenize(text);
  
  // Bardzo prosty algorytm podsumowania - wybór najważniejszych zdań
  // W rzeczywistej implementacji użylibyśmy bardziej zaawansowanych technik NLP
  
  // Obliczamy "ważność" zdań na podstawie częstotliwości słów
  const wordFrequency = {};
  sentences.forEach(sentence => {
    const words = tokenizer.tokenize(sentence);
    words.forEach(word => {
      const normalized = word.toLowerCase();
      if (normalized.length > 3) {
        wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
      }
    });
  });
  
  // Oceniamy każde zdanie na podstawie ważności słów
  const sentenceScores = sentences.map(sentence => {
    const words = tokenizer.tokenize(sentence);
    let score = 0;
    
    words.forEach(word => {
      const normalized = word.toLowerCase();
      if (wordFrequency[normalized]) {
        score += wordFrequency[normalized];
      }
    });
    
    // Normalizacja wyniku przez długość zdania
    return {
      sentence,
      score: words.length > 0 ? score / words.length : 0
    };
  });
  
  // Sortujemy zdania według wyniku
  const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);
  
  // Wybieramy najważniejsze zdania, nie przekraczając maxLength
  let summary = '';
  let currentLength = 0;
  
  for (const { sentence } of sortedSentences) {
    if (currentLength + sentence.length + 1 <= maxLength || summary.length === 0) {
      summary += sentence + ' ';
      currentLength += sentence.length + 1;
    } else {
      break;
    }
  }
  
  return {
    summary: summary.trim(),
    length: summary.trim().length,
    compressionRatio: `${Math.round((summary.trim().length / text.length) * 100)}%`
  };
}

/**
 * Wyodrębnia encje z tekstu
 * @param {object} params - Parametry
 * @param {string} params.text - Tekst do analizy
 * @returns {Promise<object>} Wyodrębnione encje
 */
async function extractEntities(params) {
  const { text } = params;
  
  if (!text) {
    throw new Error("Brak wymaganego parametru 'text'");
  }
  
  // W rzeczywistej implementacji użylibyśmy zaawansowanych technik NER (Named Entity Recognition)
  // Tutaj implementujemy prosty mechanizm wykrywania na podstawie wzorców
  
  // Słowa kluczowe dla różnych kategorii
  const techKeywords = [
    'API', 'framework', 'language', 'library', 'platform', 'protocol', 'server',
    'client', 'database', 'cloud', 'AI', 'ML', 'model', 'algorithm', 'JavaScript',
    'Python', 'Java', 'C++', 'React', 'Node.js', 'MCP', 'REST'
  ];
  
  const conceptKeywords = [
    'concept', 'pattern', 'paradigm', 'architecture', 'design', 'structure',
    'service', 'module', 'component', 'abstraction', 'encapsulation', 'inheritance',
    'polymorphism', 'interface', 'schema', 'model', 'standard', 'convention'
  ];
  
  const processKeywords = [
    'process', 'workflow', 'pipeline', 'lifecycle', 'development', 'deployment',
    'integration', 'testing', 'validation', 'verification', 'authentication',
    'authorization', 'monitoring', 'logging', 'debugging', 'compilation'
  ];
  
  // Tokenizacja tekstu na słowa
  const words = tokenizer.tokenize(text);
  
  // Bigramy i trigramy
  const bigrams = [];
  const trigrams = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
    
    if (i < words.length - 2) {
      trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }
  
  // Funkcja do wykrywania encji w tekście
  function detectEntities(text, keywords) {
    const entities = new Set();
    const lowerText = text.toLowerCase();
    
    // Sprawdzanie słów kluczowych
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerText.includes(lowerKeyword)) {
        // Znajdź oryginalne wystąpienie w tekście
        const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'i');
        const match = text.match(regex);
        if (match) {
          entities.add(match[0]);
        }
      }
    });
    
    // Sprawdzanie ngrams
    [...words, ...bigrams, ...trigrams].forEach(gram => {
      if (gram.length > 2 && gram[0] === gram[0].toUpperCase() && !gram.includes('.')) {
        entities.add(gram);
      }
    });
    
    return Array.from(entities);
  }
  
  return {
    entities: {
      technologies: detectEntities(text, techKeywords),
      concepts: detectEntities(text, conceptKeywords),
      processes: detectEntities(text, processKeywords)
    }
  };
}

module.exports = {
  analyzeText,
  summarizeText,
  extractEntities
};
