/**
 * Model Context Protocol - Definicja schematu
 * 
 * Ten plik zawiera definicje schematów dla żądań i odpowiedzi MCP,
 * które są używane do walidacji komunikatów.
 */

const Joi = require('joi');

/**
 * Schemat żądania MCP
 */
const requestSchema = Joi.object({
  version: Joi.string().valid('1.0').required(),
  action: Joi.object({
    name: Joi.string().required(),
    parameters: Joi.object().default({})
  }).required()
});

/**
 * Schemat odpowiedzi MCP
 */
const responseSchema = Joi.object({
  version: Joi.string().valid('1.0').required(),
  status: Joi.string().valid('success', 'error').required(),
  result: Joi.when('status', {
    is: 'success',
    then: Joi.object().required(),
    otherwise: Joi.forbidden()
  }),
  error: Joi.when('status', {
    is: 'error',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  })
});

/**
 * Tworzy nowe żądanie MCP
 * @param {string} actionName - Nazwa akcji do wykonania
 * @param {object} parameters - Parametry akcji
 * @returns {object} Żądanie MCP
 */
function createRequest(actionName, parameters = {}) {
  const request = {
    version: '1.0',
    action: {
      name: actionName,
      parameters: parameters
    }
  };
  
  const validationResult = requestSchema.validate(request);
  if (validationResult.error) {
    throw new Error(`Nieprawidłowe żądanie MCP: ${validationResult.error.message}`);
  }
  
  return request;
}

/**
 * Tworzy odpowiedź sukcesu MCP
 * @param {object} result - Wynik operacji
 * @returns {object} Odpowiedź MCP
 */
function createSuccessResponse(result) {
  const response = {
    version: '1.0',
    status: 'success',
    result: result
  };
  
  const validationResult = responseSchema.validate(response);
  if (validationResult.error) {
    throw new Error(`Nieprawidłowa odpowiedź MCP: ${validationResult.error.message}`);
  }
  
  return response;
}

/**
 * Tworzy odpowiedź błędu MCP
 * @param {string} errorMessage - Komunikat błędu
 * @returns {object} Odpowiedź MCP
 */
function createErrorResponse(errorMessage) {
  const response = {
    version: '1.0',
    status: 'error',
    error: errorMessage
  };
  
  const validationResult = responseSchema.validate(response);
  if (validationResult.error) {
    throw new Error(`Nieprawidłowa odpowiedź MCP: ${validationResult.error.message}`);
  }
  
  return response;
}

/**
 * Waliduje żądanie MCP
 * @param {object} request - Żądanie do walidacji
 * @returns {boolean|string} True jeśli poprawne, komunikat błędu w przeciwnym przypadku
 */
function validateRequest(request) {
  const validationResult = requestSchema.validate(request);
  if (validationResult.error) {
    return validationResult.error.message;
  }
  return true;
}

/**
 * Waliduje odpowiedź MCP
 * @param {object} response - Odpowiedź do walidacji
 * @returns {boolean|string} True jeśli poprawne, komunikat błędu w przeciwnym przypadku
 */
function validateResponse(response) {
  const validationResult = responseSchema.validate(response);
  if (validationResult.error) {
    return validationResult.error.message;
  }
  return true;
}

module.exports = {
  requestSchema,
  responseSchema,
  createRequest,
  createSuccessResponse,
  createErrorResponse,
  validateRequest,
  validateResponse
};
