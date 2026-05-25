export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const throwError = (message: string, statusCode: number = 500) => {
  throw new AppError(message, statusCode);
};

// Common errors
export const errors = {
  notFound: (resource: string) => new AppError(`${resource} not found`, 404),
  unauthorized: () => new AppError('Unauthorized access', 401),
  forbidden: () => new AppError('Forbidden', 403),
  badRequest: (message: string) => new AppError(message, 400),
  conflict: (message: string) => new AppError(message, 409),
  serverError: (message: string) => new AppError(message, 500),
};
