class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UserNotFound extends ErrorResponse {
  constructor(message = "User not found") {
    super(message, 404);
  }
}

class UserAlreadyExists extends ErrorResponse {
  constructor(message = "User already exists") {
    super(message, 400);
  }
}

class InvalidCredentials extends ErrorResponse {
  constructor(message = "Invalid credentials") {
    super(message, 401);
  }
}

export default ErrorResponse;
export { UserNotFound, UserAlreadyExists, InvalidCredentials };