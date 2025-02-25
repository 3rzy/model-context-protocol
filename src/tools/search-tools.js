/**
 * Model Context Protocol - Narzędzia wyszukiwania
 * 
 * Ten plik zawiera implementacje narzędzi do wyszukiwania.
 */

const axios = require('axios');

/**
 * Wyszukuje repozytoria GitHub
 * @param {object} params - Parametry
 * @param {string} params.query - Zapytanie wyszukiwania
 * @param {number} params.perPage - Liczba wyników na stronę (opcjonalnie)
 * @returns {Promise<object>} Wyniki wyszukiwania
 */
async function searchRepositories(params) {
  const { query, perPage = 5 } = params;
  
  if (!query) {
    throw new Error("Brak wymaganego parametru 'query'");
  }
  
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: query,
        per_page: perPage
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Agent'
      }
    });
    
    const items = response.data.items.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count
    }));
    
    return {
      totalCount: response.data.total_count,
      items
    };
  } catch (error) {
    let errorMessage = 'Błąd podczas wyszukiwania repozytoriów';
    
    if (error.response) {
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ': brak odpowiedzi serwera';
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Wyszukuje kod w repozytoriach GitHub
 * @param {object} params - Parametry
 * @param {string} params.query - Zapytanie wyszukiwania
 * @param {number} params.perPage - Liczba wyników na stronę (opcjonalnie)
 * @returns {Promise<object>} Wyniki wyszukiwania
 */
async function searchCode(params) {
  const { query, perPage = 5 } = params;
  
  if (!query) {
    throw new Error("Brak wymaganego parametru 'query'");
  }
  
  try {
    const response = await axios.get('https://api.github.com/search/code', {
      params: {
        q: query,
        per_page: perPage
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Agent'
      }
    });
    
    const items = response.data.items.map(item => ({
      name: item.name,
      path: item.path,
      repository: item.repository.full_name,
      url: item.html_url
    }));
    
    return {
      totalCount: response.data.total_count,
      items
    };
  } catch (error) {
    let errorMessage = 'Błąd podczas wyszukiwania kodu';
    
    if (error.response) {
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ': brak odpowiedzi serwera';
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Wyszukuje informacje w sieci
 * @param {object} params - Parametry
 * @param {string} params.query - Zapytanie wyszukiwania
 * @returns {Promise<object>} Wyniki wyszukiwania
 */
async function searchWeb(params) {
  const { query } = params;
  
  if (!query) {
    throw new Error("Brak wymaganego parametru 'query'");
  }
  
  // Uwaga: To jest symulacja wyszukiwania w sieci
  // W rzeczywistej implementacji użylibyśmy API wyszukiwarki
  const mockResults = [
    {
      title: `Wyniki wyszukiwania dla: ${query}`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}`,
      snippet: `To jest przykładowy wynik wyszukiwania dla zapytania "${query}". W rzeczywistej implementacji, ten wynik pochodziłby z rzeczywistego API wyszukiwarki.`
    },
    {
      title: `${query} - Dokumentacja`,
      url: `https://docs.example.com/${encodeURIComponent(query.toLowerCase())}`,
      snippet: `Dokumentacja związana z "${query}". Tutaj znajdziesz szczegółowe informacje na ten temat.`
    },
    {
      title: `Tutorial: Jak używać ${query}`,
      url: `https://tutorial.example.com/${encodeURIComponent(query.toLowerCase())}`,
      snippet: `Szczegółowy tutorial pokazujący, jak efektywnie wykorzystać "${query}" w swoich projektach.`
    }
  ];
  
  // Symulacja opóźnienia sieci
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    query,
    totalResults: 42, // Przykładowa liczba wyników
    results: mockResults
  };
}

module.exports = {
  searchRepositories,
  searchCode,
  searchWeb
};
