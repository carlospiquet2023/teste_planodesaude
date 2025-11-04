/**
 * 🎯 RESPONSE HANDLER - Respostas Padronizadas
 * Elimina duplicação de código em rotas
 */

const { logger } = require('../middleware/logger');

class ResponseHandler {
  /**
   * Resposta de sucesso padrão
   */
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      ...data
    });
  }

  /**
   * Resposta de sucesso com mensagem
   */
  static successWithMessage(res, message, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data
    });
  }

  /**
   * Resposta de criação bem-sucedida
   */
  static created(res, resource, resourceName = 'recurso') {
    return res.status(201).json({
      success: true,
      message: `${resourceName} criado com sucesso`,
      [resourceName.toLowerCase()]: resource
    });
  }

  /**
   * Resposta de erro padrão
   */
  static error(res, message, statusCode = 500, details = null) {
    const isDev = process.env.NODE_ENV === 'development';
    
    const response = {
      success: false,
      error: message
    };

    if (isDev && details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de erro com logging
   */
  static errorWithLog(res, message, error, context = {}, statusCode = 500) {
    logger.error(message, {
      error: error.message || error,
      stack: error.stack,
      ...context
    });

    return this.error(
      res, 
      message, 
      statusCode, 
      process.env.NODE_ENV === 'development' ? error.message : null
    );
  }

  /**
   * Not Found (404)
   */
  static notFound(res, resource = 'Recurso') {
    return res.status(404).json({
      success: false,
      error: `${resource} não encontrado`
    });
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res, message) {
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res, message = 'Não autorizado') {
    return res.status(401).json({
      success: false,
      error: message
    });
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res, message = 'Acesso negado') {
    return res.status(403).json({
      success: false,
      error: message
    });
  }

  /**
   * Conflict (409)
   */
  static conflict(res, message) {
    return res.status(409).json({
      success: false,
      error: message
    });
  }

  /**
   * Unprocessable Entity (422)
   */
  static unprocessable(res, errors) {
    return res.status(422).json({
      success: false,
      error: 'Dados inválidos',
      errors
    });
  }

  /**
   * Resposta paginada
   */
  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      }
    });
  }

  /**
   * No Content (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }
}

/**
 * Wrapper para try-catch em routes
 */
function asyncRoute(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      ResponseHandler.errorWithLog(
        res,
        'Erro interno do servidor',
        err,
        {
          path: req.path,
          method: req.method,
          ip: req.ip
        }
      );
    });
  };
}

module.exports = { ResponseHandler, asyncRoute };
