/**
 * Model Context Protocol - Funkcje pomocnicze do walidacji
 * 
 * Ten plik zawiera funkcje pomocnicze do walidacji parametrów i wyników.
 */

/**
 * Sprawdza czy wartość jest zdefiniowana i nie jest null
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest zdefiniowana
 */
function isDefined(value) {
  return value !== undefined && value !== null;
}

/**
 * Sprawdza czy wartość jest obiektem
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest obiektem
 */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Sprawdza czy wartość jest tablicą
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest tablicą
 */
function isArray(value) {
  return Array.isArray(value);
}

/**
 * Sprawdza czy wartość jest stringiem
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest stringiem
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * Sprawdza czy wartość jest liczbą
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest liczbą
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Sprawdza czy wartość jest funkcją
 * @param {*} value - Wartość do sprawdzenia
 * @returns {boolean} Czy wartość jest funkcją
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Sprawdza wymagane parametry obiektu
 * @param {object} params - Obiekt parametrów
 * @param {string[]} requiredParams - Lista wymaganych parametrów
 * @returns {string|null} Komunikat błędu lub null jeśli wszystko jest ok
 */
function validateRequiredParams(params, requiredParams) {
  if (!isObject(params)) {
    return 'Parametry muszą być obiektem';
  }
  
  for (const param of requiredParams) {
    if (!isDefined(params[param])) {
      return `Brak wymaganego parametru '${param}'`;
    }
  }
  
  return null;
}

/**
 * Sprawdza typ parametru
 * @param {object} params - Obiekt parametrów
 * @param {string} paramName - Nazwa parametru
 * @param {string} expectedType - Oczekiwany typ
 * @param {boolean} isRequired - Czy parametr jest wymagany
 * @returns {string|null} Komunikat błędu lub null jeśli wszystko jest ok
 */
function validateParamType(params, paramName, expectedType, isRequired = true) {
  if (isRequired && !isDefined(params[paramName])) {
    return `Brak wymaganego parametru '${paramName}'`;
  }
  
  if (!isDefined(params[paramName])) {
    return null; // Parametr opcjonalny i niezdefiniowany
  }
  
  let isValid = false;
  
  switch (expectedType) {
    case 'string':
      isValid = isString(params[paramName]);
      break;
    case 'number':
      isValid = isNumber(params[paramName]);
      break;
    case 'object':
      isValid = isObject(params[paramName]);
      break;
    case 'array':
      isValid = isArray(params[paramName]);
      break;
    case 'function':
      isValid = isFunction(params[paramName]);
      break;
    default:
      isValid = typeof params[paramName] === expectedType;
  }
  
  if (!isValid) {
    return `Parametr '${paramName}' musi być typu ${expectedType}`;
  }
  
  return null;
}

/**
 * Sprawdza czy string ma minimalną długość
 * @param {string} value - Wartość do sprawdzenia
 * @param {number} minLength - Minimalna długość
 * @returns {boolean} Czy wartość ma minimalną długość
 */
function hasMinLength(value, minLength) {
  return isString(value) && value.length >= minLength;
}

/**
 * Sprawdza czy liczba jest w zakresie
 * @param {number} value - Wartość do sprawdzenia
 * @param {number} min - Minimalna wartość
 * @param {number} max - Maksymalna wartość
 * @returns {boolean} Czy wartość jest w zakresie
 */
function isInRange(value, min, max) {
  return isNumber(value) && value >= min && value <= max;
}

module.exports = {
  isDefined,
  isObject,
  isArray,
  isString,
  isNumber,
  isFunction,
  validateRequiredParams,
  validateParamType,
  hasMinLength,
  isInRange
};
