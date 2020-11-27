//ошибка 400
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

//ошибка 401
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

//ошибка 403
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

//ошибка 404
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

//ошибка 409
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}




module.exports = { BadRequestError, UnauthorizedError, ForbiddenError, ConflictError ,NotFoundError };