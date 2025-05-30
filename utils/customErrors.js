// utils/customErrors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado.') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud incorrecta.') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado.') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido.') {
    super(message, 403);
  }
}

class ConflictError extends AppError { // Añadido para casos como "ya existe"
  constructor(message = 'Conflicto de datos.') {
    super(message, 409);
  }
}

class ApplicationError extends AppError {
  constructor(message = 'Error interno del servidor.') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError, // Asegúrate de exportarlo
  ApplicationError,
};